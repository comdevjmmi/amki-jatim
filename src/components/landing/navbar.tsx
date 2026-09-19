import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function Navbar({ isVotingVisible }: { isVotingVisible: boolean }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full bg-stitch-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-md px-margin-sm lg:px-margin">
        <Link href="/" className="flex flex-shrink-0 items-center gap-space-md">
          <Image src="/images/amki-logo.png" alt="Logo AMKI Jawa Timur" width={32} height={32} className="h-8 w-auto object-contain" priority />
          <div className="flex flex-col">
            <span className="text-headline-sm font-semibold leading-tight tracking-tight text-stitch-primary">
              AMKI JAWA TIMUR
            </span>
            <span className="text-label-sm uppercase tracking-wider text-stitch-on-surface-variant">
              Rakerwil
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-space-lg lg:flex">
          <Link href="/" className="font-bold text-stitch-primary transition-colors">
            Beranda
          </Link>
          <Link href="#rundown" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
            Rundown
          </Link>
          <Link href="#profil-kegiatan" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
            Profil Kegiatan
          </Link>
          <Link href="#statistik" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
            Statistik
          </Link>
          {isVotingVisible && (
            <>
              <Link href="/vote" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
                Bilik Suara
              </Link>
              <Link href="/cek-token" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
                Cek Token
              </Link>
              <Link href="/voting/live" className="text-label-lg text-stitch-on-surface-variant transition-colors hover:text-stitch-primary">
                Live Count
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-space-md">
          <Link
            href="/register"
            className="hidden items-center justify-center rounded-full bg-gradient-to-r from-stitch-tertiary-container to-stitch-primary-container px-space-lg py-space-sm text-label-lg text-stitch-on-primary shadow-[0_4px_12px_rgba(11,98,155,0.25)] transition-all hover:shadow-[0_6px_16px_rgba(11,98,155,0.35)] hover:brightness-105 sm:inline-flex"
          >
            Daftar Peserta
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stitch-primary">
            <Icon name="person" className="text-[18px] text-stitch-on-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
