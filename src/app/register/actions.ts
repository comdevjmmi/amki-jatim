"use server";

import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";
import type { RegistrationType } from "@/lib/types";

export interface GuestPrefill {
  noHp: string;
  email: string;
  /** The stored email is an institutional address used by other guests too, so it was left blank. */
  emailShared: boolean;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /[^\s/]+@[^\s/]+\.[^\s/]+/;
const PHONE_PATTERN = /\+?\d[\d\s-]{7,}\d/;
const PREFILL_WINDOW_MS = 10 * 60 * 1000;
const PREFILL_MAX_ATTEMPTS = 60;

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * Looks up the WhatsApp/email panitia stored for an invited guest so the
 * check-in form can be pre-filled for the guest to review. Only returns data
 * for guests who haven't checked in yet, and is rate-limited per IP since
 * guest ids are visible in the public search.
 *
 * Emails in the source sheet are mostly campus/masjid addresses shared by
 * several guests (e.g. one humas@ address for 8 students). participants.email
 * is unique and /cek-token finds a participant by email, so a shared address
 * is NOT pre-filled — the guest enters a personal one instead.
 */
export async function getGuestPrefill(guestId: string): Promise<GuestPrefill | null> {
  if (!UUID_PATTERN.test(guestId)) return null;

  const ip = await clientIp();
  if (isRateLimited(`register-prefill:${ip}`, PREFILL_WINDOW_MS, PREFILL_MAX_ATTEMPTS)) return null;

  const supabase = createAdminClient();
  const { data: guest } = await supabase
    .from("invited_guests")
    .select("contact, is_claimed")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest || guest.is_claimed) return null;

  const contact = guest.contact ?? "";
  const email = contact.match(EMAIL_PATTERN)?.[0].toLowerCase() ?? "";
  const noHp = contact.replace(email, "").match(PHONE_PATTERN)?.[0].replace(/\s+/g, "") ?? "";

  if (!email) return { noHp, email: "", emailShared: false };

  const [guestsCheck, participantsCheck] = await Promise.all([
    supabase
      .from("invited_guests")
      .select("id", { count: "exact", head: true })
      .ilike("contact", `%${escapeLike(email)}%`),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .ilike("email", escapeLike(email)),
  ]);

  // If either check fails we can't tell whether the address is taken, so
  // treat it as shared and leave it blank rather than risk a duplicate.
  const shared =
    guestsCheck.error !== null ||
    participantsCheck.error !== null ||
    (guestsCheck.count ?? 0) > 1 ||
    (participantsCheck.count ?? 0) > 0;
  return { noHp, email: shared ? "" : email, emailShared: shared };
}

export interface RegisterState {
  status: "idle" | "success" | "error";
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVITED_GUEST_REQUIRED: "Silakan pilih nama Anda dari daftar tamu undangan.",
  INVITED_GUEST_ALREADY_CLAIMED:
    "Data tamu undangan ini baru saja diklaim orang lain. Silakan cari ulang, atau daftar sebagai Perwakilan / Delegasi Baru.",
  NAMA_REQUIRED: "Nama lengkap wajib diisi.",
  CAMPUS_REQUIRED: "Nama Masjid Kampus wajib diisi.",
  EMAIL_REQUIRED: "Email wajib diisi.",
  NO_HP_REQUIRED: "Nomor WhatsApp wajib diisi.",
  INVALID_REGISTRATION_TYPE: "Tipe registrasi tidak valid.",
  INVALID_JABATAN: "Pilih Mahasiswa atau Dosen.",
};

function readField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function registerParticipant(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const registrationType = readField(formData, "registrationType") as RegistrationType | null;

  if (registrationType !== "invited" && registrationType !== "representative") {
    return { status: "error", message: ERROR_MESSAGES.INVALID_REGISTRATION_TYPE };
  }

  const jabatan = readField(formData, "jabatan");
  if (registrationType === "representative" && jabatan !== "Mahasiswa" && jabatan !== "Dosen") {
    return { status: "error", message: ERROR_MESSAGES.INVALID_JABATAN };
  }

  const supabase = createAdminClient();

  // Kategori is no longer a self-service choice — every registrant starts as
  // peserta_penuh and panitia curates the real category (incl. downgrading
  // to peninjau) when approving in /admin.
  const { data: participant, error } = await supabase.rpc("register_participant", {
    p_registration_type: registrationType,
    p_invited_guest_id: registrationType === "invited" ? readField(formData, "invitedGuestId") : null,
    p_nama_lengkap: readField(formData, "namaLengkap"),
    p_email: readField(formData, "email"),
    p_no_hp: readField(formData, "noHp"),
    p_jabatan: jabatan,
    p_kategori: "peserta_penuh",
    p_kampus_nama: readField(formData, "kampusNama"),
    p_kampus_kota: readField(formData, "kampusKota"),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Email ini sudah terdaftar sebagai peserta.",
      };
    }

    return {
      status: "error",
      message: ERROR_MESSAGES[error.message] ?? "Terjadi kesalahan, silakan coba lagi.",
    };
  }

  // The guest may have corrected the pre-filled WhatsApp/email at check-in;
  // write the final values back so Tamu Undangan matches the participant.
  // Best-effort: the check-in itself already succeeded.
  if (registrationType === "invited" && participant) {
    const invitedGuestId = readField(formData, "invitedGuestId");
    if (invitedGuestId) {
      const { error: syncError } = await supabase
        .from("invited_guests")
        .update({ contact: `${participant.no_hp} / ${participant.email}` })
        .eq("id", invitedGuestId);
      if (syncError) console.error("invited_guests contact sync failed:", syncError.message);
    }
  }

  return { status: "success" };
}
