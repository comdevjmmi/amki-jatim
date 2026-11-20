"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { PIC_COUNT } from "@/lib/group-invite";
import { createAdminClient } from "@/lib/supabase/server";

export interface GuestActionResult {
  status: "ok" | "error";
  message?: string;
}

function readField(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** PIC dengan tamu paling sedikit, supaya tamu baru terbagi rata. */
async function leastLoadedPic(supabase: ReturnType<typeof createAdminClient>): Promise<number> {
  const { data } = await supabase.from("invited_guests").select("pic");
  const counts = Array.from({ length: PIC_COUNT }, () => 0);
  for (const row of data ?? []) if (row.pic) counts[row.pic - 1]++;
  return counts.indexOf(Math.min(...counts)) + 1;
}

export async function updateInvitedGuest(formData: FormData): Promise<GuestActionResult> {
  await requireAdminSession();

  const id = readField(formData, "id");
  const fullName = readField(formData, "fullName");
  const campusName = readField(formData, "campusName");
  const title = readField(formData, "title");
  const contact = readField(formData, "contact");
  const kota = readField(formData, "kota");

  if (!id) return { status: "error", message: "Data tamu tidak valid." };
  if (!fullName || !campusName) return { status: "error", message: "Nama dan kampus wajib diisi." };
  if (title !== "Dosen" && title !== "Mahasiswa") {
    return { status: "error", message: "Kalangan harus Dosen atau Mahasiswa." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invited_guests")
    .update({ full_name: fullName, campus_name: campusName, title, contact, kota })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  // register_participant() copied the guest's name and title into the
  // participant row at check-in; keep that row in sync so a typo fix here
  // also shows on Peserta Masuk, presensi, and the berita acara.
  await supabase
    .from("participants")
    .update({ nama_lengkap: fullName, jabatan: title })
    .eq("invited_guest_id", id);

  revalidatePath("/admin/invited-guests");
  revalidatePath("/admin");
  return { status: "ok" };
}

export async function deleteInvitedGuest(formData: FormData): Promise<GuestActionResult> {
  await requireAdminSession();

  const id = readField(formData, "id");
  if (!id) return { status: "error", message: "Data tamu tidak valid." };

  const supabase = createAdminClient();

  // A guest who already checked in has a participant row (with voting
  // rights) tied to them. Deleting only the guest would leave that
  // participant behind with no link back, so panitia must remove the
  // participant from Peserta Masuk first — that also unclaims the guest.
  const { data: guest } = await supabase
    .from("invited_guests")
    .select("is_claimed")
    .eq("id", id)
    .maybeSingle();

  if (guest?.is_claimed) {
    return {
      status: "error",
      message: "Tamu ini sudah hadir. Hapus dulu datanya di menu Peserta Masuk, baru tamu bisa dihapus.",
    };
  }

  const { error } = await supabase.from("invited_guests").delete().eq("id", id).eq("is_claimed", false);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/invited-guests");
  return { status: "ok" };
}

export async function createInvitedGuest(formData: FormData): Promise<GuestActionResult> {
  await requireAdminSession();

  const fullName = readField(formData, "fullName");
  const campusName = readField(formData, "campusName");
  const title = readField(formData, "title");
  const contact = readField(formData, "contact");
  const kota = readField(formData, "kota");

  if (!fullName || !campusName) return { status: "error", message: "Nama dan kampus wajib diisi." };
  if (title !== "Dosen" && title !== "Mahasiswa") {
    return { status: "error", message: "Kalangan harus Dosen atau Mahasiswa." };
  }

  const supabase = createAdminClient();

  // No unique constraint in the schema (two people can legitimately share a
  // name at different campuses), so guard against an accidental double-add
  // of the same person here instead.
  const { data: existing } = await supabase
    .from("invited_guests")
    .select("id")
    .ilike("full_name", fullName.replace(/[%_\\]/g, "\\$&"))
    .ilike("campus_name", campusName.replace(/[%_\\]/g, "\\$&"))
    .limit(1);

  if (existing && existing.length > 0) {
    return { status: "error", message: `"${fullName}" dari ${campusName} sudah ada di daftar.` };
  }

  const { error } = await supabase
    .from("invited_guests")
    .insert({ full_name: fullName, campus_name: campusName, title, contact, kota, pic: await leastLoadedPic(supabase) });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/invited-guests");
  return { status: "ok" };
}
