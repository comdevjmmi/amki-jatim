"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import type { Variants } from "framer-motion";
import { Countdown } from "./countdown";
import { Icon } from "./icon";

// Official date per the Surat Undangan & Rundown Rakerwil AMKI Jatim 2026.
// No specific start time was given — 08:00 WIB assumed (typical registration
// opening time); update here if the real invitation states otherwise.
const EVENT_DATE = "2026-10-24T08:00:00+07:00";
const EVENT_DATE_LABEL = "24 Oktober 2026";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-stitch-primary-container via-stitch-primary to-stitch-tertiary-container text-stitch-on-primary">
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-stitch-primary-container/95 via-stitch-primary-container/70 to-transparent" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-stitch-secondary-container/15 blur-3xl" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-margin-sm py-space-xl text-center lg:px-margin lg:py-24"
      >
        <motion.div
          variants={item}
          className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-stitch-secondary-container px-4 py-1.5 text-stitch-on-secondary-container shadow-sm"
        >
          <Icon name="stars" className="text-[16px]" />
          <span className="text-label-sm font-bold uppercase tracking-wider">Rapat Kerja Wilayah</span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mb-space-md max-w-4xl text-display-mobile tracking-tight text-white drop-shadow-sm sm:text-display"
        >
          PW AMKI Wilayah Jawa Timur
        </motion.h1>

        <motion.p
          variants={item}
          className="mb-space-lg max-w-3xl text-title-md font-normal leading-relaxed text-stitch-on-primary-container"
        >
          &ldquo;Revitalisasi Masjid Kampus sebagai Episentrum Transformasi Moral, Sains, dan
          Peradaban Bangsa&rdquo;
        </motion.p>

        <motion.div
          variants={item}
          className="mb-space-xl inline-flex flex-wrap items-center justify-center gap-x-space-md gap-y-2 rounded-full bg-stitch-surface-container-lowest/15 px-space-lg py-2.5 text-label-lg text-stitch-on-primary shadow-inner backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5">
            <Icon name="location_on" className="text-[18px] text-stitch-secondary-fixed" />
            <span>Lamongan, Jawa Timur</span>
          </div>
          <span className="hidden text-white/40 sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Icon name="calendar_month" className="text-[18px] text-stitch-secondary-fixed" />
            <span>{EVENT_DATE_LABEL}</span>
          </div>
          <span className="hidden text-white/40 sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <Icon name="account_balance" className="text-[18px] text-stitch-secondary-fixed" />
            <span>Universitas Islam Darul Ulum (UNISDA) Lamongan</span>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Countdown targetIso={EVENT_DATE} />
        </motion.div>

        <motion.div variants={item} className="flex flex-col items-center gap-space-md sm:flex-row">
          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-stitch-secondary-container px-8 py-3.5 text-headline-sm font-bold text-stitch-on-secondary-container shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
            >
              <span>Daftar Sekarang</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Link
              href="#rundown"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-stitch-surface-container-lowest/15 px-8 py-3.5 text-headline-sm text-white backdrop-blur-md transition-all duration-200 hover:bg-stitch-surface-container-lowest/25 sm:w-auto"
            >
              <span>Lihat Rundown</span>
              <Icon name="event_note" className="text-[20px]" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
