import { createClient } from "@/lib/supabase/server";
import type { VotingSettings } from "@/lib/types";

const FAIL_CLOSED: VotingSettings = {
  isVotingVisible: false,
  isVotingOpen: false,
  revealLiveCount: false,
};

/**
 * Reads the public voting feature flag. Fails closed (voting hidden/closed)
 * on any error — e.g. Supabase env vars not configured yet in this
 * environment — so a backend hiccup never accidentally exposes the
 * election UI before panitia intends to.
 */
export async function getVotingSettings(): Promise<VotingSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("voting_settings")
      .select("is_voting_visible, is_voting_open, reveal_live_count")
      .eq("id", 1)
      .single();

    if (error || !data) {
      return FAIL_CLOSED;
    }

    return {
      isVotingVisible: data.is_voting_visible,
      isVotingOpen: data.is_voting_open,
      revealLiveCount: data.reveal_live_count,
    };
  } catch {
    return FAIL_CLOSED;
  }
}
