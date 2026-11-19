"use server";

import { clientIp, isOverLimit, isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";

export interface CheckinResult {
  status: "ok" | "already" | "not_found" | "session_closed" | "rate_limited" | "error";
  message?: string;
  profile?: { nama: string; kampus: string };
  checkedInAt?: string;
}

// Only invalid lookups count: everyone scans the QR at the same moment from
// the same venue WiFi address, and each of those succeeds.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 90;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ParticipantRow {
  id: string;
  nama_lengkap: string;
  masjid_kampus: { nama: string } | null;
}

/** Marks the participant picked from the name search as present for the session. */
export async function checkInSelf(sessionId: string, participantId: string): Promise<CheckinResult> {
  if (!UUID_PATTERN.test(sessionId) || !UUID_PATTERN.test(participantId)) {
    return { status: "error", message: "Pilih nama Anda dari daftar." };
  }

  const failureKey = `presensi:${await clientIp()}`;
  if (isOverLimit(failureKey, RATE_LIMIT_MAX_FAILURES)) {
    return { status: "rate_limited", message: "Terlalu banyak percobaan. Silakan tunggu beberapa menit dan coba lagi." };
  }

  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("event_sessions")
    .select("id, is_active")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    return { status: "error", message: "Sesi tidak ditemukan." };
  }
  if (!session.is_active) {
    return { status: "session_closed", message: "Presensi untuk sesi ini belum dibuka oleh panitia." };
  }

  const { data: participant } = await supabase
    .from("participants")
    .select("id, nama_lengkap, masjid_kampus(nama)")
    .eq("id", participantId)
    .eq("status", "approved")
    .maybeSingle<ParticipantRow>();

  if (!participant) {
    isRateLimited(failureKey, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_FAILURES);
    return {
      status: "not_found",
      message: "Nama tidak ditemukan atau belum disetujui panitia. Hubungi panitia jika ini keliru.",
    };
  }

  const profile = {
    nama: participant.nama_lengkap,
    kampus: participant.masjid_kampus?.nama ?? "-",
  };

  const { data: inserted, error } = await supabase
    .from("session_attendances")
    .insert({ session_id: sessionId, participant_id: participant.id, method: "qr" })
    .select("checked_in_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("session_attendances")
        .select("checked_in_at")
        .eq("session_id", sessionId)
        .eq("participant_id", participant.id)
        .single();
      return {
        status: "already",
        message: "Anda sudah tercatat hadir pada sesi ini.",
        profile,
        checkedInAt: existing?.checked_in_at,
      };
    }
    return { status: "error", message: error.message, profile };
  }

  return { status: "ok", profile, checkedInAt: inserted.checked_in_at };
}
