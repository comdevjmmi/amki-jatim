"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// True Supabase Realtime (postgres_changes) needs a public RLS select policy
// on session_attendances, which would also make attendance rows readable by
// anyone with the anon key. Polling avoids that trade-off entirely — the
// count only ever comes from this admin-gated route (service role, never
// exposed to anon), refreshed every few seconds.
// ponytail: swap for a Realtime subscription once that policy is added, if
// sub-second updates matter more than the anon-read exposure.
const POLL_INTERVAL_MS = 3000;

export function ProjectorScreen({ sessionId, checkinUrl }: { sessionId: string; checkinUrl: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/admin/sessions/${sessionId}/screen/count`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setCount(data.count);
      } catch {
        // Transient network hiccup — next poll tick will retry.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-elevated)]">
        <QRCodeSVG value={checkinUrl} size={360} level="M" />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          Jumlah Hadir
        </p>
        <p className="text-7xl font-extrabold tabular-nums text-primary-700">{count ?? "-"}</p>
      </div>

      <p className="max-w-md text-center text-sm text-text-muted">
        Pindai QR Code di atas dengan kamera HP Anda untuk melakukan presensi mandiri.
      </p>
    </div>
  );
}
