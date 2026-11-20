"use client";

import { useState, useTransition } from "react";
import { setGuestPic, setInviteStatus } from "@/app/admin/(dashboard)/undangan-grup/actions";
import { INVITE_STATUSES, PIC_COUNT, type InviteStatus } from "@/lib/group-invite";

export interface InviteRow {
  id: string;
  fullName: string;
  campusName: string;
  phoneDisplay: string | null;
  waLink: string | null;
  status: InviteStatus;
  pic: number;
}

const STATUS_STYLE: Record<InviteStatus, string> = {
  belum: "border-border bg-surface text-text-muted",
  terkirim: "border-sky-300 bg-sky-50 text-sky-800",
  dibalas: "border-emerald-300 bg-emerald-50 text-emerald-800",
  bermasalah: "border-rose-300 bg-rose-50 text-rose-800",
};

export function InviteTable({ rows }: { rows: InviteRow[] }) {
  const [, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, InviteStatus>>({});
  const [error, setError] = useState("");

  function changeStatus(row: InviteRow, next: InviteStatus) {
    setStatuses((s) => ({ ...s, [row.id]: next }));
    setError("");
    startTransition(async () => {
      const result = await setInviteStatus(row.id, next);
      if (result.status === "error") {
        setStatuses((s) => ({ ...s, [row.id]: row.status }));
        setError(`${row.fullName}: ${result.message}`);
      }
    });
  }

  function changePic(row: InviteRow, next: number) {
    setError("");
    startTransition(async () => {
      const result = await setGuestPic(row.id, next);
      if (result.status === "error") setError(`${row.fullName}: ${result.message}`);
    });
  }

  return (
    <>
      {error && <p className="mb-3 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">No</th>
            <th className="px-4 py-3 font-semibold">Nama</th>
            <th className="px-4 py-3 font-semibold">Asal Institusi</th>
            <th className="px-4 py-3 font-semibold">No. WA</th>
            <th className="px-4 py-3 font-semibold">Chat</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">PIC</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const status = statuses[row.id] ?? row.status;
            return (
              <tr key={row.id} className="border-b border-border align-middle last:border-0">
                <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-text">{row.fullName}</td>
                <td className="px-4 py-3 text-text-muted">{row.campusName}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-text-muted">{row.phoneDisplay ?? "-"}</td>
                <td className="px-4 py-3">
                  {row.waLink ? (
                    <a
                      href={row.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block whitespace-nowrap rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Kirim via WhatsApp
                    </a>
                  ) : (
                    <span className="text-xs text-rose-700">Nomor kosong</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={status}
                    onChange={(e) => changeStatus(row, e.target.value as InviteStatus)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold outline-none ${STATUS_STYLE[status]}`}
                  >
                    {INVITE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={row.pic}
                    onChange={(e) => changePic(row, Number(e.target.value))}
                    aria-label={`Pindahkan ${row.fullName} ke PIC lain`}
                    className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text-muted outline-none"
                  >
                    {Array.from({ length: PIC_COUNT }, (_, n) => n + 1).map((n) => (
                      <option key={n} value={n}>
                        PIC {n}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
