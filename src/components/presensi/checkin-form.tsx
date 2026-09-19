"use client";

import { useEffect, useState } from "react";
import { checkInSelf, type CheckinResult } from "@/app/presensi/[sessionId]/actions";

const STORAGE_KEY = "amki-presensi-whatsapp";

export function CheckinForm({ sessionId }: { sessionId: string }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [remembered, setRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  useEffect(() => {
    // Reading localStorage can only happen client-side post-mount (SSR has no
    // window), so this is the one legitimate case for setState directly in an
    // effect: hydrating from browser storage, not synchronizing derived state.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWhatsapp(saved);
        setRemembered(true);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — user just types it in.
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const r = await checkInSelf(sessionId, whatsapp);
    setResult(r);
    setIsLoading(false);

    if (r.status === "ok" || r.status === "already") {
      try {
        localStorage.setItem(STORAGE_KEY, whatsapp);
      } catch {
        // Non-fatal — smart prefill just won't work next time.
      }
    }
  }

  if (result?.status === "ok" || result?.status === "already") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-2xl text-emerald-700">✓</span>
        </div>
        <h2 className="text-lg font-bold text-text">
          {result.status === "already" ? "Anda Sudah Presensi" : "Presensi Berhasil!"}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{result.profile?.nama}</p>
        <p className="text-sm text-text-muted">{result.profile?.kampus}</p>
        {result.checkedInAt && (
          <p className="mt-2 text-xs text-text-muted">
            {new Date(result.checkedInAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Nomor WhatsApp</span>
        <input
          type="tel"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="rounded-md border border-border bg-surface px-4 py-3 text-center text-base text-text outline-none focus:border-primary-500"
        />
      </label>

      {result && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{result.message}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-primary-500 px-6 py-3.5 text-base font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Memproses..." : "Konfirmasi Hadir"}
      </button>

      {remembered && (
        <p className="text-center text-xs text-text-muted">
          Nomor WhatsApp Anda otomatis terisi dari presensi sebelumnya.
        </p>
      )}
    </form>
  );
}
