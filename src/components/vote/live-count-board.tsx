"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Candidate } from "@/lib/types";

interface Props {
  candidates: Candidate[];
  initialCounts: Record<string, number>;
  initialIsVotingOpen: boolean;
  initialRevealLiveCount: boolean;
}

export function LiveCountBoard({
  candidates,
  initialCounts,
  initialIsVotingOpen,
  initialRevealLiveCount,
}: Props) {
  const [counts, setCounts] = useState(initialCounts);
  const [isVotingOpen, setIsVotingOpen] = useState(initialIsVotingOpen);
  const [revealLiveCount, setRevealLiveCount] = useState(initialRevealLiveCount);

  useEffect(() => {
    const supabase = createClient();

    async function refetchCounts() {
      const { data } = await supabase.from("votes").select("candidate_id");
      const next: Record<string, number> = {};
      for (const row of data ?? []) {
        next[row.candidate_id] = (next[row.candidate_id] ?? 0) + 1;
      }
      setCounts(next);
    }

    const channel = supabase
      .channel("live-count")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes" }, () => {
        refetchCounts();
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "voting_settings", filter: "id=eq.1" },
        (payload) => {
          const next = payload.new as { is_voting_open: boolean; reveal_live_count: boolean };
          setIsVotingOpen(next.is_voting_open);
          setRevealLiveCount(next.reveal_live_count);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            isVotingOpen ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-text-muted"
          }`}
        >
          {isVotingOpen ? "● Voting Sedang Berlangsung" : "Voting Ditutup"}
        </span>
        <p className="text-lg font-bold text-text">
          {total} <span className="text-sm font-normal text-text-muted">Suara Masuk</span>
        </p>
      </div>

      {!revealLiveCount ? (
        <div className="mt-8 rounded-lg border border-border bg-surface p-12 text-center shadow-[var(--shadow-card)]">
          <p className="text-4xl">🔒</p>
          <p className="mt-4 text-lg font-semibold text-text">Hasil Dirahasiakan Sementara</p>
          <p className="mt-2 text-sm text-text-muted">
            Rincian perolehan suara akan ditampilkan panitia setelah sidang pemilihan resmi
            ditutup.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {candidates.map((c) => {
            const count = counts[c.id] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={c.id}>
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-text">
                    {c.nomor_urut != null && (
                      <span className="mr-2 text-primary-600">#{c.nomor_urut}</span>
                    )}
                    {c.nama}
                  </p>
                  <p className="text-sm text-text-muted">
                    {count} suara &middot; {pct}%
                  </p>
                </div>
                <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
