"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "👥", label: "Peserta Masuk" },
  { href: "/admin/invited-guests", icon: "📋", label: "Tamu Undangan" },
  { href: "/admin/sessions", icon: "📅", label: "Sesi Presensi" },
  { href: "/admin/candidates", icon: "🗳️", label: "Kandidat Ketua" },
  { href: "/admin/tokens", icon: "🔑", label: "Token Pemilih" },
  { href: "/admin/voting-control", icon: "⚙️", label: "Kontrol Voting" },
  { href: "/admin/berita-acara", icon: "📜", label: "Berita Acara" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  logoutAction,
  mobileOpen,
  desktopOpen,
  onNavigate,
}: {
  logoutAction: () => Promise<void>;
  mobileOpen: boolean;
  desktopOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 max-w-[80vw] shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 md:sticky md:top-0 md:z-20 md:max-w-none md:translate-x-0 md:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${desktopOpen ? "" : "md:hidden"}`}
    >
      <div className="flex items-center justify-between gap-2.5 border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <Image src="/images/amki-logo.png" alt="Logo AMKI" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="text-base font-bold text-primary-700">AMKI Jatim Admin</span>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Tutup menu"
          className="rounded-md p-1 text-text-muted hover:bg-slate-100 hover:text-text md:hidden"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-primary-50 font-semibold text-primary-700"
                  : "font-medium text-text-muted hover:bg-slate-50 hover:text-text"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-200 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-slate-50 hover:text-text"
        >
          <span className="text-base">🌐</span>
          Lihat Situs Publik
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <span className="text-base">🚪</span>
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
