"use client";

import { useState } from "react";
import { deleteParticipant, updateParticipant } from "@/app/admin/(dashboard)/actions";
import type { ParticipantStatus } from "@/lib/types";

export interface ParticipantTableRow {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  jabatan: string;
  kategori: string;
  status: ParticipantStatus;
  masjid_kampus_id: string | null;
  masjid_kampus_nama: string;
}

export interface CampusOption {
  id: string;
  nama: string;
}

const STATUS_STYLES: Record<ParticipantStatus, string> = {
  pending: "bg-accent-100 text-accent-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};
const STATUS_LABELS: Record<ParticipantStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ParticipantsTable({
  participants,
  campuses,
  updateStatusAction,
}: {
  participants: ParticipantTableRow[];
  campuses: CampusOption[];
  updateStatusAction: (formData: FormData) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  async function handleUpdate(formData: FormData) {
    const id = formData.get("id") as string;
    const result = await updateParticipant(formData);
    if (result.status === "ok") {
      setEditingId(null);
      setErrorById((prev) => ({ ...prev, [id]: "" }));
    } else {
      setErrorById((prev) => ({ ...prev, [id]: result.message ?? "Gagal menyimpan." }));
    }
  }

  function handleDeleteClick(e: React.MouseEvent, nama: string) {
    if (!confirm(`Hapus peserta "${nama}"? Jika berasal dari jalur undangan, kuota kampusnya akan dilepas kembali.`)) {
      e.preventDefault();
    }
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border bg-surface-muted text-text-muted">
        <tr>
          <th className="px-4 py-3 font-semibold">Nama</th>
          <th className="px-4 py-3 font-semibold">Kontak</th>
          <th className="px-4 py-3 font-semibold">Kampus</th>
          <th className="px-4 py-3 font-semibold">Kategori</th>
          <th className="px-4 py-3 font-semibold">Status</th>
          <th className="px-4 py-3 font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {participants.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
              Belum ada peserta.
            </td>
          </tr>
        )}
        {participants.map((p) => {
          if (editingId === p.id) {
            return (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td colSpan={6} className="px-4 py-4">
                  <form action={handleUpdate} className="grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Nama Lengkap</span>
                      <input
                        type="text"
                        name="namaLengkap"
                        required
                        defaultValue={p.nama_lengkap}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Jabatan</span>
                      <input
                        type="text"
                        name="jabatan"
                        required
                        defaultValue={p.jabatan}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Asal Kampus</span>
                      <select
                        name="masjidKampusId"
                        defaultValue={p.masjid_kampus_id ?? ""}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      >
                        {campuses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Kategori</span>
                      <select
                        name="kategori"
                        defaultValue={p.kategori}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      >
                        <option value="peserta_penuh">Peserta Penuh</option>
                        <option value="peninjau">Peninjau</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Email</span>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={p.email}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-text">Nomor WhatsApp</span>
                      <input
                        type="tel"
                        name="noHp"
                        required
                        defaultValue={p.no_hp}
                        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
                      />
                    </label>

                    {errorById[p.id] && (
                      <p className="text-sm text-rose-700 sm:col-span-2">{errorById[p.id]}</p>
                    )}

                    <div className="flex gap-2 sm:col-span-2">
                      <button
                        type="submit"
                        className="rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-muted hover:text-text"
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
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium text-text">{p.nama_lengkap}</p>
                <p className="text-text-muted">{p.jabatan}</p>
              </td>
              <td className="px-4 py-3 text-text-muted">
                <p>{p.email}</p>
                <p>{p.no_hp}</p>
              </td>
              <td className="px-4 py-3 text-text-muted">{p.masjid_kampus_nama}</td>
              <td className="px-4 py-3 text-text-muted">
                {p.kategori === "peserta_penuh" ? "Peserta Penuh" : "Peninjau"}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <form action={updateStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button
                      type="submit"
                      disabled={p.status === "approved"}
                      className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={updateStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button
                      type="submit"
                      disabled={p.status === "rejected"}
                      className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted hover:text-text"
                  >
                    Edit
                  </button>
                  <form action={deleteParticipant}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      onClick={(e) => handleDeleteClick(e, p.nama_lengkap)}
                      className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
