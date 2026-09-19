import Link from "next/link";
import { ParticipantsTable, type CampusOption, type ParticipantTableRow } from "@/components/admin/participants-table";
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
  masjid_kampus_id: string | null;
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
      "id, nama_lengkap, email, no_hp, jabatan, kategori, registration_type, status, created_at, masjid_kampus_id, masjid_kampus(nama)",
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const [{ data, error }, { data: campusesData }] = await Promise.all([
    query.returns<ParticipantRow[]>(),
    supabase.from("masjid_kampus").select("id, nama").order("nama").returns<CampusOption[]>(),
  ]);

  const participants = data ?? [];
  const campuses = campusesData ?? [];

  const tableRows: ParticipantTableRow[] = participants.map((p) => ({
    id: p.id,
    nama_lengkap: p.nama_lengkap,
    email: p.email,
    no_hp: p.no_hp,
    jabatan: p.jabatan,
    kategori: p.kategori,
    status: p.status,
    masjid_kampus_id: p.masjid_kampus_id,
    masjid_kampus_nama: p.masjid_kampus?.nama ?? "-",
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Peserta Masuk</h1>
          <p className="mt-1 text-sm text-text-muted">
            {participants.length} peserta {filter !== "all" && `(status: ${filter})`}
          </p>
        </div>
        <a
          href="/admin/export/participants"
          className="rounded-full border border-primary-500 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
        >
          Export Data Peserta (CSV)
        </a>
      </div>

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
        <ParticipantsTable
          participants={tableRows}
          campuses={campuses}
          updateStatusAction={updateParticipantStatus}
        />
      </div>
    </div>
  );
}
