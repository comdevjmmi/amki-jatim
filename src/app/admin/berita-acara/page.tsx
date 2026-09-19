import Image from "next/image";
import { PrintButton } from "@/components/admin/print-button";
import { createAdminClient } from "@/lib/supabase/server";
import type { Candidate } from "@/lib/types";

export const metadata = {
  title: "Berita Acara Pemilihan — Rakerwil AMKI Jawa Timur 2026",
};

// Reads live vote counts with the service-role client at request time — must
// never be statically prerendered, which would bake in whatever tally
// existed at build time (or crash the build if Supabase env vars are
// unavailable then). Same reasoning as /admin/sessions.
export const dynamic = "force-dynamic";

interface CandidateResult extends Candidate {
  voteCount: number;
}

export default async function BeritaAcaraPage() {
  const supabase = createAdminClient();

  const [{ data: candidates }, { data: votes }, { count: dpt }] = await Promise.all([
    supabase
      .from("candidates")
      .select("id, nama, asal_kampus, nomor_urut, foto_url, visi_misi, updated_at")
      .order("nomor_urut", { ascending: true, nullsFirst: false })
      .returns<Candidate[]>(),
    supabase.from("votes").select("candidate_id"),
    supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("kategori", "peserta_penuh")
      .eq("status", "approved"),
  ]);

  const counts: Record<string, number> = {};
  for (const v of votes ?? []) {
    counts[v.candidate_id] = (counts[v.candidate_id] ?? 0) + 1;
  }

  const results: CandidateResult[] = (candidates ?? []).map((c) => ({
    ...c,
    voteCount: counts[c.id] ?? 0,
  }));

  const totalSuaraMasuk = votes?.length ?? 0;
  const totalDpt = dpt ?? 0;
  const partisipasi = totalDpt > 0 ? Math.round((totalSuaraMasuk / totalDpt) * 1000) / 10 : 0;

  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl bg-white px-6 py-10 text-text print:px-0 print:py-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      {/* Kop Surat */}
      <div className="flex items-center gap-4 border-b-4 border-double border-text pb-4">
        <Image src="/images/amki-logo.png" alt="Logo AMKI" width={64} height={64} className="h-16 w-16 object-contain" />
        <div className="text-center flex-1">
          <p className="text-lg font-bold uppercase tracking-wide">
            Asosiasi Masjid Kampus Indonesia (AMKI)
          </p>
          <p className="text-base font-semibold uppercase">Dewan Pengurus Wilayah Jawa Timur</p>
          <p className="text-sm text-text-muted">
            Rapat Kerja Wilayah (Rakerwil) AMKI Jawa Timur 2026 — Universitas Islam Darul Ulum
            (UNISDA) Lamongan
          </p>
        </div>
      </div>

      <h1 className="mt-8 text-center text-xl font-bold uppercase tracking-wide">
        Berita Acara Hasil Pemilihan Ketua
      </h1>
      <p className="text-center text-sm text-text-muted">
        AMKI Wilayah Jawa Timur Periode Mendatang
      </p>

      <p className="mt-8 text-sm leading-relaxed">
        Pada hari ini, {today}, bertempat di Universitas Islam Darul Ulum (UNISDA) Lamongan, telah
        dilaksanakan pemungutan suara pemilihan Ketua Asosiasi Masjid Kampus Indonesia (AMKI)
        Wilayah Jawa Timur dalam rangkaian Rapat Kerja Wilayah (Rakerwil) AMKI Jawa Timur 2026,
        dengan hasil rekapitulasi sebagai berikut:
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{totalDpt}</p>
          <p className="text-text-muted">Total DPT</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{totalSuaraMasuk}</p>
          <p className="text-text-muted">Suara Masuk</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-bold">{partisipasi}%</p>
          <p className="text-text-muted">Partisipasi</p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-text">
            <th className="py-2 text-left font-semibold">No. Urut</th>
            <th className="py-2 text-left font-semibold">Nama Calon</th>
            <th className="py-2 text-right font-semibold">Suara Sah</th>
            <th className="py-2 text-right font-semibold">Persentase</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-text-muted">
                Belum ada kandidat terdaftar.
              </td>
            </tr>
          )}
          {results.map((r) => (
            <tr key={r.id} className="border-b border-border">
              <td className="py-2">{r.nomor_urut ?? "-"}</td>
              <td className="py-2 font-medium">{r.nama}</td>
              <td className="py-2 text-right tabular-nums">{r.voteCount}</td>
              <td className="py-2 text-right tabular-nums">
                {totalSuaraMasuk > 0 ? ((r.voteCount / totalSuaraMasuk) * 100).toFixed(1) : "0.0"}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-text font-semibold">
            <td colSpan={2} className="py-2">
              Total Suara Sah
            </td>
            <td className="py-2 text-right tabular-nums">{totalSuaraMasuk}</td>
            <td className="py-2 text-right tabular-nums">100.0%</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-8 text-sm leading-relaxed">
        Demikian Berita Acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya
        sebagai dasar penetapan Ketua AMKI Wilayah Jawa Timur periode berikutnya.
      </p>

      <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm">
        <SignatureBlock role="Ketua Presidium Sidang" />
        <SignatureBlock role="Sekretaris Sidang" />
        <SignatureBlock role="Saksi" />
      </div>
    </div>
  );
}

function SignatureBlock({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center">
      <p>{role}</p>
      <div className="mt-16 w-full border-t border-text" />
      <p className="mt-1 text-text-muted">(..........................................)</p>
    </div>
  );
}
