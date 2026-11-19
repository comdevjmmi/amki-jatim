"use server";

import { parseGuestContact } from "@/lib/guest-contact";
import { maskEmail } from "@/lib/mask";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";
import type { RegistrationType } from "@/lib/types";

export interface RegisterState {
  status: "idle" | "success" | "error";
  message?: string;
}

/** WhatsApp number to pre-fill, plus a masked hint of the stored email. */
export interface GuestPrefill {
  noHp: string | null;
  emailMasked: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WINDOW_MS = 10 * 60 * 1000;
// Every check-in at the hall makes one prefill call, and the whole venue can
// share one public IP, so this has to leave room for the registration rush.
const PREFILL_MAX_ATTEMPTS = 120;

const ERROR_MESSAGES: Record<string, string> = {
  INVITED_GUEST_REQUIRED: "Silakan pilih nama Anda dari daftar tamu undangan.",
  INVITED_GUEST_ALREADY_CLAIMED:
    "Data tamu undangan ini baru saja diklaim orang lain. Silakan cari ulang, atau daftar sebagai Perwakilan / Delegasi Baru.",
  NAMA_REQUIRED: "Nama lengkap wajib diisi.",
  CAMPUS_REQUIRED: "Nama Masjid Kampus wajib diisi.",
  NO_HP_REQUIRED: "Nomor WhatsApp wajib diisi dengan benar.",
  INVALID_REGISTRATION_TYPE: "Tipe registrasi tidak valid.",
  INVALID_JABATAN: "Pilih Mahasiswa atau Dosen.",
};

function readField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Stored WhatsApp number (to pre-fill) and a masked email hint for the guest
 * picked in the check-in form. The guest reviews and can correct them; panitia
 * verify identity in person at the entrance. Rate-limited per IP since guest
 * ids are visible in the public search; only returns data for guests who
 * haven't checked in yet.
 */
export async function getGuestPrefill(guestId: string): Promise<GuestPrefill | null> {
  if (!UUID_PATTERN.test(guestId)) return null;

  const ip = await clientIp();
  if (isRateLimited(`register-prefill:${ip}`, WINDOW_MS, PREFILL_MAX_ATTEMPTS)) return null;

  const supabase = createAdminClient();
  const { data: guest } = await supabase
    .from("invited_guests")
    .select("contact, is_claimed")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest || guest.is_claimed) return null;

  const { phone, email } = parseGuestContact(guest.contact);
  return {
    noHp: phone || null,
    emailMasked: email ? maskEmail(email) : null,
  };
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
  const noHp = readField(formData, "noHp");
  let email = readField(formData, "email");
  const invitedGuestId = registrationType === "invited" ? readField(formData, "invitedGuestId") : null;

  if (registrationType === "invited") {
    if (!invitedGuestId || !UUID_PATTERN.test(invitedGuestId)) {
      return { status: "error", message: ERROR_MESSAGES.INVITED_GUEST_REQUIRED };
    }

    const { data: guest } = await supabase
      .from("invited_guests")
      .select("contact")
      .eq("id", invitedGuestId)
      .maybeSingle();
    const stored = parseGuestContact(guest?.contact);

    // Email is optional; if left blank, keep the one panitia already has.
    email = email ?? (stored.email || null);
  }

  // Kategori is no longer a self-service choice — every registrant starts as
  // peserta_penuh and panitia curates the real category (incl. downgrading
  // to peninjau) when approving in /admin.
  const { data: participant, error } = await supabase.rpc("register_participant", {
    p_registration_type: registrationType,
    p_invited_guest_id: invitedGuestId,
    p_nama_lengkap: readField(formData, "namaLengkap"),
    p_email: email,
    p_no_hp: noHp,
    p_jabatan: jabatan,
    p_kategori: "peserta_penuh",
    p_kampus_nama: readField(formData, "kampusNama"),
    p_kampus_kota: readField(formData, "kampusKota"),
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Nomor WhatsApp ini sudah terdaftar sebagai peserta. Hubungi panitia jika ini keliru.",
      };
    }

    return {
      status: "error",
      message: ERROR_MESSAGES[error.message] ?? "Terjadi kesalahan, silakan coba lagi.",
    };
  }

  // Keep Tamu Undangan's contact in step with what the guest confirmed (e.g.
  // an email they filled in). Best-effort: the check-in already succeeded.
  if (registrationType === "invited" && participant && invitedGuestId) {
    const contact = participant.email ? `${participant.no_hp} / ${participant.email}` : participant.no_hp;
    const { error: syncError } = await supabase
      .from("invited_guests")
      .update({ contact })
      .eq("id", invitedGuestId);
    if (syncError) console.error("invited_guests contact sync failed:", syncError.message);
  }

  return { status: "success" };
}
