"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSuggestions } from "@/lib/use-suggestions";
import type { Candidate } from "@/lib/types";

interface PersonOption {
  id: string;
  full_name: string;
  campus_name: string;
  is_present: boolean;
}

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500";

export function CandidateFields({ defaultValues }: { defaultValues?: Candidate }) {
  const [nama, setNama] = useState(defaultValues?.nama ?? "");
  const [asalKampus, setAsalKampus] = useState(defaultValues?.asal_kampus ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLabelElement>(null);

  // Suggestions come from everyone panitia knows about (invited guests and
  // delegates who registered on the day). A candidate who isn't in the list
  // can still be typed in by hand.
  const { results, isSearching, failed, ready } = useSuggestions<PersonOption>(nama, async (term) => {
    const filter = `full_name.ilike.%${term}%,campus_name.ilike.%${term}%`;
    const { data, error } = await createClient()
      .from("register_lookup")
      .select("id, full_name, campus_name, is_present")
      .or(filter)
      .order("full_name")
      .limit(8);
    return { data: data as PersonOption[] | null, error };
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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Nomor Urut</span>
        <input
          type="number"
          name="nomorUrut"
          min={1}
          defaultValue={defaultValues?.nomor_urut ?? ""}
          className={INPUT_CLASS}
        />
      </label>

      <label ref={containerRef} className="relative flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">
          Nama Lengkap<span className="text-accent-600"> *</span>
        </span>
        <input
          type="text"
          name="nama"
          required
          autoComplete="off"
          value={nama}
          onChange={(event) => {
            setNama(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Ketik nama atau kampus untuk mencari..."
          className={INPUT_CLASS}
        />

        {isOpen && ready && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-[var(--shadow-elevated)]">
            {isSearching && <p className="px-4 py-3 text-sm text-text-muted">Mencari...</p>}

            {!isSearching && failed && (
              <p className="px-4 py-3 text-sm text-rose-700">Daftar peserta gagal dimuat.</p>
            )}

            {!isSearching && !failed && results.length === 0 && (
              <p className="px-4 py-3 text-sm text-text-muted">
                Tidak ada di daftar. Nama yang Anda ketik akan dipakai apa adanya.
              </p>
            )}

            {!isSearching &&
              !failed &&
              results.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setNama(person.full_name);
                    setAsalKampus(person.campus_name);
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-primary-50"
                >
                  <p className="font-medium text-text">{person.full_name}</p>
                  <p className="text-text-muted">{person.campus_name}</p>
                  {person.is_present && <p className="mt-0.5 text-xs font-semibold text-emerald-700">✓ Sudah hadir</p>}
                </button>
              ))}
          </div>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Asal Kampus</span>
        <input
          type="text"
          name="asalKampus"
          value={asalKampus}
          onChange={(event) => setAsalKampus(event.target.value)}
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Foto/Avatar URL</span>
        <input
          type="url"
          name="fotoUrl"
          placeholder="https://..."
          defaultValue={defaultValues?.foto_url ?? ""}
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-text">Keterangan Tambahan</span>
        <textarea
          name="visiMisi"
          rows={4}
          placeholder="Opsional, mis. jabatan saat ini atau catatan singkat tentang kandidat."
          defaultValue={defaultValues?.visi_misi ?? ""}
          className={INPUT_CLASS}
        />
      </label>
    </div>
  );
}
