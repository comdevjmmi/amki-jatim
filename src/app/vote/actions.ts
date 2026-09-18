"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
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

// Deliberately a single atomic RPC call — no separate "check token" step, so
// there's no way to probe which tokens are valid without spending them.
export async function castVote(token: string, candidateId: string): Promise<CastVoteResult> {
  if (!token.trim() || !candidateId) {
    return { status: "error", message: "Token dan kandidat wajib diisi." };
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
