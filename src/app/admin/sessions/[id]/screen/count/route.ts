import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Under /admin, so already gated by the proxy.ts cookie check — this only
// ever returns a number, never participant identities.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("session_attendances")
    .select("*", { count: "exact", head: true })
    .eq("session_id", id);

  return NextResponse.json({ count: count ?? 0 });
}
