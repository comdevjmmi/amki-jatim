import Link from "next/link";
import { logoutAdmin } from "./actions";

// Admin pages read live data with the service-role client and are gated by
// a per-request cookie check — they must never be statically prerendered
// (which would either bake stale data into the build, or crash the build
// outright when Supabase env vars aren't available at build time, as
// happened on /admin/sessions before this was added).
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-primary-700">AMKI Jatim Admin</span>
            <nav className="flex gap-4 text-sm font-medium text-text-muted">
              <Link href="/admin" className="hover:text-primary-700">
                Peserta
              </Link>
              <Link href="/admin/sessions" className="hover:text-primary-700">
                Sesi Presensi
              </Link>
              <Link href="/admin/candidates" className="hover:text-primary-700">
                Kandidat
              </Link>
              <Link href="/admin/tokens" className="hover:text-primary-700">
                Token Pemilih
              </Link>
              <Link href="/admin/voting-control" className="hover:text-primary-700">
                Kontrol Voting
              </Link>
              <Link href="/admin/berita-acara" className="hover:text-primary-700">
                Berita Acara
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="text-sm font-medium text-text-muted hover:text-primary-700">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
