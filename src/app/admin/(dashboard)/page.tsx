import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { updateParticipantStatus } from "./actions";
import type { ParticipantStatus } from "@/lib/types";

type StatusFilter = "all" | ParticipantStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

interface ParticipantRow {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  jabatan: string;
  kategori: string;
  registration_type: string;
  status: ParticipantStatus;
  created_at: string;
  masjid_kampus: { nama: string } | null;
}

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: StatusFilter = FILTERS.some((f) => f.value === status) ? (status as StatusFilter) : "all";

  const supabase = createAdminClient();
  let query = supabase
    .from("participants")
    .select(
      "id, nama_lengkap, email, no_hp, jabatan, kategori, registration_type, status, created_at, masjid_kampus(nama)",
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query.returns<ParticipantRow[]>();
  const participants = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Peserta Masuk</h1>
      <p className="mt-1 text-sm text-text-muted">
        {participants.length} peserta {filter !== "all" && `(status: ${filter})`}
      </p>

      <div className="mt-6 flex gap-1 rounded-full border border-border p-1 w-fit">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin" : `/admin?status=${f.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value ? "bg-primary-500 text-white" : "text-text-muted hover:text-primary-700"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat data: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Kontak</th>
              <th className="px-4 py-3 font-semibold">Kampus</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Belum ada peserta.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-text">{p.nama_lengkap}</p>
                  <p className="text-text-muted">{p.jabatan}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  <p>{p.email}</p>
                  <p>{p.no_hp}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">{p.masjid_kampus?.nama ?? "-"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {p.kategori === "peserta_penuh" ? "Peserta Penuh" : "Peninjau"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={updateParticipantStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button
                        type="submit"
                        disabled={p.status === "approved"}
                        className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={updateParticipantStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button
                        type="submit"
                        disabled={p.status === "rejected"}
                        className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ParticipantStatus }) {
  const styles: Record<ParticipantStatus, string> = {
    pending: "bg-accent-100 text-accent-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  const labels: Record<ParticipantStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
