"use client";

import { useState } from "react";
import { motion } from "@/components/ui/motion";
import { Icon } from "./icon";

interface RundownItem {
  step: string;
  title: string;
  description: string;
}

interface RundownDay {
  label: string;
  items: RundownItem[];
}

// Official agenda per the Proposal Kegiatan Rakerwil II PW AMKI Jatim 2026 —
// a single-day event (21 November 2026 di UNISMA Malang), so there is only
// one "day" here.
const RUNDOWN: RundownDay[] = [
  {
    label: "21 November 2026",
    items: [
      {
        step: "07.00 – 08.00 WIB",
        title: "Registrasi Peserta",
        description: "Registrasi ulang dan penyambutan seluruh delegasi masjid kampus se-Jawa Timur.",
      },
      {
        step: "08.00 – 09.00 WIB",
        title: "Pembukaan Rakerwil PW AMKI Jawa Timur",
        description:
          "Lagu Indonesia Raya & Mars AMKI, pembukaan oleh MC, tilawah Al-Qur'an, sambutan Ketua PW AMKI Jawa Timur, sambutan Rektor UNISMA, sambutan Ketua PP AMKI, seremonial pembukaan Rakerwil, dan pembacaan do'a.",
      },
      {
        step: "09.15 – 11.30 WIB",
        title: "Diskusi Panel & Keynote Speech",
        description:
          "Menghadirkan Ketua PP AMKI, Rektor Universitas Islam Malang (UNISMA), Majelis Ulama Indonesia (MUI) Provinsi Jawa Timur, dan Badan Amil Zakat Nasional (BAZNAS) Jawa Timur.",
      },
      {
        step: "11.30 – 12.30 WIB",
        title: "Ishoma",
        description: "Istirahat, sholat, dan makan siang bersama seluruh delegasi.",
      },
      {
        step: "12.30 – 15.30 WIB",
        title: "Rapat Kerja & Sidang Komisi",
        description:
          "Penyusunan & penetapan program kerja PW AMKI Jatim 2026/2027 melalui Sidang Komisi A (Tata Kelola & Rumah Amal), Komisi B (Pembinaan AMKI Muda), dan Komisi C (Kemitraan Strategis & Inovasi Syariah), serta konsolidasi dan penetapan pengurus AMKI Muda Jawa Timur.",
      },
      {
        step: "15.30 – 16.00 WIB",
        title: "Penutupan Rakerwil PW AMKI Jawa Timur",
        description: "Pengumuman hasil sidang dan penutupan resmi Rakerwil II AMKI Jawa Timur 2026.",
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

      <motion.ol className="relative space-y-8 pl-6 sm:pl-10">
        <div className="absolute bottom-3 left-2 top-3 w-0.5 bg-stitch-primary/20 sm:left-4" />
        {activeDay.items.map((item) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px 0px -50px 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group relative flex items-start"
          >
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
