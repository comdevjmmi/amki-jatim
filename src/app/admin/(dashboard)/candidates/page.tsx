import { CandidateFields } from "@/components/admin/candidate-fields";
import { CandidateRow } from "@/components/admin/candidate-row";
import { createAdminClient } from "@/lib/supabase/server";
import type { Candidate } from "@/lib/types";
import { upsertCandidate } from "./actions";

export default async function AdminCandidatesPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("id, nama, asal_kampus, nomor_urut, foto_url, visi_misi, updated_at")
    .order("nomor_urut", { ascending: true, nullsFirst: false })
    .returns<Candidate[]>();

  const candidates = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Manajemen Kandidat Ketua</h1>
      <p className="mt-1 text-sm text-text-muted">
        Kandidat yang tampil di bilik e-voting publik (/vote).
      </p>

      <details className="mt-6 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <summary className="cursor-pointer select-none px-6 py-4 text-sm font-semibold text-text">
          + Tambah Kandidat Baru
        </summary>
        <form action={upsertCandidate} className="flex flex-col gap-4 border-t border-border p-6">
          <CandidateFields />
          <button
            type="submit"
            className="w-fit rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Simpan Kandidat
          </button>
        </form>
      </details>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat kandidat: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">No.</th>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Asal Kampus</th>
              <th className="px-4 py-3 font-semibold">Visi &amp; Misi</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Belum ada kandidat.
                </td>
              </tr>
            )}
            {candidates.map((c) => (
              <CandidateRow key={`${c.id}-${c.updated_at}`} candidate={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
