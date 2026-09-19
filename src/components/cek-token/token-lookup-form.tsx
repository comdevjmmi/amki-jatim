"use client";

import { useState } from "react";
import Link from "next/link";
import { safeTokenLookup, type TokenLookupResult } from "@/app/cek-token/actions";
import { maskEmail, maskPhone, normalizePhone } from "@/lib/mask";
import { Icon } from "@/components/landing/icon";

export function TokenLookupForm() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TokenLookupResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setCopied(false);
    const r = await safeTokenLookup(email, whatsapp);
    setResult(r);
    setIsLoading(false);
  }

  async function handleCopy(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      // Clipboard API unavailable — token is still visible on screen to copy manually.
    }
  }

  const maskedEmail = maskEmail(email.trim().toLowerCase());
  const maskedPhone = maskPhone(normalizePhone(whatsapp));

  return (
    <div className="mx-auto w-full max-w-md">
      {!result || result.status === "not_found" || result.status === "rate_limited" || result.status === "error" ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
            />
          </label>
          <label className="mt-4 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text">Nomor WhatsApp</span>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
            />
          </label>

          {result && (
            <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{result.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Memeriksa..." : "Cek Token Saya"}
          </button>

          <div className="mt-6 flex gap-3 rounded-md border border-primary-200 bg-primary-50 p-4 text-xs text-text-muted">
            <Icon name="lock" className="mt-0.5 shrink-0 text-base text-primary-700" />
            <p>
              Verifikasi diproses melalui enkripsi SSL/TLS hanya untuk pencocokan hak suara resmi
              Rakerwil AMKI Jatim 2026 di UNISDA Lamongan. Sesuai asas LUBERJURDIL, pilihan suara
              Anda di bilik suara dijamin 100% anonim dan rahasia (Secret Ballot).
            </p>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="text-sm">
            <p className="font-semibold text-text">{result.profile?.nama}</p>
            <p className="text-text-muted">{result.profile?.kampus}</p>
            <p className="mt-1 text-xs text-text-muted">
              {maskedEmail} &middot; {maskedPhone}
            </p>
          </div>

          {result.status === "not_approved" && (
            <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{result.message}</p>
          )}

          {result.status === "peninjau" && (
            <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{result.message}</p>
          )}

          {result.status === "already_used" && (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>{result.message}</p>
              {result.usedAt && (
                <p className="mt-1 text-xs text-emerald-700">
                  Waktu pencoblosan: {new Date(result.usedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                </p>
              )}
            </div>
          )}

          {result.status === "ready" && result.token && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Status Peserta Penuh — Token Anda</p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-primary-300 bg-primary-50 px-4 py-3">
                <span className="font-mono text-lg font-bold tracking-widest text-primary-800">{result.token}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.token!)}
                  className="shrink-0 rounded-full border border-primary-500 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                >
                  {copied ? "Tersalin!" : "Salin Token"}
                </button>
              </div>
              <Link
                href={`/vote?token=${encodeURIComponent(result.token)}`}
                className="mt-4 block w-full rounded-full bg-primary-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-primary-600"
              >
                Masuk ke Bilik Suara
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setResult(null)}
            className="mt-4 w-full text-center text-xs font-medium text-text-muted hover:text-primary-700"
          >
            &larr; Cek data lain
          </button>
        </div>
      )}
    </div>
  );
}
