"use client";

import { useState } from "react";
import { Icon } from "./icon";

interface RundownItem {
  time: string;
  title: string;
  description: string;
  room: string;
  roomIcon: string;
}

interface RundownDay {
  label: string;
  items: RundownItem[];
}

// Hari 1 content ported verbatim from the Stitch export (the single source
// of truth for this page). Hari 2/3 have no equivalent there — the mockup
// never designed content for those tabs — so the existing placeholder
// content is kept rather than deleted.
const RUNDOWN: RundownDay[] = [
  {
    label: "Hari 1",
    items: [
      {
        time: "08.00 - 09.00 WIB",
        room: "Auditorium Utama",
        roomIcon: "meeting_room",
        title: "Registrasi Delegasi & Pembukaan Resmi",
        description:
          "Penyambutan delegasi takmir masjid kampus PTN/PTS se-Jawa Timur, pengukuhan tata tertib musyawarah, dan pembukaan oleh Ketua DPW AMKI Jatim.",
      },
      {
        time: "09.15 - 11.45 WIB",
        room: "Sesi Paripurna I",
        roomIcon: "campaign",
        title: "Keynote Speech: Tata Kelola Masjid Kampus Berstandar Mutu",
        description:
          "Pemaparan best practices manajemen wakaf produktif, integrasi sains & Islam di perguruan tinggi, serta strategi pembinaan kader mahasiswa era AI.",
      },
      {
        time: "13.00 - 15.30 WIB",
        room: "Ruang Sidang Pararel",
        roomIcon: "groups",
        title: "Sidang Pleno & Pembagian Komisi Kerja",
        description:
          "Pemusatan bahasan pada Komisi A: Riset & Pengabdian Masyarakat, Komisi B: Pemberdayaan Generasi Muda & Kaderisasi, serta Komisi C: Keuangan & Jejaring Usaha Masjid.",
      },
      {
        time: "16.00 - 17.30 WIB",
        room: "Pleno Pengesahan",
        roomIcon: "fact_check",
        title: "Konsolidasi Wilayah & Penyusunan Resolusi Jatim",
        description:
          "Perumusan rekomendasi strategis masjid kampus untuk program kerja wilayah berikutnya serta penandatanganan Piagam Sinergi Perguruan Tinggi Jawa Timur.",
      },
    ],
  },
  {
    label: "Hari 2",
    items: [
      {
        time: "08.00 - 10.00",
        room: "Ruang Sidang",
        roomIcon: "groups",
        title: "Sesi Materi 2",
        description: "Diskusi & lokakarya program kerja masjid kampus.",
      },
      {
        time: "10.00 - 12.00",
        room: "Ruang Sidang",
        roomIcon: "groups",
        title: "Sidang Komisi",
        description: "Pembahasan rekomendasi per komisi.",
      },
    ],
  },
  {
    label: "Hari 3",
    items: [
      {
        time: "08.00 - 10.00",
        room: "Auditorium Utama",
        roomIcon: "meeting_room",
        title: "Sidang Pleno",
        description: "Pengesahan hasil sidang komisi.",
      },
      {
        time: "10.00 - 12.00",
        room: "Bilik Suara",
        roomIcon: "how_to_vote",
        title: "Pemilihan Ketua AMKI Jawa Timur",
        description: "Proses pencalonan dan pemilihan ketua periode berikutnya.",
      },
      {
        time: "12.00 - 13.00",
        room: "Auditorium Utama",
        roomIcon: "meeting_room",
        title: "Penutupan",
        description: "Pengumuman hasil dan penutupan Rakerwil.",
      },
    ],
  },
];

export function RundownTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = RUNDOWN[activeIndex];

  return (
    <div>
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

      <ol className="relative space-y-8 pl-6 sm:pl-10">
        <div className="absolute bottom-3 left-2 top-3 w-0.5 bg-stitch-primary/20 sm:left-4" />
        {activeDay.items.map((item) => (
          <li key={item.title} className="group relative flex items-start">
            <div className="absolute -left-6 mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-stitch-primary ring-4 ring-stitch-surface sm:-left-10 sm:h-5 sm:w-5">
              <span className="h-1.5 w-1.5 rounded-full bg-stitch-surface-container-lowest" />
            </div>
            <div className="w-full rounded-xl bg-stitch-surface-container-lowest p-space-lg shadow-sm transition-all duration-200 group-hover:shadow-md">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-stitch-secondary-container px-3 py-1 text-label-sm font-bold tracking-wide text-stitch-on-secondary-container">
                  {item.time}
                </span>
                <span className="flex items-center gap-1 text-label-sm text-stitch-primary">
                  <Icon name={item.roomIcon} className="text-[15px]" />
                  {item.room}
                </span>
              </div>
              <h3 className="mb-1.5 text-headline-sm font-bold text-stitch-on-surface">
                {item.title}
              </h3>
              <p className="leading-relaxed text-stitch-on-surface-variant">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
