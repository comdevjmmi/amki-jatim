"use client";

import { useState } from "react";
import { checkInParticipant, undoCheckIn } from "@/app/admin/(dashboard)/sessions/[id]/attendance/actions";

export interface AttendanceParticipantRow {
  id: string;
  nama_lengkap: string;
  jabatan: string;
  kampus: string;
  isCheckedIn: boolean;
}

export function AttendanceList({
  sessionId,
  participants,
}: {
  sessionId: string;
  participants: AttendanceParticipantRow[];
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? participants.filter(
        (p) => p.nama_lengkap.toLowerCase().includes(q) || p.kampus.toLowerCase().includes(q),
      )
    : participants;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama atau kampus..."
        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary-500"
      />

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Kampus</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Tidak ada peserta cocok.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-text">{p.nama_lengkap}</p>
                  <p className="text-text-muted">{p.jabatan}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">{p.kampus}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.isCheckedIn ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {p.isCheckedIn ? "Hadir" : "Belum Hadir"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={p.isCheckedIn ? undoCheckIn : checkInParticipant}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="participantId" value={p.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        p.isCheckedIn ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-500 hover:bg-primary-600"
                      }`}
                    >
                      {p.isCheckedIn ? "Batalkan" : "Check-in"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
