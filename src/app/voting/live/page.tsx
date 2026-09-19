import Link from "next/link";
import { LiveCountBoard } from "@/components/vote/live-count-board";
import { getVotingSettings } from "@/lib/data/voting-settings";
import { createClient } from "@/lib/supabase/server";
import type { Candidate } from "@/lib/types";

export const metadata = {
  title: "Live Count — Rakerwil AMKI Jawa Timur",
};

export default async function LiveCountPage() {
  const { isVotingVisible, isVotingOpen, revealLiveCount } = await getVotingSettings();

  if (!isVotingVisible) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-surface-muted px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-text">Live Count Belum Tersedia</h1>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          Layar hasil pemilihan akan aktif begitu panitia membuka sesi pemilihan.
        </p>
        <Link href="/" className="mt-6 text-sm font-medium text-primary-700 hover:underline">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: candidates }, { data: votes }] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, nama, asal_kampus, nomor_urut, foto_url, visi_misi, updated_at")
      .order("nomor_urut", { ascending: true, nullsFirst: false })
      .returns<Candidate[]>(),
    supabase.from("votes").select("candidate_id"),
  ]);

  const initialCounts: Record<string, number> = {};
  for (const row of votes ?? []) {
    initialCounts[row.candidate_id] = (initialCounts[row.candidate_id] ?? 0) + 1;
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-center text-2xl font-bold text-text sm:text-3xl">
          Live Count Pemilihan Ketua AMKI Jawa Timur
        </h1>

        <div className="mt-10">
          <LiveCountBoard
            candidates={candidates ?? []}
            initialCounts={initialCounts}
            initialIsVotingOpen={isVotingOpen}
            initialRevealLiveCount={revealLiveCount}
          />
        </div>
      </div>
    </div>
  );
}
