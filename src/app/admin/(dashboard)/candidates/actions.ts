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

export interface UploadPhotoResult {
  status: "ok" | "error";
  url?: string;
  message?: string;
}

const PHOTO_BUCKET = "candidate-photos";
// The browser shrinks photos to ~800px before uploading, so a real upload is
// a couple hundred KB; this is just a guard against anything else.
const PHOTO_MAX_BYTES = 1_500_000;

function detectImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

/** Uploads a candidate photo to the public candidate-photos bucket and returns its URL. */
export async function uploadCandidatePhoto(formData: FormData): Promise<UploadPhotoResult> {
  await requireAdminSession();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Pilih file foto terlebih dahulu." };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { status: "error", message: "Ukuran foto terlalu besar." };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  // Trust the file's real header, not the type the browser claims.
  const type = detectImageType(buffer);
  if (!type) {
    return { status: "error", message: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." };
  }

  const supabase = createAdminClient();
  const path = `${crypto.randomUUID()}.${type.ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, buffer, { contentType: type.mime, cacheControl: "31536000", upsert: false });

  if (error) {
    return { status: "error", message: `Gagal mengunggah foto: ${error.message}` };
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return { status: "ok", url: data.publicUrl };
}
