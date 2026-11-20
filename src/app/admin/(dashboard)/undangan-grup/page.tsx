import Link from "next/link";
import { PIC_COUNT } from "@/lib/group-invite";
import { createAdminClient } from "@/lib/supabase/server";

export default async function UndanganGrupPage() {
  const { data, error } = await createAdminClient().from("invited_guests").select("pic, invite_status");
  const rows = data ?? [];

  const stats = Array.from({ length: PIC_COUNT }, (_, i) => {
    const mine = rows.filter((r) => r.pic === i + 1);
    return {
      pic: i + 1,
      total: mine.length,
      terkirim: mine.filter((r) => r.invite_status === "terkirim").length,
      dibalas: mine.filter((r) => r.invite_status === "dibalas").length,
      bermasalah: mine.filter((r) => r.invite_status === "bermasalah").length,
    };
  });
  const sum = (k: "total" | "terkirim" | "dibalas" | "bermasalah") => stats.reduce((n, s) => n + s[k], 0);
  const done = sum("terkirim") + sum("dibalas");

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Undangan Grup Peserta</h1>
      <p className="mt-1 text-sm text-text-muted">
        Kirim undangan grup WhatsApp komunal ke tamu undangan. Tiap PIC memegang satu kelompok; buka
        halaman PIC-nya, klik &ldquo;Kirim via WhatsApp&rdquo;, lalu ubah statusnya.
      </p>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">Gagal memuat: {error.message}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="Total Tamu" value={sum("total")} />
        <Card label="Sudah Dikirim" value={`${done}/${sum("total")}`} tone="text-sky-700" />
        <Card label="Dibalas" value={sum("dibalas")} tone="text-emerald-700" />
        <Card label="Bermasalah" value={sum("bermasalah")} tone="text-rose-700" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const sent = s.terkirim + s.dibalas;
          const pct = s.total ? Math.round((sent / s.total) * 100) : 0;
          return (
            <Link
              key={s.pic}
              href={`/admin/undangan-grup/${s.pic}`}
              className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary-500"
            >
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-text">PIC {s.pic}</p>
                <p className="text-sm text-text-muted">
                  {sent}/{s.total} terkirim
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {s.dibalas} dibalas{s.bermasalah > 0 && ` · ${s.bermasalah} bermasalah`}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className={`text-2xl font-bold ${tone ?? "text-text"}`}>{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
