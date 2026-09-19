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
      const { data, error } = await supabase
        .from("invited_guests_public")
        .select("id, full_name, campus_name, title")
        .or(`full_name.ilike.%${term}%,campus_name.ilike.%${term}%`)
        .limit(8);

      if (!cancelled) {
        setResults(
          error || !data
            ? []
            : data.map((row) => ({
                id: row.id,
                fullName: row.full_name,
                campusName: row.campus_name,
                title: row.title,
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
        placeholder="Cari nama Anda di daftar tamu undangan..."
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary-500"
      />

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-[var(--shadow-elevated)]">
          {isSearching && (
            <p className="px-4 py-3 text-sm text-text-muted">Mencari...</p>
          )}

          {!isSearching && results.length === 0 && (
            <div className="px-4 py-3">
              <p className="text-sm text-text-muted">
                Nama tidak ditemukan di daftar tamu undangan.
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
            results.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => {
                  onSelect(guest);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50"
              >
                <p className="font-medium text-text">{guest.fullName}</p>
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
