"use client";

import { useState } from "react";

interface RundownItem {
  time: string;
  title: string;
  description: string;
}

interface RundownDay {
  label: string;
  items: RundownItem[];
}

const RUNDOWN: RundownDay[] = [
  {
    label: "Hari 1",
    items: [
      {
        time: "08.00 - 09.00",
        title: "Registrasi Ulang & Presensi Delegasi",
        description: "Check-in peserta, pembagian id card dan materi acara.",
      },
      {
        time: "09.00 - 10.00",
        title: "Pembukaan & Sambutan",
        description: "Sambutan panitia, pengurus wilayah, dan tamu kehormatan.",
      },
      {
        time: "10.00 - 12.00",
        title: "Sesi Materi 1",
        description: "Pemaparan materi kerja wilayah oleh narasumber.",
      },
    ],
  },
  {
    label: "Hari 2",
    items: [
      {
        time: "08.00 - 10.00",
        title: "Sesi Materi 2",
        description: "Diskusi & lokakarya program kerja masjid kampus.",
      },
      {
        time: "10.00 - 12.00",
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
        title: "Sidang Pleno",
        description: "Pengesahan hasil sidang komisi.",
      },
      {
        time: "10.00 - 12.00",
        title: "Pemilihan Ketua AMKI Jawa Timur",
        description: "Proses pencalonan dan pemilihan ketua periode berikutnya.",
      },
      {
        time: "12.00 - 13.00",
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
      <div className="flex flex-wrap justify-center gap-2">
        {RUNDOWN.map((day, index) => (
          <button
            key={day.label}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              index === activeIndex
                ? "bg-primary-500 text-white"
                : "border border-border text-text-muted hover:border-primary-500 hover:text-primary-700"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-6">
        {activeDay.items.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span className="h-fit shrink-0 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
              {item.time}
            </span>
            <div className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
              <p className="font-semibold text-text">{item.title}</p>
              <p className="mt-1 text-sm text-text-muted">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
