"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { maskName, normalizePhone } from "@/lib/mask";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
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

// Double-verification lookup, so brute-forcing is worth rate-limiting hard —
// this is a data-matching endpoint, not a token-spending one, so the window
// is tighter than castVote's.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

export async function safeTokenLookup(email: string, whatsapp: string): Promise<TokenLookupResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(whatsapp);
  if (!normalizedEmail || !normalizedPhone) {
    return { status: "error", message: "Email dan Nomor WhatsApp wajib diisi." };
  }

  const ip = await clientIp();
  if (isRateLimited(`cek-token:${ip}`, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_ATTEMPTS)) {
    return { status: "rate_limited", message: "Terlalu banyak percobaan. Silakan tunggu beberapa menit dan coba lagi." };
  }

  const supabase = createAdminClient();
  const { data: participant } = await supabase
    .from("participants")
    .select("id, nama_lengkap, no_hp, kategori, status, masjid_kampus(nama)")
    .ilike("email", normalizedEmail)
    .maybeSingle<{
      id: string;
      nama_lengkap: string;
      no_hp: string;
      kategori: string;
      status: string;
      masjid_kampus: { nama: string } | null;
    }>();

  // Same generic message whether the email doesn't exist or the WhatsApp
  // number doesn't match — this is the second verification factor, so a
  // mismatch must not reveal which part was wrong.
  if (!participant || normalizePhone(participant.no_hp) !== normalizedPhone) {
    return { status: "not_found", message: "Data tidak ditemukan. Periksa kembali Email dan Nomor WhatsApp Anda." };
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
