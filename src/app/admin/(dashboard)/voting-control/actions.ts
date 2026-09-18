"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function setVotingVisible(formData: FormData) {
  await requireAdminSession();

  const nextVisible = formData.get("nextVisible") === "true";
  const supabase = createAdminClient();
  await supabase.from("voting_settings").update({ is_voting_visible: nextVisible }).eq("id", 1);

  revalidatePath("/admin/voting-control");
  revalidatePath("/");
  revalidatePath("/vote");
}

export async function setVotingOpen(formData: FormData) {
  await requireAdminSession();

  const nextOpen = formData.get("nextOpen") === "true";
  const supabase = createAdminClient();
  await supabase
    .from("voting_settings")
    .update({
      is_voting_open: nextOpen,
      ...(nextOpen ? { opened_at: new Date().toISOString() } : { closed_at: new Date().toISOString() }),
    })
    .eq("id", 1);

  revalidatePath("/admin/voting-control");
  revalidatePath("/vote");
}
