"use client";

import { motion } from "@/components/ui/motion";
import type { Variants } from "framer-motion";
import { Icon } from "./icon";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

interface ProfilCard {
  icon: string;
  title: string;
  tag: string;
  description?: string;
  items?: string[];
}

// Narrative per Proposal Kegiatan Rakerwil II PW AMKI Jatim 2026: latar
// belakang (Rakerwil I ITS 2024 → Rakerwil II UNISMA 2026), 3 pilar utama,
// dan 4 tujuan kegiatan.
const CARDS: ProfilCard[] = [
  {
    icon: "mosque",
    title: "Latar Belakang",
    description:
      "Dua tahun setelah Rakerwil I 2024 di ITS Surabaya, Rakerwil II AMKI Jawa Timur 2026 di UNISMA Malang menjadi babak akselerasi program nyata — dari konsolidasi menuju dampak yang terukur bagi masjid kampus se-Jawa Timur.",
    tag: "ITS Surabaya 2024 → UNISMA Malang 2026",
  },
  {
    icon: "target",
    title: "3 Pilar Utama",
    items: [
      "Pengembangan Rumah Amal Masjid Kampus (YRAMKI) & resiliensi finansial berbasis ZISWAF yang akuntabel.",
      "Penguatan & rekrutmen basis Takmir Muda (AMKI Muda): leadership, entrepreneurship, literasi digital.",
      "Sinergi & kemitraan strategis dengan DUDI, perbankan syariah, lembaga ZISWAF nasional, BUMN, dan CSR/ESG.",
    ],
    tag: "Rencana Aksi Wilayah",
  },
  {
    icon: "flag",
    title: "4 Tujuan Kegiatan",
    items: [
      "Mengevaluasi capaian 2 tahun kepengurusan dan memantapkan program kerja strategis berikutnya.",
      "Inisiasi & standardisasi tata kelola unit Rumah Amal Masjid Kampus di setiap PTN/PTS se-Jawa Timur.",
      "Penguatan struktur, jejaring, dan roadmap pembinaan AMKI Muda se-Jawa Timur.",
      "Membangun resiliensi finansial dan skema usaha otonom masjid serta wakaf produktif.",
    ],
    tag: "225 Peserta & Panitia",
  },
];

export function Profil() {
  return (
    <section id="profil-kegiatan" className="w-full bg-stitch-surface-container-low py-space-xl lg:py-24">
      <div className="mx-auto max-w-7xl px-margin-sm lg:px-margin">
        <div className="mb-space-xl text-center">
          <div className="mb-space-xs inline-flex items-center gap-1 text-stitch-primary">
            <Icon name="verified" className="text-[18px]" />
            <span className="text-label-md font-bold uppercase tracking-widest">Visi &amp; Pilar</span>
          </div>
          <h2 className="mb-space-xs text-headline-lg font-extrabold tracking-tight text-stitch-on-surface">
            Profil Kegiatan
          </h2>
          <p className="mx-auto max-w-xl text-stitch-on-surface-variant">
            Mengenal Peran dan Visi Strategis Rakerwil AMKI Jawa Timur
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -6 }}
              className="flex flex-col justify-between rounded-xl bg-stitch-surface-container-lowest p-space-xl shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div>
                <div className="mb-space-lg flex h-14 w-14 items-center justify-center rounded-full bg-stitch-primary/10 text-stitch-primary">
                  <Icon name={card.icon} className="text-[28px]" />
                </div>
                <h3 className="mb-space-sm text-headline-sm font-bold text-stitch-on-surface">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="mb-space-md leading-relaxed text-stitch-on-surface-variant">
                    {card.description}
                  </p>
                )}
                {card.items && (
                  <ul className="mb-space-md flex flex-col gap-space-xs">
                    {card.items.map((entry) => (
                      <li
                        key={entry}
                        className="flex items-start gap-space-xs leading-relaxed text-stitch-on-surface-variant"
                      >
                        <Icon name="check_circle" className="mt-0.5 shrink-0 text-[16px] text-stitch-primary" />
                        <span>{entry}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-label-md font-bold text-stitch-primary">
                <span>{card.tag}</span>
                <Icon name="chevron_right" className="text-[16px]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
