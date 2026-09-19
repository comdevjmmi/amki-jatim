"use server";

import { maskName, normalizePhone } from "@/lib/mask";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/server";

export interface CheckinResult {
  status: "ok" | "already" | "not_found" | "session_closed" | "rate_limited" | "error";
  message?: string;
  profile?: { nama: string; kampus: string };
  checkedInAt?: string;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 20;

interface ParticipantRow {
  id: string;
  nama_lengkap: string;
  no_hp: string;
  masjid_kampus: { nama: string } | null;
}

export async function checkInSelf(sessionId: string, whatsapp: string): Promise<CheckinResult> {
  const normalizedPhone = normalizePhone(whatsapp);
  if (!normalizedPhone) {
    return { status: "error", message: "Nomor WhatsApp wajib diisi." };
  }

  const ip = await clientIp();
  if (isRateLimited(`presensi:${ip}`, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_ATTEMPTS)) {
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

  // no_hp isn't unique/normalized in the DB (free-text at registration), so
  // matching happens in-memory against the approved list — a few hundred
  // rows at most for this event, well within a single query's cost.
  const { data: participants } = await supabase
    .from("participants")
    .select("id, nama_lengkap, no_hp, masjid_kampus(nama)")
    .eq("status", "approved")
    .returns<ParticipantRow[]>();

  const participant = (participants ?? []).find((p) => normalizePhone(p.no_hp) === normalizedPhone);

  if (!participant) {
    return {
      status: "not_found",
      message: "Nomor WhatsApp tidak ditemukan. Pastikan Anda sudah terdaftar dan disetujui panitia.",
    };
  }

  const profile = {
    nama: maskName(participant.nama_lengkap),
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
