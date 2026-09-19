import { Icon } from "./icon";

const CARDS = [
  {
    icon: "mosque",
    title: "Tentang AMKI",
    description:
      "Asosiasi Masjid Kampus Indonesia mewadahi pengurus dan aktivis takmir masjid universitas dalam membangun ekosistem sivitas akademika yang religius, berwawasan global, dan profesional.",
    tag: "Fasilitator Sinergi Kampus",
  },
  {
    icon: "target",
    title: "Tujuan Rakerwil",
    description:
      "Menyelaraskan peta jalan dakwah kampus, digitalisasi layanan jamaah, standardisasi tata kelola keuangan wakaf, serta memperkuat jejaring antar-masjid kampus se-Jawa Timur.",
    tag: "Rencana Aksi Wilayah",
  },
  {
    icon: "domain",
    title: "Lokasi & Fasilitas",
    description:
      "Diselenggarakan di kompleks kampus terpadu dengan akomodasi wisma tamu representatif, auditorium berkapasitas 500 peserta, serta akses langsung ke sarana ibadah masjid utama.",
    tag: "Akses & Logistik Terjamin",
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
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-xl bg-stitch-surface-container-lowest p-space-xl shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div>
                <div className="mb-space-lg flex h-14 w-14 items-center justify-center rounded-full bg-stitch-primary/10 text-stitch-primary">
                  <Icon name={card.icon} className="text-[28px]" />
                </div>
                <h3 className="mb-space-sm text-headline-sm font-bold text-stitch-on-surface">
                  {card.title}
                </h3>
                <p className="mb-space-md leading-relaxed text-stitch-on-surface-variant">
                  {card.description}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-label-md font-bold text-stitch-primary">
                <span>{card.tag}</span>
                <Icon name="chevron_right" className="text-[16px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
