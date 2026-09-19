"use client";

import type { LandingStats } from "@/lib/data/landing-stats";
import { AnimatedCounter } from "@/components/ui/motion";

export function Stats({ participantCount, masjidKampusCount, kotaCount }: LandingStats) {
  const items = [
    { value: participantCount, label: "Peserta Terdaftar", caption: "Delegasi & tamu undangan" },
    { value: masjidKampusCount, label: "Masjid Kampus Terdaftar", caption: "Mitra jejaring aktif" },
    { value: kotaCount, label: "Kabupaten / Kota", caption: "Cakupan regional" },
  ];

  return (
    <section id="statistik" className="relative w-full overflow-hidden bg-stitch-inverse-surface py-space-xl text-stitch-inverse-on-surface">
      <div className="absolute inset-0 bg-stitch-primary/10" />
      <div className="relative mx-auto max-w-7xl px-margin-sm lg:px-margin">
        <div className="grid grid-cols-1 gap-space-lg text-center sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="mb-1 text-display font-extrabold tracking-tight text-stitch-secondary-fixed">
                <AnimatedCounter value={item.value} />
              </span>
              <span className="text-headline-sm font-semibold text-stitch-inverse-on-surface">
                {item.label}
              </span>
              <span className="mt-1 text-body-sm text-stitch-surface-variant/70">{item.caption}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
