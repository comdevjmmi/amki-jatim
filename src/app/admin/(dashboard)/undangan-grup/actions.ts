"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { isInviteStatus, PIC_COUNT } from "@/lib/group-invite";
import { createAdminClient } from "@/lib/supabase/server";

export interface InviteActionResult {
  status: "ok" | "error";
  message?: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setInviteStatus(id: string, status: string): Promise<InviteActionResult> {
  await requireAdminSession();
  if (!UUID_PATTERN.test(id) || !isInviteStatus(status)) {
    return { status: "error", message: "Data tidak valid." };
  }
  const { error } = await createAdminClient().from("invited_guests").update({ invite_status: status }).eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidatePath("/admin/undangan-grup", "layout");
  return { status: "ok" };
}

export async function setGuestPic(id: string, pic: number): Promise<InviteActionResult> {
  await requireAdminSession();
  if (!UUID_PATTERN.test(id) || !Number.isInteger(pic) || pic < 1 || pic > PIC_COUNT) {
    return { status: "error", message: "Data tidak valid." };
  }
  const { error } = await createAdminClient().from("invited_guests").update({ pic }).eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidatePath("/admin/undangan-grup", "layout");
  return { status: "ok" };
}
