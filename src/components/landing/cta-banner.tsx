import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="px-6 py-16">
      <div
        className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-xl px-8 py-12 text-center text-white shadow-[var(--shadow-elevated)]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--color-accent-600), var(--color-accent-500))",
        }}
      >
        <h2 className="text-2xl font-bold sm:text-3xl">
          Belum daftar sebagai delegasi?
        </h2>
        <p className="max-w-xl text-amber-50">
          Isi formulir registrasi sekarang agar Masjid Kampus Anda terdaftar
          sebagai peserta Rakerwil AMKI Jawa Timur.
        </p>
        <Link
          href="/register"
          className="rounded-full border border-white/70 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Daftar Sekarang
        </Link>
      </div>
    </section>
  );
}
