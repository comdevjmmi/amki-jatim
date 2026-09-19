import type { ReactNode } from "react";

const CARDS: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "Tentang AMKI",
    description:
      "Asosiasi Masjid Kampus Indonesia (AMKI) mewadahi sinergi pengelolaan masjid kampus se-Jawa Timur.",
    icon: (
      <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6M9 10h.01M15 10h.01" />
    ),
  },
  {
    title: "Tujuan Rakerwil",
    description:
      "Menyusun program kerja wilayah, mempererat jejaring delegasi, dan memilih Ketua AMKI Jawa Timur periode berikutnya.",
    icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    title: "Lokasi & Fasilitas",
    description:
      "Bertempat di kampus tuan rumah dengan fasilitas penginapan, konsumsi, dan ruang sidang bagi seluruh delegasi.",
    icon: (
      <path d="M12 21s-7-5.686-7-11a7 7 0 1114 0c0 5.314-7 11-7 11zM12 13a2 2 0 100-4 2 2 0 000 4z" />
    ),
  },
];

export function Profil() {
  return (
    <section id="profil" className="bg-surface-muted px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                {card.icon}
              </svg>
            </div>
            <h3 className="font-semibold text-text">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
