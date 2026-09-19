import Link from "next/link";
import { Countdown } from "./countdown";
import { Icon } from "./icon";

// NOTE: the Stitch export hardcodes "24 - 26 Oktober 2025" for this event,
// which conflicts with this existing target date. Kept the existing date
// (used for the live countdown) rather than silently overwriting it with an
// unconfirmed one from the design mockup — confirm with Bara/Ainin which is
// correct and update both the countdown target and the label below together.
const EVENT_DATE = "2026-11-14T08:00:00+07:00";
const EVENT_DATE_LABEL = "14 November 2026";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-stitch-primary-container via-stitch-primary to-stitch-tertiary-container text-stitch-on-primary">
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-stitch-primary-container/95 via-stitch-primary-container/70 to-transparent" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-stitch-secondary-container/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-margin-sm py-space-xl text-center lg:px-margin lg:py-24">
        <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-stitch-secondary-container px-4 py-1.5 text-stitch-on-secondary-container shadow-sm">
          <Icon name="stars" className="text-[16px]" />
          <span className="text-label-sm font-bold uppercase tracking-wider">Rapat Kerja Wilayah</span>
        </div>

        <h1 className="mb-space-md max-w-4xl text-display-mobile tracking-tight text-white drop-shadow-sm sm:text-display">
          AMKI Wilayah Jawa Timur
        </h1>

        <p className="mb-space-lg max-w-3xl text-title-md font-normal leading-relaxed text-stitch-on-primary-container">
          &ldquo;Revitalisasi Masjid Kampus sebagai Episentrum Transformasi Moral, Sains, dan
          Peradaban Bangsa&rdquo;
        </p>

        <div className="mb-space-xl inline-flex flex-wrap items-center justify-center gap-x-space-md gap-y-2 rounded-full bg-stitch-surface-container-lowest/15 px-space-lg py-2.5 text-label-lg text-stitch-on-primary shadow-inner backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Icon name="location_on" className="text-[18px] text-stitch-secondary-fixed" />
            <span>Surabaya, Jawa Timur</span>
          </div>
          <span className="hidden text-white/40 sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Icon name="calendar_month" className="text-[18px] text-stitch-secondary-fixed" />
            <span>{EVENT_DATE_LABEL}</span>
          </div>
          <span className="hidden text-white/40 sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Icon name="account_balance" className="text-[18px] text-stitch-secondary-fixed" />
            <span>Gedung Riset &amp; Masjid Al-Hikmah</span>
          </div>
        </div>

        <Countdown targetIso={EVENT_DATE} />

        <div className="flex flex-col items-center gap-space-md sm:flex-row">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stitch-secondary-container px-8 py-3.5 text-headline-sm font-bold text-stitch-on-secondary-container shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
          >
            <span>Daftar Sekarang</span>
            <Icon name="arrow_forward" className="text-[20px]" />
          </Link>
          <Link
            href="#rundown"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stitch-surface-container-lowest/15 px-8 py-3.5 text-headline-sm text-white backdrop-blur-md transition-all duration-200 hover:bg-stitch-surface-container-lowest/25 sm:w-auto"
          >
            <span>Lihat Rundown</span>
            <Icon name="event_note" className="text-[20px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
