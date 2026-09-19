"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

function readField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function upsertCandidate(formData: FormData) {
  await requireAdminSession();

  const id = readField(formData, "id");
  const nama = readField(formData, "nama");
  if (!nama) return;

  const nomorUrutRaw = readField(formData, "nomorUrut");
  let nomorUrut: number | null = null;
  if (nomorUrutRaw !== null) {
    const parsed = Number(nomorUrutRaw);
    if (!Number.isInteger(parsed) || parsed < 1) return;
    nomorUrut = parsed;
  }

  const payload = {
    nama,
    asal_kampus: readField(formData, "asalKampus"),
    nomor_urut: nomorUrut,
    foto_url: readField(formData, "fotoUrl"),
    visi_misi: readField(formData, "visiMisi"),
    updated_at: new Date().toISOString(),
  };

  const supabase = createAdminClient();
  if (id) {
    await supabase.from("candidates").update(payload).eq("id", id);
  } else {
    await supabase.from("candidates").insert(payload);
  }

  revalidatePath("/admin/candidates");
  revalidatePath("/vote");
}

export interface DeleteCandidateResult {
  status: "ok" | "error";
  message?: string;
}

export async function deleteCandidate(candidateId: string): Promise<DeleteCandidateResult> {
  await requireAdminSession();

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("candidate_id", candidateId);

  if (count && count > 0) {
    return {
      status: "error",
      message: `Tidak bisa dihapus — kandidat ini sudah menerima ${count} suara.`,
    };
  }

  const { error } = await supabase.from("candidates").delete().eq("id", candidateId);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/candidates");
  revalidatePath("/vote");
  return { status: "ok" };
}
