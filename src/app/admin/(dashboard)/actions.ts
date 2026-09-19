"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function updateParticipantStatus(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  const status = formData.get("status");

  if (typeof id !== "string" || (status !== "approved" && status !== "rejected")) return;

  const supabase = createAdminClient();
  await supabase
    .from("participants")
    .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/admin");
}

function readField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface UpdateParticipantResult {
  status: "ok" | "error";
  message?: string;
}

export async function updateParticipant(formData: FormData): Promise<UpdateParticipantResult> {
  await requireAdminSession();

  const id = formData.get("id");
  const namaLengkap = readField(formData, "namaLengkap");
  const jabatan = readField(formData, "jabatan");
  const kategori = formData.get("kategori");
  const masjidKampusId = readField(formData, "masjidKampusId");
  const email = readField(formData, "email");
  const noHp = readField(formData, "noHp");

  if (typeof id !== "string" || !namaLengkap || !jabatan || !email || !noHp) {
    return { status: "error", message: "Semua field wajib diisi." };
  }
  if (kategori !== "peserta_penuh" && kategori !== "peninjau") {
    return { status: "error", message: "Kategori tidak valid." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .update({
      nama_lengkap: namaLengkap,
      jabatan,
      kategori,
      masjid_kampus_id: masjidKampusId,
      email,
      no_hp: noHp,
    })
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Email ini sudah dipakai peserta lain." : error.message,
    };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}

export async function deleteParticipant(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const supabase = createAdminClient();

  const { data: participant } = await supabase
    .from("participants")
    .select("invited_guest_id")
    .eq("id", id)
    .single();

  await supabase.from("participants").delete().eq("id", id);

  // Free up the invited-guest slot so someone else can claim it, instead of
  // it staying permanently locked to a now-deleted registration.
  if (participant?.invited_guest_id) {
    await supabase
      .from("invited_guests")
      .update({ is_claimed: false, claimed_at: null })
      .eq("id", participant.invited_guest_id);
  }

  revalidatePath("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
