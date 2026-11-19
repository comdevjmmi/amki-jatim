"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InvitedGuestOption } from "@/lib/types";

interface Props {
  selected: InvitedGuestOption | null;
  onSelect: (guest: InvitedGuestOption | null) => void;
  onNotFound: () => void;
}

export function InvitedGuestCombobox({ selected, onSelect, onNotFound }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InvitedGuestOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      // Nothing to reset here: the dropdown that renders `results` is only
      // shown while query.trim().length >= 2, so stale results never leak
      // into view once the query gets short again.
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      setIsSearching(true);

      const supabase = createClient();
      const term = query.trim();
      type LookupRow = {
        id: string;
        full_name: string;
        campus_name: string;
        title: string;
        is_present?: boolean;
        present_at?: string | null;
      };
      type LookupResult = { data: LookupRow[] | null; error: { message: string } | null };
      const filter = `full_name.ilike.%${term}%,campus_name.ilike.%${term}%`;

      let { data, error } = (await supabase
        .from("register_lookup")
        .select("id, full_name, campus_name, title, is_present, present_at")
        .or(filter)
        .order("full_name")
        .limit(8)) as LookupResult;

      // Until supabase/migrations/2026-11-19-register-checkin.sql has been
      // applied, register_lookup doesn't exist. Fall back to the old view
      // (unclaimed invited guests only) so search keeps working in the gap.
      if (error) {
        console.warn("register_lookup unavailable, falling back:", error.message);
        ({ data, error } = (await supabase
          .from("invited_guests_public")
          .select("id, full_name, campus_name, title")
          .or(filter)
          .limit(8)) as LookupResult);
      }

      if (!cancelled) {
        // A failed query must not look like "name not found" — that would
        // send real guests to the new-delegate form instead of surfacing it.
        if (error) console.error("guest search failed:", error);
        setSearchFailed(Boolean(error));
        setResults(
          error || !data
            ? []
            : data.map((row) => ({
                id: row.id,
                fullName: row.full_name,
                campusName: row.campus_name,
                title: row.title,
                isPresent: row.is_present === true,
                presentAt: row.present_at ?? null,
              })),
        );
        setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  if (selected) {
    return (
      <div className="rounded-lg border border-primary-500 bg-primary-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-text">{selected.fullName}</p>
            <p className="text-sm text-text-muted">
              {selected.title} &middot; {selected.campusName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
            className="shrink-0 text-sm font-medium text-primary-700 hover:underline"
          >
            Ganti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Ketik nama atau asal kampus Anda..."
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary-500"
      />

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-[var(--shadow-elevated)]">
          {isSearching && (
            <p className="px-4 py-3 text-sm text-text-muted">Mencari...</p>
          )}

          {!isSearching && searchFailed && (
            <p className="px-4 py-3 text-sm text-rose-700">
              Daftar tamu undangan gagal dimuat. Coba lagi sebentar lagi atau hubungi panitia.
            </p>
          )}

          {!isSearching && !searchFailed && results.length === 0 && (
            <div className="px-4 py-3">
              <p className="text-sm text-text-muted">
                Nama tidak ditemukan di daftar peserta.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNotFound();
                }}
                className="mt-2 text-sm font-medium text-primary-700 hover:underline"
              >
                Daftar sebagai Perwakilan / Delegasi Baru &rarr;
              </button>
            </div>
          )}

          {!isSearching &&
            !searchFailed &&
            results.map((guest) => (
              <button
                key={guest.id}
                type="button"
                disabled={guest.isPresent}
                onClick={() => {
                  onSelect(guest);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 disabled:cursor-default disabled:opacity-80 disabled:hover:bg-transparent"
              >
                <p className="font-medium text-text">{guest.fullName}</p>
                {guest.isPresent && (
                  <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                    ✓ Sudah hadir
                    {guest.presentAt && `, tercatat pukul ${formatJam(guest.presentAt)} WIB`}
                  </p>
                )}
                <p className="text-text-muted">
                  {guest.title} &middot; {guest.campusName}
                </p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function formatJam(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
    .replace(":", ".");
}
