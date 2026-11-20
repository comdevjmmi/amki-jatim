"use server";

import { parseGuestContact } from "@/lib/guest-contact";
import { maskEmail, maskPhone, normalizePhone } from "@/lib/mask";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";
import type { RegistrationType } from "@/lib/types";

export interface RegisterState {
  status: "idle" | "success" | "error";
  message?: string;
}

/** What panitia have on file for a guest, with WhatsApp/email masked. */
export interface GuestInfo {
  kampus: string;
  kalangan: string;
  kota: string | null;
  noHpMasked: string | null;
  emailMasked: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WINDOW_MS = 10 * 60 * 1000;
// Every check-in at the hall makes one info call, and the whole venue can
// share one public IP, so this has to leave room for the registration rush.
const INFO_MAX_ATTEMPTS = 120;

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

function maskStoredPhone(raw: string | null | undefined): string | null {
  const digits = normalizePhone(raw ?? "");
  if (!digits) return null;
  // Show in local form (08xx) like people write it.
  return maskPhone(digits.startsWith("62") ? `0${digits.slice(2)}` : digits);
}

/**
 * Read-only details shown under the selected name in the check-in form.
 * WhatsApp/email are masked; nothing here is editable by the guest, and panitia
 * verify identity at the door. Rate-limited per IP since ids are visible in
 * the public search.
 */
export async function getGuestInfo(
  id: string,
  source: "invited" | "representative",
): Promise<GuestInfo | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const ip = await clientIp();
  if (isRateLimited(`register-info:${ip}`, WINDOW_MS, INFO_MAX_ATTEMPTS)) return null;

  const supabase = createAdminClient();

  if (source === "representative") {
    const { data } = await supabase
      .from("participants")
      .select("jabatan, no_hp, email, masjid_kampus(nama, kota)")
      .eq("id", id)
      .eq("registration_type", "representative")
      .maybeSingle();
    if (!data) return null;
    const mk = Array.isArray(data.masjid_kampus) ? data.masjid_kampus[0] : data.masjid_kampus;
    return {
      kampus: mk?.nama ?? "",
      kalangan: data.jabatan ?? "",
      kota: mk?.kota && mk.kota !== "N/A" ? mk.kota : null,
      noHpMasked: maskStoredPhone(data.no_hp),
      emailMasked: data.email ? maskEmail(data.email) : null,
    };
  }

  const { data: guest } = await supabase
    .from("invited_guests")
    .select("campus_name, title, kota, contact")
    .eq("id", id)
    .maybeSingle();
  if (!guest) return null;

  const { phone, email } = parseGuestContact(guest.contact);
  return {
    kampus: guest.campus_name,
    kalangan: guest.title,
    kota: guest.kota || null,
    noHpMasked: maskStoredPhone(phone),
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
  let noHp = readField(formData, "noHp");
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

    // WhatsApp/email are not typed at check-in: the number panitia hold is the
    // participant's identity, and fixes go through panitia in /admin.
    if (!stored.phone) {
      return {
        status: "error",
        message: "Nomor WhatsApp Anda belum tercatat. Silakan hubungi panitia untuk konfirmasi kehadiran.",
      };
    }
    noHp = stored.phone;
    email = stored.email || null;
  }

  // Kategori is no longer a self-service choice — every registrant starts as
  // peserta_penuh and panitia curates the real category (incl. downgrading
  // to peninjau) when approving in /admin.
  const { error } = await supabase.rpc("register_participant", {
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

  return { status: "success" };
}
