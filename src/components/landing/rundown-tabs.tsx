"use client";

import { useState } from "react";
import { motion } from "@/components/ui/motion";
import type { Variants } from "framer-motion";
import { Icon } from "./icon";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -35 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface RundownItem {
  step: string;
  title: string;
  description: string;
}

interface RundownDay {
  label: string;
  items: RundownItem[];
}

// Official agenda per the Surat Undangan & Rundown Rakerwil AMKI Jatim 2026 —
// a single-day event (24 Oktober 2026), so there is only one "day" here. No
// specific clock times were given for each session, so a sequence marker
// ("Sesi N") is shown instead of a fabricated time range.
const RUNDOWN: RundownDay[] = [
  {
    label: "24 Oktober 2026",
    items: [
      {
        step: "Sesi 1",
        title: "Registrasi Delegasi",
        description: "Registrasi ulang dan penyambutan seluruh delegasi masjid kampus se-Jawa Timur.",
      },
      {
        step: "Sesi 2",
        title: "Pembukaan",
        description: "Sambutan pembukaan oleh Rektor UNISDA Lamongan dan Ketua DPW AMKI Jawa Timur.",
      },
      {
        step: "Sesi 3",
        title: "Pengarahan Ketua Umum AMKI Pusat",
        description: "Pengarahan dan pembinaan dari Ketua Umum AMKI Pusat.",
      },
      {
        step: "Sesi 4",
        title: "Paparan Program Kerja",
        description: "Pemaparan program kerja wilayah AMKI Jawa Timur.",
      },
      {
        step: "Sesi 5",
        title: "Sharing Session",
        description: "Sesi berbagi pengalaman dan diskusi terbuka antar delegasi masjid kampus.",
      },
      {
        step: "Sesi 6",
        title: "Diskusi Komisi",
        description: "Pembahasan dan penyusunan rekomendasi program kerja per komisi.",
      },
      {
        step: "Sesi 7",
        title: "Sidang Pleno",
        description:
          "Pengesahan hasil sidang komisi dan penetapan rekomendasi wilayah, termasuk pemilihan Ketua AMKI Jawa Timur periode berikutnya.",
      },
      {
        step: "Sesi 8",
        title: "Penutupan",
        description: "Pengumuman hasil sidang dan penutupan resmi Rakerwil AMKI Jawa Timur 2026.",
      },
    ],
  },
];

export function RundownTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = RUNDOWN[activeIndex];

  return (
    <div>
      {RUNDOWN.length > 1 && (
        <div className="mb-space-xl flex flex-wrap items-center justify-center gap-space-sm">
          {RUNDOWN.map((day, index) => (
            <button
              key={day.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-full px-6 py-2.5 text-label-lg transition-all duration-200 ${
                index === activeIndex
                  ? "bg-stitch-primary-container text-stitch-on-primary shadow-md"
                  : "bg-stitch-surface-container text-stitch-on-surface-variant hover:bg-stitch-surface-container-high"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}

      <motion.ol
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative space-y-8 pl-6 sm:pl-10"
      >
        <div className="absolute bottom-3 left-2 top-3 w-0.5 bg-stitch-primary/20 sm:left-4" />
        {activeDay.items.map((item) => (
          <motion.li key={item.title} variants={cardVariants} className="group relative flex items-start">
            <div className="absolute -left-6 mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-stitch-primary ring-4 ring-stitch-surface sm:-left-10 sm:h-5 sm:w-5">
              <span className="h-1.5 w-1.5 rounded-full bg-stitch-surface-container-lowest" />
            </div>
            <div className="w-full rounded-xl bg-stitch-surface-container-lowest p-space-lg shadow-sm transition-all duration-200 group-hover:shadow-md">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stitch-secondary-container px-3 py-1 text-label-sm font-bold tracking-wide text-stitch-on-secondary-container">
                  {item.step}
                </span>
              </div>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-headline-sm font-bold text-stitch-on-surface">
                <Icon name="schedule" className="text-[16px] text-stitch-primary" />
                {item.title}
              </h3>
              <p className="leading-relaxed text-stitch-on-surface-variant">{item.description}</p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
