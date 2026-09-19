"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteSession, toggleSessionActive, updateSession } from "@/app/admin/(dashboard)/sessions/actions";

export interface SessionRowData {
  id: string;
  title: string;
  speaker: string | null;
  start_time: string | null;
  is_active: boolean;
}

// Matches createSession/updateSession's own new Date(value) interpretation
// (server-local, not UTC) so re-saving an unedited value round-trips to the
// same instant instead of drifting.
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionRow({ session }: { session: SessionRowData }) {
  const [isEditing, setIsEditing] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    if (!confirm(`Hapus sesi "${session.title}"? Data presensi terkait sesi ini juga akan terhapus.`)) {
      e.preventDefault();
    }
  }

  if (isEditing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={5} className="px-4 py-4">
          <form action={updateSession} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={session.id} />
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium text-text">Judul Materi</span>
              <input
                type="text"
                name="title"
                required
                defaultValue={session.title}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text">Pemateri</span>
              <input
                type="text"
                name="speaker"
                defaultValue={session.speaker ?? ""}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text">Waktu Mulai</span>
              <input
                type="datetime-local"
                name="startTime"
                defaultValue={toDatetimeLocalValue(session.start_time)}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-text">{session.title}</td>
      <td className="px-4 py-3 text-text-muted">{session.speaker ?? "-"}</td>
      <td className="px-4 py-3 text-text-muted">
        {session.start_time
          ? new Date(session.start_time).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
          : "-"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            session.is_active ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-text-muted"
          }`}
        >
          {session.is_active ? "Aktif" : "Nonaktif"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <form action={toggleSessionActive}>
            <input type="hidden" name="id" value={session.id} />
            <input type="hidden" name="nextActive" value={(!session.is_active).toString()} />
            <button
              type="submit"
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                session.is_active ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-500 hover:bg-primary-600"
              }`}
            >
              {session.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </form>
          <Link
            href={`/admin/sessions/${session.id}/attendance`}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted hover:text-text"
          >
            Presensi
          </Link>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted hover:text-text"
          >
            Edit
          </button>
          <form action={deleteSession}>
            <input type="hidden" name="id" value={session.id} />
            <button
              type="submit"
              onClick={handleDeleteClick}
              className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Hapus
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
