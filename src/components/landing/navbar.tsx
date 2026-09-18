import Link from "next/link";

export function Navbar({ isVotingVisible }: { isVotingVisible: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary-700">
          AMKI Jatim
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted sm:flex">
          <Link href="/#rundown" className="hover:text-primary-700">
            Rundown
          </Link>
          <Link href="/#profil" className="hover:text-primary-700">
            Profil
          </Link>
          {isVotingVisible && (
            <Link href="/vote" className="hover:text-primary-700">
              Bilik Suara
            </Link>
          )}
        </nav>

        <Link
          href="/register"
          className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Daftar Peserta
        </Link>
      </div>
    </header>
  );
}
