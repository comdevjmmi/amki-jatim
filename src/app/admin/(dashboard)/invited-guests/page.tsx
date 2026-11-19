import Link from "next/link";
import { InvitedGuestsTable, type InvitedGuestTableRow } from "@/components/admin/invited-guests-table";
import { createAdminClient } from "@/lib/supabase/server";

type StatusFilter = "all" | "hadir" | "belum";
type TitleFilter = "all" | "Dosen" | "Mahasiswa";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "hadir", label: "Sudah Hadir" },
  { value: "belum", label: "Belum Hadir" },
];

const TITLE_FILTERS: { value: TitleFilter; label: string }[] = [
  { value: "all", label: "Semua Kalangan" },
  { value: "Dosen", label: "Dosen" },
  { value: "Mahasiswa", label: "Mahasiswa" },
];


export default async function InvitedGuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; title?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status: StatusFilter = STATUS_FILTERS.some((f) => f.value === params.status)
    ? (params.status as StatusFilter)
    : "all";
  const title: TitleFilter = TITLE_FILTERS.some((f) => f.value === params.title)
    ? (params.title as TitleFilter)
    : "all";
  const q = (params.q ?? "").trim();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invited_guests")
    .select("id, full_name, campus_name, title, contact, is_claimed, claimed_at")
    .order("full_name")
    .returns<InvitedGuestTableRow[]>();

  const all = data ?? [];
  const hadirCount = all.filter((g) => g.is_claimed).length;

  // ~120 rows for this event — filtering in memory keeps the summary counts
  // (always over the full list) and the table in one query.
  const needle = q.toLowerCase();
  const guests = all.filter(
    (g) =>
      (status === "all" || (status === "hadir") === g.is_claimed) &&
      (title === "all" || g.title === title) &&
      (!needle ||
        g.full_name.toLowerCase().includes(needle) ||
        g.campus_name.toLowerCase().includes(needle)),
  );

  function hrefWith(next: { status?: StatusFilter; title?: TitleFilter }) {
    const sp = new URLSearchParams();
    const s = next.status ?? status;
    const t = next.title ?? title;
    if (s !== "all") sp.set("status", s);
    if (t !== "all") sp.set("title", t);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/invited-guests?${qs}` : "/admin/invited-guests";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Tamu Undangan</h1>
      <p className="mt-1 text-sm text-text-muted">
        Daftar resmi panitia. Tamu yang menekan &ldquo;Konfirmasi Hadir&rdquo; di /register
        tercatat hadir di sini beserta jamnya.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <SummaryCard label="Total Tamu" value={all.length} />
        <SummaryCard label="Sudah Hadir" value={hadirCount} tone="emerald" />
        <SummaryCard label="Belum Hadir" value={all.length - hadirCount} tone="amber" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FilterGroup>
          {STATUS_FILTERS.map((f) => (
            <FilterLink key={f.value} href={hrefWith({ status: f.value })} active={status === f.value}>
              {f.label}
            </FilterLink>
          ))}
        </FilterGroup>
        <FilterGroup>
          {TITLE_FILTERS.map((f) => (
            <FilterLink key={f.value} href={hrefWith({ title: f.value })} active={title === f.value}>
              {f.label}
            </FilterLink>
          ))}
        </FilterGroup>
        <form action="/admin/invited-guests" className="ml-auto flex gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {title !== "all" && <input type="hidden" name="title" value={title} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau kampus..."
            className="w-64 rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary-500"
          />
          <button
            type="submit"
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Cari
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat data: {error.message}
        </p>
      )}

      <p className="mt-4 text-sm text-text-muted">Menampilkan {guests.length} dari {all.length} tamu</p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <InvitedGuestsTable guests={guests} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "amber" }) {
  const color = tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-accent-700" : "text-text";
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex w-fit gap-1 rounded-full border border-border p-1">{children}</div>;
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-primary-500 text-white" : "text-text-muted hover:text-primary-700"
      }`}
    >
      {children}
    </Link>
  );
}
