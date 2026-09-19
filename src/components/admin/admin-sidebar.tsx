"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "👥", label: "Peserta Masuk" },
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

export function AdminSidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-5">
        <Image src="/images/amki-logo.png" alt="Logo AMKI" width={32} height={32} className="h-8 w-8 object-contain" />
        <span className="text-base font-bold text-primary-700">AMKI Jatim Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
