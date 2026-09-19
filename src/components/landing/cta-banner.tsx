"use client";

import Link from "next/link";
import { motion } from "@/components/ui/motion";
import { Icon } from "./icon";

export function CtaBanner() {
  return (
    <section id="daftar" className="w-full bg-stitch-surface py-space-xl lg:py-24">
      <div className="mx-auto max-w-5xl px-margin-sm lg:px-margin">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stitch-secondary-container via-stitch-secondary-container to-stitch-secondary p-space-xl text-center text-white shadow-2xl sm:p-12">
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <div className="mb-space-md flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Icon name="app_registration" className="text-[24px] text-white" />
            </div>
            <h2 className="mb-space-sm text-headline-lg font-extrabold leading-snug tracking-tight text-white">
              Belum daftar sebagai delegasi?
            </h2>
            <p className="mb-space-xl max-w-lg text-body-lg leading-relaxed text-white/95">
              Pastikan delegasi takmir masjid kampus Anda terdaftar resmi sebelum batas akhir{" "}
              <span className="font-bold underline decoration-white/50">20 Oktober 2026</span> untuk
              alokasi akomodasi dan hak suara komisi.
            </p>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full bg-stitch-surface-container-lowest px-10 py-4 text-headline-sm font-bold text-stitch-secondary shadow-xl transition-all duration-200 hover:scale-105 hover:bg-stitch-surface-container-low"
              >
                <span>Daftar Sekarang</span>
                <Icon name="how_to_reg" className="text-[20px]" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
