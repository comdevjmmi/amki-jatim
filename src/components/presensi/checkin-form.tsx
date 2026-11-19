"use client";

import { useEffect, useRef, useState } from "react";
import { checkInSelf, type CheckinResult } from "@/app/presensi/[sessionId]/actions";
import { createClient } from "@/lib/supabase/client";
import { useSuggestions } from "@/lib/use-suggestions";

interface PresensiOption {
  id: string;
  nama_lengkap: string;
  campus_name: string;
  checked_in_at: string | null;
}

function formatJam(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
    .replace(":", ".");
}

export function CheckinForm({ sessionId }: { sessionId: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PresensiOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isSearching, failed, ready } = useSuggestions<PresensiOption>(query, async (term) => {
    const { data, error } = await createClient().rpc("search_presensi", {
      p_session_id: sessionId,
      p_query: term,
    });
    return { data: data as PresensiOption[] | null, error };
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleConfirm() {
    if (!selected) return;
    setIsLoading(true);
    setResult(await checkInSelf(sessionId, selected.id));
    setIsLoading(false);
  }

  if (result?.status === "ok" || result?.status === "already") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-2xl text-emerald-700">✓</span>
        </div>
        <h2 className="text-lg font-bold text-text">
          {result.status === "already" ? "Anda Sudah Presensi" : "Presensi Berhasil!"}
        </h2>
        <p className="mt-2 text-sm font-medium text-text">{result.profile?.nama}</p>
        <p className="text-sm text-text-muted">{result.profile?.kampus}</p>
        {result.checkedInAt && (
          <p className="mt-2 text-xs text-text-muted">
            {new Date(result.checkedInAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <p className="text-sm font-semibold text-text">Cari Nama Anda</p>

      {selected ? (
        <div className="rounded-lg border border-primary-500 bg-primary-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-text">{selected.nama_lengkap}</p>
              <p className="text-sm text-text-muted">{selected.campus_name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
                setResult(null);
              }}
              className="shrink-0 text-sm font-medium text-primary-700 hover:underline"
            >
              Ganti
            </button>
          </div>
        </div>
      ) : (
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
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-primary-500"
          />

          {isOpen && ready && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-[var(--shadow-elevated)]">
              {isSearching && <p className="px-4 py-3 text-sm text-text-muted">Mencari...</p>}

              {!isSearching && failed && (
                <p className="px-4 py-3 text-sm text-rose-700">
                  Daftar peserta gagal dimuat. Coba lagi sebentar lagi atau hubungi panitia.
                </p>
              )}

              {!isSearching && !failed && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-text-muted">
                  Nama tidak ditemukan. Pastikan Anda sudah registrasi dan disetujui panitia, atau
                  hubungi panitia.
                </p>
              )}

              {!isSearching &&
                !failed &&
                results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={Boolean(p.checked_in_at)}
                    onClick={() => {
                      setSelected(p);
                      setIsOpen(false);
                      setResult(null);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50 disabled:cursor-default disabled:opacity-80 disabled:hover:bg-transparent"
                  >
                    <p className="font-medium text-text">{p.nama_lengkap}</p>
                    <p className="text-text-muted">{p.campus_name}</p>
                    {p.checked_in_at && (
                      <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                        ✓ Sudah presensi, tercatat pukul {formatJam(p.checked_in_at)} WIB
                      </p>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{result.message}</p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected || isLoading}
        className="w-full rounded-full bg-primary-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Memproses..." : "Konfirmasi Hadir"}
      </button>
    </div>
  );
}
