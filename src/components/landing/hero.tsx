import Link from "next/link";
import { Countdown } from "./countdown";

const EVENT_DATE = "2026-11-14T08:00:00+07:00";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 text-center text-white sm:py-32"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <span className="rounded-full bg-accent-500 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          Rapat Kerja Wilayah
        </span>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          AMKI Wilayah Jawa Timur
        </h1>

        <p className="max-w-xl text-lg leading-8 text-primary-50">
          Registrasi peserta &amp; delegasi Masjid Kampus, serta Pemilihan
          Ketua AMKI Jawa Timur periode mendatang.
        </p>

        <Countdown targetIso={EVENT_DATE} />

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-accent-500 px-8 py-3 text-sm font-semibold text-white shadow-[var(--shadow-elevated)] transition-colors hover:bg-accent-600"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="#rundown"
            className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Lihat Rundown
          </Link>
        </div>
      </div>
    </section>
  );
}
