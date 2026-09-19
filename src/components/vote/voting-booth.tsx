"use client";

import { useState } from "react";
import Link from "next/link";
import { castVote } from "@/app/vote/actions";
import type { Candidate } from "@/lib/types";

type Step = "token" | "ballot" | "success";

export function VotingBooth({ candidates, initialToken }: { candidates: Candidate[]; initialToken?: string }) {
  const validInitialToken = initialToken && initialToken.trim().length >= 6 ? initialToken.trim() : "";
  const [step, setStep] = useState<Step>(validInitialToken ? "ballot" : "token");
  const [token, setToken] = useState(validInitialToken);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleTokenSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = token.trim();
    if (trimmed.length < 6) {
      setTokenError("Token tidak valid. Periksa kembali kode yang Anda terima dari panitia.");
      return;
    }
    setTokenError(null);
    setStep("ballot");
  }

  async function handleConfirmVote() {
    if (!confirming) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await castVote(token, confirming.id);

    if (result.status === "success") {
      setStep("success");
      setConfirming(null);
    } else {
      setSubmitError(result.message ?? "Gagal mengirim suara.");
      setConfirming(null);
    }
    setIsSubmitting(false);
  }

  if (step === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
          <span className="text-2xl text-primary-700">✓</span>
        </div>
        <h2 className="text-xl font-bold text-text">Suara Anda Berhasil Dicatat!</h2>
        <p className="mt-2 text-sm text-text-muted">
          Terima kasih telah menggunakan hak suara Anda. Token yang tadi digunakan tidak bisa
          dipakai lagi.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-primary-700 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (step === "token") {
    return (
      <form
        onSubmit={handleTokenSubmit}
        className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-8 shadow-[var(--shadow-card)]"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Masukkan Token Voting Anda</span>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="AMKI-XXXXXX"
            autoFocus
            autoComplete="off"
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-center font-mono text-lg uppercase tracking-widest text-text outline-none focus:border-primary-500"
          />
        </label>
        {tokenError && <p className="mt-3 text-sm text-rose-700">{tokenError}</p>}
        {submitError && <p className="mt-3 text-sm text-rose-700">{submitError}</p>}
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Lanjutkan
        </button>
      </form>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            {c.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.foto_url}
                alt={c.nama}
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-700">
                {c.nama.charAt(0).toUpperCase()}
              </div>
            )}
            {c.nomor_urut != null && (
              <p className="mt-4 text-center text-sm font-semibold uppercase tracking-widest text-primary-600">
                Nomor Urut {c.nomor_urut}
              </p>
            )}
            <h3 className="mt-1 text-center text-lg font-bold text-text">{c.nama}</h3>
            {c.asal_kampus && (
              <p className="text-center text-sm text-text-muted">{c.asal_kampus}</p>
            )}
            {c.visi_misi && (
              <p className="mt-3 flex-1 whitespace-pre-line text-sm text-text-muted">{c.visi_misi}</p>
            )}
            <button
              type="button"
              onClick={() => setConfirming(c)}
              className="mt-4 w-full rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Pilih
            </button>
          </div>
        ))}
      </div>

      {submitError && (
        <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
          {submitError}
        </p>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-[var(--shadow-elevated)]">
            <h3 className="text-lg font-bold text-text">Konfirmasi Suara</h3>
            <p className="mt-2 text-sm text-text-muted">
              Apakah Anda yakin memilih <span className="font-semibold text-text">{confirming.nama}</span>?
              Suara tidak dapat diubah kembali.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={isSubmitting}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex-1 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : "Ya, Pilih"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
