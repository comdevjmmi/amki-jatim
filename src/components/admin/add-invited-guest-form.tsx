"use client";

import { useRef, useState } from "react";
import { createInvitedGuest } from "@/app/admin/(dashboard)/invited-guests/actions";

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500";

export function AddInvitedGuestForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setSaved("");
    const result = await createInvitedGuest(formData);
    if (result.status === "ok") {
      setError("");
      setSaved(`"${formData.get("fullName")}" ditambahkan.`);
      formRef.current?.reset();
    } else {
      setError(result.message ?? "Gagal menambahkan tamu.");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600"
      >
        + Tambah Tamu
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="grid gap-4 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:grid-cols-2"
    >
      <p className="font-semibold text-text sm:col-span-2">Tambah Tamu Undangan</p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Nama Lengkap</span>
        <input type="text" name="fullName" required className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Kampus</span>
        <input type="text" name="campusName" required className={INPUT_CLASS} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Kalangan</span>
        <select name="title" defaultValue="Mahasiswa" className={INPUT_CLASS}>
          <option value="Dosen">Dosen</option>
          <option value="Mahasiswa">Mahasiswa</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Kontak (opsional)</span>
        <input type="text" name="contact" placeholder="08xx / email" className={INPUT_CLASS} />
      </label>
      {error && <p className="text-sm text-rose-700 sm:col-span-2">{error}</p>}
      {saved && <p className="text-sm text-emerald-700 sm:col-span-2">{saved}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
            setSaved("");
          }}
          className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text-muted hover:text-text"
        >
          Selesai
        </button>
      </div>
    </form>
  );
}
