import Link from "next/link";
import { VotingBooth } from "@/components/vote/voting-booth";
import { getVotingSettings } from "@/lib/data/voting-settings";
import { createClient } from "@/lib/supabase/server";
import type { Candidate } from "@/lib/types";

export const metadata = {
  title: "Bilik E-Voting — Rakerwil AMKI Jawa Timur",
};

export default async function VotePage() {
  const { isVotingVisible, isVotingOpen } = await getVotingSettings();

  if (!isVotingVisible || !isVotingOpen) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-surface-muted px-6 py-20 text-center">
        <h1 className="text-xl font-bold text-text">Bilik Suara Belum Dibuka</h1>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          Sesi pemilihan Ketua AMKI Jawa Timur belum dibuka panitia. Silakan cek kembali saat
          panitia mengumumkan pembukaan bilik suara.
        </p>
        <Link href="/" className="mt-6 text-sm font-medium text-primary-700 hover:underline">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, nama, asal_kampus, nomor_urut, foto_url, visi_misi, updated_at")
    .order("nomor_urut", { ascending: true, nullsFirst: false })
    .returns<Candidate[]>();

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <Link href="/" className="text-sm text-text-muted hover:text-primary-700">
          &larr; Beranda
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
          Bilik E-Voting Ketua AMKI Jawa Timur
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Masukkan token voting Anda, lalu pilih satu kandidat.
        </p>

        <div className="mt-8">
          <VotingBooth candidates={data ?? []} />
        </div>
      </div>
    </div>
  );
}
