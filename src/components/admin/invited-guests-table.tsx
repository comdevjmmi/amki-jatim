"use client";

import { useState, useTransition } from "react";
import { deleteInvitedGuest, updateInvitedGuest } from "@/app/admin/(dashboard)/invited-guests/actions";

export interface InvitedGuestTableRow {
  id: string;
  full_name: string;
  campus_name: string;
  title: string;
  contact: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
}

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500";

function formatJam(iso: string): string {
  return new Date(iso)
    .toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
    .replace(":", ".");
}

export function InvitedGuestsTable({ guests }: { guests: InvitedGuestTableRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function setError(id: string, message: string) {
    setErrorById((prev) => ({ ...prev, [id]: message }));
  }

  async function handleUpdate(formData: FormData) {
    const id = formData.get("id") as string;
    const result = await updateInvitedGuest(formData);
    if (result.status === "ok") {
      setEditingId(null);
      setError(id, "");
    } else {
      setError(id, result.message ?? "Gagal menyimpan.");
    }
  }

  function handleDelete(guest: InvitedGuestTableRow) {
    if (!confirm(`Hapus tamu undangan "${guest.full_name}" (${guest.campus_name})?`)) return;
    const formData = new FormData();
    formData.set("id", guest.id);
    setPendingId(guest.id);
    startTransition(async () => {
      const result = await deleteInvitedGuest(formData);
      setPendingId(null);
      setError(guest.id, result.status === "ok" ? "" : (result.message ?? "Gagal menghapus."));
    });
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border bg-surface-muted text-text-muted">
        <tr>
          <th className="px-4 py-3 font-semibold">No</th>
          <th className="px-4 py-3 font-semibold">Nama</th>
          <th className="px-4 py-3 font-semibold">Kampus</th>
          <th className="px-4 py-3 font-semibold">Kalangan</th>
          <th className="px-4 py-3 font-semibold">Kontak</th>
          <th className="px-4 py-3 font-semibold">Kehadiran</th>
          <th className="px-4 py-3 font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {guests.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
              Tidak ada tamu yang cocok.
            </td>
          </tr>
        )}
        {guests.map((g, i) => {
          const error = errorById[g.id];

          if (editingId === g.id) {
            return (
              <tr key={g.id} className="border-b border-border last:border-0">
                <td colSpan={7} className="px-4 py-4">
                  <form action={handleUpdate} className="grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="id" value={g.id} />
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Nama Lengkap</span>
                      <input type="text" name="fullName" required defaultValue={g.full_name} className={INPUT_CLASS} />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Kampus</span>
                      <input type="text" name="campusName" required defaultValue={g.campus_name} className={INPUT_CLASS} />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Kalangan</span>
                      <select name="title" defaultValue={g.title} className={INPUT_CLASS}>
                        <option value="Dosen">Dosen</option>
                        <option value="Mahasiswa">Mahasiswa</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Kontak</span>
                      <input type="text" name="contact" defaultValue={g.contact ?? ""} className={INPUT_CLASS} />
                    </label>
                    {g.is_claimed && (
                      <p className="text-xs text-text-muted sm:col-span-2">
                        Tamu ini sudah hadir — perubahan nama dan kalangan juga diterapkan ke data Peserta Masuk.
                      </p>
                    )}
                    {error && <p className="text-sm text-rose-700 sm:col-span-2">{error}</p>}
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
                          setEditingId(null);
                          setError(g.id, "");
                        }}
                        className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text-muted hover:text-text"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            );
          }

          return (
            <tr key={g.id} className="border-b border-border last:border-0 align-top">
              <td className="px-4 py-3 text-text-muted">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-text">
                {g.full_name}
                {error && <p className="mt-1 text-xs font-normal text-rose-700">{error}</p>}
              </td>
              <td className="px-4 py-3 text-text-muted">{g.campus_name}</td>
              <td className="px-4 py-3 text-text-muted">{g.title}</td>
              <td className="px-4 py-3 text-text-muted">{g.contact ?? "-"}</td>
              <td className="px-4 py-3">
                {g.is_claimed ? (
                  <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Hadir{g.claimed_at ? ` · ${formatJam(g.claimed_at)}` : ""}
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-text-muted">
                    Belum hadir
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(g.id);
                      setError(g.id, "");
                    }}
                    className="rounded-full border border-primary-500 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(g)}
                    disabled={pendingId === g.id}
                    title={g.is_claimed ? "Sudah hadir — hapus dulu dari Peserta Masuk" : undefined}
                    className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {pendingId === g.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
