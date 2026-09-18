"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

function parseStartTime(value: FormDataEntryValue | null): string | null | "invalid" {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "invalid";

  return date.toISOString();
}

export async function createSession(formData: FormData) {
  await requireAdminSession();

  const title = formData.get("title");
  const speaker = formData.get("speaker");
  const startTime = parseStartTime(formData.get("startTime"));

  if (typeof title !== "string" || title.trim().length === 0) return;
  if (startTime === "invalid") return;

  const supabase = createAdminClient();
  await supabase.from("event_sessions").insert({
    title: title.trim(),
    speaker: typeof speaker === "string" && speaker.trim().length > 0 ? speaker.trim() : null,
    start_time: startTime,
  });

  revalidatePath("/admin/sessions");
}

export async function toggleSessionActive(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  const nextActive = formData.get("nextActive") === "true";
  if (typeof id !== "string") return;

  const supabase = createAdminClient();

  // Activating goes through set_active_session(), a single atomic UPDATE that
  // flips this session on and every other session off in one statement — see
  // schema.sql for why two sequential updates here would be racy.
  if (nextActive) {
    await supabase.rpc("set_active_session", { p_session_id: id });
  } else {
    await supabase.from("event_sessions").update({ is_active: false }).eq("id", id);
  }

  revalidatePath("/admin/sessions");
}
