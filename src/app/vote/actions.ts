"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { hashVoteToken } from "@/lib/vote-token";

export interface CastVoteResult {
  status: "success" | "error";
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  VOTING_CLOSED: "Sesi pemilihan sudah ditutup.",
  INVALID_OR_USED_TOKEN: "Token tidak valid atau sudah pernah digunakan.",
  INVALID_CANDIDATE: "Kandidat tidak ditemukan.",
};

// Audit Finding A: 8-char tokens (~1.1T combos) are hard to guess blind, but
// an unrate-limited endpoint still lets a script grind through them.
// The threshold is generous (not per-token-attempt-strict) because a venue
// full of voters on one WiFi NAT can share a single public IP, and each
// legitimate voter only ever submits once or twice.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 30;

// Deliberately a single atomic RPC call — no separate "check token" step, so
// there's no way to probe which tokens are valid without spending them.
export async function castVote(token: string, candidateId: string): Promise<CastVoteResult> {
  if (!token.trim() || !candidateId) {
    return { status: "error", message: "Token dan kandidat wajib diisi." };
  }

  const ip = await clientIp();
  if (isRateLimited(`vote:${ip}`, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_ATTEMPTS)) {
    return {
      status: "error",
      message: "Terlalu banyak percobaan. Silakan tunggu beberapa menit dan coba lagi.",
    };
  }

  const tokenHash = await hashVoteToken(token);
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("cast_vote", {
    p_token_hash: tokenHash,
    p_candidate_id: candidateId,
  });

  if (error) {
    return {
      status: "error",
      message: ERROR_MESSAGES[error.message] ?? "Terjadi kesalahan, silakan coba lagi.",
    };
  }

  revalidatePath("/vote");
  return { status: "success" };
}
