"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { RegistrationType } from "@/lib/types";

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

  const supabase = createAdminClient();

  // Kategori is no longer a self-service choice — every registrant starts as
  // peserta_penuh and panitia curates the real category (incl. downgrading
  // to peninjau) when approving in /admin.
  const { error } = await supabase.rpc("register_participant", {
    p_registration_type: registrationType,
    p_invited_guest_id: registrationType === "invited" ? readField(formData, "invitedGuestId") : null,
    p_nama_lengkap: readField(formData, "namaLengkap"),
    p_email: readField(formData, "email"),
    p_no_hp: readField(formData, "noHp"),
    p_jabatan: readField(formData, "jabatan"),
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

  return { status: "success" };
}
