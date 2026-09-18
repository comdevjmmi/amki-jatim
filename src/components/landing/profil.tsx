const CARDS = [
  {
    title: "Tentang AMKI",
    description:
      "Asosiasi Masjid Kampus Indonesia (AMKI) mewadahi sinergi pengelolaan masjid kampus se-Jawa Timur.",
  },
  {
    title: "Tujuan Rakerwil",
    description:
      "Menyusun program kerja wilayah, mempererat jejaring delegasi, dan memilih Ketua AMKI Jawa Timur periode berikutnya.",
  },
  {
    title: "Lokasi & Fasilitas",
    description:
      "Bertempat di kampus tuan rumah dengan fasilitas penginapan, konsumsi, dan ruang sidang bagi seluruh delegasi.",
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
            <div className="mb-4 h-10 w-10 rounded-full bg-primary-100" />
            <h3 className="font-semibold text-text">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
