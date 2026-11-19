"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { maskName, normalizePhone } from "@/lib/mask";
import { clientIp, isOverLimit, isRateLimited } from "@/lib/rate-limit";
import { generateVoteToken, hashVoteToken } from "@/lib/vote-token";

export interface TokenLookupResult {
  status:
    | "not_found"
    | "not_approved"
    | "peninjau"
    | "ready"
    | "already_used"
    | "rate_limited"
    | "error";
  message?: string;
  profile?: { nama: string; kampus: string };
  token?: string;
  usedAt?: string;
}

// The WhatsApp number is the only factor, so rate-limiting is what keeps
// someone from sweeping number ranges. Only *failed* lookups (number not
// registered) count: a hall full of voters on one WiFi address all succeed
// and must not throttle each other, while a sweep is almost all failures.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_FAILURES = 90;

export async function safeTokenLookup(whatsapp: string): Promise<TokenLookupResult> {
  const normalizedPhone = normalizePhone(whatsapp);
  if (normalizedPhone.length < 9) {
    return { status: "error", message: "Nomor WhatsApp wajib diisi." };
  }

  const failureKey = `cek-token:${await clientIp()}`;
  if (isOverLimit(failureKey, RATE_LIMIT_MAX_FAILURES)) {
    return { status: "rate_limited", message: "Terlalu banyak percobaan. Silakan tunggu beberapa menit dan coba lagi." };
  }

  const supabase = createAdminClient();
  // participants.no_hp_norm is a unique, generated copy of no_hp in the same
  // normalized form as normalizePhone(), so this is an exact-match lookup.
  const { data: participant } = await supabase
    .from("participants")
    .select("id, nama_lengkap, no_hp, kategori, status, masjid_kampus(nama)")
    .eq("no_hp_norm", normalizedPhone)
    .maybeSingle<{
      id: string;
      nama_lengkap: string;
      no_hp: string;
      kategori: string;
      status: string;
      masjid_kampus: { nama: string } | null;
    }>();

  if (!participant) {
    isRateLimited(failureKey, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_FAILURES);
    return {
      status: "not_found",
      message: "Nomor WhatsApp tidak ditemukan. Pastikan Anda sudah konfirmasi hadir di /register dengan nomor ini.",
    };
  }

  const profile = {
    nama: maskName(participant.nama_lengkap),
    kampus: participant.masjid_kampus?.nama ?? "-",
  };

  if (participant.status !== "approved") {
    return {
      status: "not_approved",
      message:
        participant.status === "pending"
          ? "Status registrasi Anda masih Pending. Silakan tunggu verifikasi panitia."
          : "Registrasi Anda ditolak panitia. Hubungi panitia untuk informasi lebih lanjut.",
      profile,
    };
  }

  if (participant.kategori !== "peserta_penuh") {
    return {
      status: "peninjau",
      message: "Anda terdaftar sebagai Peninjau. Kategori ini tidak memiliki hak suara pada pemilihan Ketua.",
      profile,
    };
  }

  const { data: existingToken } = await supabase
    .from("voting_tokens")
    .select("id, is_used, used_at")
    .eq("participant_id", participant.id)
    .maybeSingle();

  if (existingToken?.is_used) {
    return {
      status: "already_used",
      message: "Suara Anda sudah tercatat sah dan tidak dapat diubah.",
      profile,
      usedAt: existingToken.used_at ?? undefined,
    };
  }

  // No token yet, or an unused one from a previous admin-side generation —
  // either way we (re)issue here, since only the hash is ever stored and an
  // unused token has no vote tied to it yet, so replacing it is safe.
  if (existingToken) {
    await supabase.from("voting_tokens").delete().eq("id", existingToken.id);
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateVoteToken();
    const tokenHash = await hashVoteToken(token);
    const { error } = await supabase
      .from("voting_tokens")
      .insert({ participant_id: participant.id, token_hash: tokenHash });

    if (!error) {
      return { status: "ready", profile, token };
    }
    if (error.code !== "23505") {
      return { status: "error", message: error.message, profile };
    }
    // token_hash collision (astronomically unlikely) — loop and retry.
  }

  return { status: "error", message: "Gagal membuat token, silakan coba lagi.", profile };
}
