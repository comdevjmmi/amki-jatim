"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { generateVoteToken, hashVoteToken } from "@/lib/vote-token";

export interface GenerateTokenResult {
  status: "ok" | "error";
  token?: string;
  message?: string;
}

const MAX_ATTEMPTS = 5;

export async function generateVotingToken(participantId: string): Promise<GenerateTokenResult> {
  await requireAdminSession();

  const supabase = createAdminClient();

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, kategori, status")
    .eq("id", participantId)
    .single();

  if (participantError || !participant) {
    return { status: "error", message: "Peserta tidak ditemukan." };
  }
  if (participant.kategori !== "peserta_penuh" || participant.status !== "approved") {
    return {
      status: "error",
      message: "Token hanya bisa dibuat untuk Peserta Penuh yang berstatus Approved.",
    };
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const token = generateVoteToken();
    const tokenHash = await hashVoteToken(token);

    const { error } = await supabase
      .from("voting_tokens")
      .insert({ participant_id: participantId, token_hash: tokenHash });

    if (!error) {
      revalidatePath("/admin/tokens");
      return { status: "ok", token };
    }

    if (error.code !== "23505") {
      return { status: "error", message: error.message };
    }
    // Unique violation on participant_id (not token_hash) means this
    // participant already has a token — retrying won't help.
    if (error.message.includes("participant_id")) {
      return { status: "error", message: "Peserta ini sudah memiliki token." };
    }
    // Otherwise it's a token_hash collision (astronomically unlikely at this
    // scale) — loop and try a fresh random token.
  }

  return { status: "error", message: "Gagal membuat token unik, coba lagi." };
}

export interface RevokeTokenResult {
  status: "ok" | "error";
  message?: string;
}

export async function revokeVotingToken(participantId: string): Promise<RevokeTokenResult> {
  await requireAdminSession();

  const supabase = createAdminClient();
  // is_used = false guard means an already-spent token can never be revoked
  // this way — that would let the participant get a fresh token and vote a
  // second time.
  const { error, count } = await supabase
    .from("voting_tokens")
    .delete({ count: "exact" })
    .eq("participant_id", participantId)
    .eq("is_used", false);

  if (error) {
    return { status: "error", message: error.message };
  }
  if (!count) {
    return { status: "error", message: "Token sudah terpakai atau tidak ditemukan, tidak bisa dibatalkan." };
  }

  revalidatePath("/admin/tokens");
  return { status: "ok" };
}
