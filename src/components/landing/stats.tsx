import type { LandingStats } from "@/lib/data/landing-stats";

export function Stats({ participantCount, masjidKampusCount, kotaCount }: LandingStats) {
  const items = [
    { value: participantCount, label: "Peserta Terdaftar" },
    { value: masjidKampusCount, label: "Masjid Kampus" },
    { value: kotaCount, label: "Kabupaten/Kota" },
  ];

  return (
    <section
      className="px-6 py-16 text-center text-white"
      style={{
        backgroundImage: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
      }}
    >
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-4xl font-bold tabular-nums sm:text-5xl">{item.value}</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-widest text-primary-50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
