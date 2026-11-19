"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

const DESKTOP_QUERY = "(min-width: 768px)";

export function AdminShell({
  logoutAction,
  children,
}: {
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  // Two independent states because the sidebar behaves differently per
  // breakpoint: on desktop it's a docked column that can be collapsed
  // (default open); on mobile it's an overlay drawer (default closed, so it
  // doesn't cover ~80% of the screen on load).
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle() {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      setDesktopOpen((open) => !open);
    } else {
      setMobileOpen((open) => !open);
    }
  }

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <AdminSidebar
        logoutAction={logoutAction}
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        />
      )}

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            type="button"
            onClick={toggle}
            aria-label="Buka/tutup menu"
            aria-controls="admin-sidebar"
            aria-expanded={mobileOpen || desktopOpen}
            className="rounded-md p-2 text-text-muted hover:bg-slate-100 hover:text-text"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-primary-700">AMKI Jatim Admin</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
