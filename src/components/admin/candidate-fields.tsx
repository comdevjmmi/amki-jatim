"use client";

import { useEffect, useRef, useState } from "react";
import { uploadCandidatePhoto } from "@/app/admin/(dashboard)/candidates/actions";
import { createClient } from "@/lib/supabase/client";
import { useSuggestions } from "@/lib/use-suggestions";
import type { Candidate } from "@/lib/types";

interface PersonOption {
  id: string;
  full_name: string;
  campus_name: string;
  is_present: boolean;
}

const PHOTO_MAX_SIDE = 800;

/** Shrinks a photo to at most 800px and re-encodes as JPEG so phone photos stay a few hundred KB. */
async function shrinkPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.fillStyle = "#ffffff"; // flatten transparent PNGs instead of turning them black
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("encode failed");
  return new File([blob], "foto.jpg", { type: "image/jpeg" });
}

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500";

export function CandidateFields({ defaultValues }: { defaultValues?: Candidate }) {
  const [nama, setNama] = useState(defaultValues?.nama ?? "");
  const [asalKampus, setAsalKampus] = useState(defaultValues?.asal_kampus ?? "");
  const [fotoUrl, setFotoUrl] = useState(defaultValues?.foto_url ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
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

  async function handlePhotoChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = ""; // allow picking the same file again later
    if (!file) return;

    setPhotoError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("photo", await shrinkPhoto(file));
      const result = await uploadCandidatePhoto(formData);
      if (result.status === "ok" && result.url) {
        setFotoUrl(result.url);
      } else {
        setPhotoError(result.message ?? "Gagal mengunggah foto.");
      }
    } catch {
      setPhotoError("Foto tidak bisa dibaca. Gunakan file JPG, PNG, atau WebP.");
    } finally {
      setIsUploading(false);
    }
  }

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

      <label
        ref={containerRef}
        className="relative flex flex-col gap-1.5 text-sm"
        // Close when focus leaves the name field, so the suggestion box never
        // sits on top of the fields below it.
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
        }}
      >
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
          <div
            // Keeps focus on the input while a suggestion is clicked (Safari
            // doesn't focus buttons), so the blur handler above can't close the
            // box before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-[var(--shadow-elevated)]"
          >
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
      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Foto (opsional)</span>
        <input type="hidden" name="fotoUrl" value={fotoUrl} />
        {/* Blocks form submission while an upload is running, so a photo that
            is still uploading can't be silently left out of the saved candidate. */}
        {isUploading && (
          <input
            required
            value=""
            onChange={() => {}}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onInvalid={(event) => event.currentTarget.setCustomValidity("Tunggu foto selesai diunggah.")}
          />
        )}
        <div className="flex items-center gap-3">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt="Foto kandidat" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
              {nama.trim().charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className="flex flex-col items-start gap-1">
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-full border border-primary-500 px-4 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50">
                {isUploading ? "Mengunggah..." : fotoUrl ? "Ganti Foto" : "Pilih Foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChosen}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              {fotoUrl && !isUploading && (
                <button
                  type="button"
                  onClick={() => setFotoUrl("")}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-muted hover:text-rose-700"
                >
                  Hapus Foto
                </button>
              )}
            </div>
            <p className="text-xs text-text-muted">JPG, PNG, atau WebP. Diperkecil otomatis.</p>
          </div>
        </div>
        {photoError && <p className="text-xs text-rose-700">{photoError}</p>}
      </div>
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
