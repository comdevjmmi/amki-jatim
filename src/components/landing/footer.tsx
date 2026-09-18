export function Footer() {
  return (
    <footer className="bg-text px-6 py-12 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-bold text-white">AMKI Jawa Timur</p>
          <p className="mt-2 max-w-xs text-sm">
            Asosiasi Masjid Kampus Indonesia — Wilayah Jawa Timur.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-white">Kontak Panitia</p>
          <p className="mt-2">rakerwil@amki-jatim.or.id</p>
          <p>+62 812-3456-7890</p>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-slate-400">
        © {new Date().getFullYear()} AMKI Wilayah Jawa Timur. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}
