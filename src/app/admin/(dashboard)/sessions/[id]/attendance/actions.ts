"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function checkInParticipant(formData: FormData) {
  await requireAdminSession();

  const sessionId = formData.get("sessionId");
  const participantId = formData.get("participantId");
  if (typeof sessionId !== "string" || typeof participantId !== "string") return;

  const supabase = createAdminClient();
  // Ignoring the error is deliberate: a duplicate check-in hits
  // unique(session_id, participant_id) and is a no-op, not a failure.
  await supabase
    .from("session_attendances")
    .insert({ session_id: sessionId, participant_id: participantId, method: "manual_admin" });

  revalidatePath(`/admin/sessions/${sessionId}/attendance`);
}

export async function undoCheckIn(formData: FormData) {
  await requireAdminSession();

  const sessionId = formData.get("sessionId");
  const participantId = formData.get("participantId");
  if (typeof sessionId !== "string" || typeof participantId !== "string") return;

  const supabase = createAdminClient();
  await supabase
    .from("session_attendances")
    .delete()
    .eq("session_id", sessionId)
    .eq("participant_id", participantId);

  revalidatePath(`/admin/sessions/${sessionId}/attendance`);
}
