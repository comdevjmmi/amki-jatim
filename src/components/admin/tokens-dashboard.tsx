"use client";

import { useState } from "react";
import { generateVotingToken } from "@/app/admin/(dashboard)/tokens/actions";

export interface TokenParticipantRow {
  id: string;
  nama_lengkap: string;
  email: string;
  tokenStatus: "none" | "unused" | "used";
}

interface RevealedToken {
  nama: string;
  token: string;
}

export function TokensDashboard({ participants }: { participants: TokenParticipantRow[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorByRow, setErrorByRow] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<RevealedToken[]>([]);

  async function handleGenerate(participant: TokenParticipantRow) {
    setPendingId(participant.id);
    setErrorByRow((prev) => ({ ...prev, [participant.id]: "" }));

    const result = await generateVotingToken(participant.id);

    if (result.status === "ok" && result.token) {
      setRevealed((prev) => [...prev, { nama: participant.nama_lengkap, token: result.token! }]);
    } else {
      setErrorByRow((prev) => ({ ...prev, [participant.id]: result.message ?? "Gagal membuat token." }));
    }
    setPendingId(null);
  }

  async function handleCopyAll() {
    const text = revealed.map((r) => `${r.nama}: ${r.token}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the list is still
      // visible on screen for manual copy.
    }
  }

  return (
    <div>
      {revealed.length > 0 && (
        <div
          id="printable-tokens"
          className="mb-6 rounded-lg border border-primary-500 bg-primary-50 p-6"
        >
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-sm font-semibold text-text">
              Token Baru Dibuat ({revealed.length}) — hanya tampil sekali, segera catat/bagikan
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="rounded-full border border-primary-500 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
              >
                Salin Semua
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-primary-500 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
              >
                Cetak
              </button>
            </div>
          </div>
          <ul className="mt-3 space-y-1 font-mono text-sm text-text">
            {revealed.map((r, i) => (
              <li key={i}>
                {r.nama}: <span className="font-bold">{r.token}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] print:hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status Token</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  Belum ada Peserta Penuh yang Approved.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text">{p.nama_lengkap}</td>
                <td className="px-4 py-3 text-text-muted">{p.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.tokenStatus} />
                </td>
                <td className="px-4 py-3">
                  {p.tokenStatus === "none" ? (
                    <button
                      type="button"
                      onClick={() => handleGenerate(p)}
                      disabled={pendingId === p.id}
                      className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingId === p.id ? "Membuat..." : "Generate Token"}
                    </button>
                  ) : (
                    <span className="text-xs text-text-muted">Sudah dibuat</span>
                  )}
                  {errorByRow[p.id] && (
                    <p className="mt-1 text-xs text-rose-700">{errorByRow[p.id]}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-tokens, #printable-tokens * { visibility: visible; }
          #printable-tokens { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: TokenParticipantRow["tokenStatus"] }) {
  const styles: Record<TokenParticipantRow["tokenStatus"], string> = {
    none: "bg-surface-muted text-text-muted",
    unused: "bg-accent-100 text-accent-700",
    used: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<TokenParticipantRow["tokenStatus"], string> = {
    none: "Belum Dibuat",
    unused: "Belum Dipakai",
    used: "Sudah Dipakai",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
