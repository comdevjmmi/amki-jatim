"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function createSession(formData: FormData) {
  const title = formData.get("title");
  const speaker = formData.get("speaker");
  const startTime = formData.get("startTime");

  if (typeof title !== "string" || title.trim().length === 0) return;

  const supabase = createAdminClient();
  await supabase.from("event_sessions").insert({
    title: title.trim(),
    speaker: typeof speaker === "string" && speaker.trim().length > 0 ? speaker.trim() : null,
    start_time: typeof startTime === "string" && startTime.length > 0 ? new Date(startTime).toISOString() : null,
  });

  revalidatePath("/admin/sessions");
}

export async function toggleSessionActive(formData: FormData) {
  const id = formData.get("id");
  const nextActive = formData.get("nextActive") === "true";
  if (typeof id !== "string") return;

  const supabase = createAdminClient();

  // Only one presensi session is active at a time — schema.sql's intent for
  // event_sessions.is_active.
  if (nextActive) {
    await supabase.from("event_sessions").update({ is_active: false }).eq("is_active", true);
  }
  await supabase.from("event_sessions").update({ is_active: nextActive }).eq("id", id);

  revalidatePath("/admin/sessions");
}
