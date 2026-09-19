import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface LandingStats {
  participantCount: number;
  masjidKampusCount: number;
  kotaCount: number;
}

const FAIL_EMPTY: LandingStats = { participantCount: 0, masjidKampusCount: 0, kotaCount: 0 };

/**
 * Real counts, not the illustrative placeholder numbers from the Stitch
 * design prompt ("150+ Delegasi" etc.) — those were filler for the mockup,
 * not data to publish. participants has no anon RLS policy (private data),
 * so that one count goes through the admin client — head:true means it
 * fetches only the count, never row data.
 */
export async function getLandingStats(): Promise<LandingStats> {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const [{ count: participantCount }, { data: masjidKampus }] = await Promise.all([
      admin.from("participants").select("*", { count: "exact", head: true }),
      supabase.from("masjid_kampus").select("kota"),
    ]);

    if (!masjidKampus) return FAIL_EMPTY;

    const kotaCount = new Set(masjidKampus.map((m) => m.kota.trim().toLowerCase())).size;

    return {
      participantCount: participantCount ?? 0,
      masjidKampusCount: masjidKampus.length,
      kotaCount,
    };
  } catch {
    return FAIL_EMPTY;
  }
}
