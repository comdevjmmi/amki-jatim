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

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
