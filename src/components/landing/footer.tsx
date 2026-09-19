import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function Footer() {
  return (
    <footer className="w-full bg-stitch-inverse-surface pb-space-lg pt-space-xl text-stitch-inverse-on-surface">
      <div className="mx-auto mb-space-xl grid max-w-7xl grid-cols-1 gap-space-xl px-margin-sm md:grid-cols-2 lg:grid-cols-4 lg:px-margin">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="rounded bg-stitch-surface-container-lowest p-space-xs">
              <Image src="/images/amki-logo.png" alt="Logo AMKI Jawa Timur" width={32} height={32} className="h-8 w-auto object-contain" />
            </div>
            <span className="text-headline-sm tracking-tight text-stitch-inverse-on-surface">
              AMKI JAWA TIMUR
            </span>
          </div>
          <p className="text-body-sm text-stitch-surface-variant/80">
            Wadah silaturahmi, akselerasi program, dan pemberdayaan takmir masjid kampus perguruan
            tinggi se-Jawa Timur.
          </p>
        </div>

        <div className="flex flex-col gap-space-md">
          <h4 className="text-headline-sm text-stitch-inverse-on-surface">Kontak Sekretariat</h4>
          <div className="flex flex-col gap-space-xs text-body-sm text-stitch-surface-variant/80">
            <p className="flex items-center gap-space-xs">
              <Icon name="mail" className="text-[16px] text-stitch-tertiary-fixed-dim" />
              kontak@amki-jatim.or.id
            </p>
            <p className="flex items-center gap-space-xs">
              <Icon name="call" className="text-[16px] text-stitch-tertiary-fixed-dim" />
              WhatsApp Center AMKI Jatim
            </p>
            <p className="flex items-start gap-space-xs">
              <Icon name="location_on" className="mt-0.5 text-[16px] text-stitch-tertiary-fixed-dim" />
              Sekretariat Kampus Jawa Timur
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          <h4 className="text-headline-sm text-stitch-inverse-on-surface">Navigasi Cepat</h4>
          <div className="flex flex-col gap-space-xs text-body-sm text-stitch-surface-variant/80">
            <Link href="/" className="transition-colors hover:text-stitch-tertiary-fixed-dim">
              Beranda Utama
            </Link>
            <Link href="#rundown" className="transition-colors hover:text-stitch-tertiary-fixed-dim">
              Jadwal &amp; Rundown Acara
            </Link>
            <Link href="#profil-kegiatan" className="transition-colors hover:text-stitch-tertiary-fixed-dim">
              Profil &amp; Komisi Kegiatan
            </Link>
            <Link href="/register" className="transition-colors hover:text-stitch-tertiary-fixed-dim">
              Registrasi Peserta
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          <h4 className="text-headline-sm text-stitch-inverse-on-surface">Media Sosial</h4>
          <p className="text-body-sm text-stitch-surface-variant/80">
            Ikuti kanal informasi resmi Rakerwil AMKI Jatim:
          </p>
          <div className="flex items-center gap-space-sm">
            <a
              aria-label="Instagram"
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stitch-surface-variant/10 text-stitch-inverse-on-surface transition-all hover:bg-stitch-tertiary hover:text-stitch-on-tertiary"
            >
              <Icon name="photo_camera" className="text-[20px]" />
            </a>
            <a
              aria-label="YouTube"
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stitch-surface-variant/10 text-stitch-inverse-on-surface transition-all hover:bg-stitch-tertiary hover:text-stitch-on-tertiary"
            >
              <Icon name="smart_display" className="text-[20px]" />
            </a>
            <a
              aria-label="LinkedIn"
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stitch-surface-variant/10 text-stitch-inverse-on-surface transition-all hover:bg-stitch-tertiary hover:text-stitch-on-tertiary"
            >
              <Icon name="share" className="text-[20px]" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-sm border-t border-stitch-surface-variant/10 px-margin-sm pt-space-md text-label-md text-stitch-surface-variant/60 sm:flex-row lg:px-margin">
        <span>
          &copy; {new Date().getFullYear()} Asosiasi Masjid Kampus Indonesia (AMKI) Wilayah Jawa
          Timur. Hak Cipta Dilindungi.
        </span>
        <span>Menuju Masjid Kampus Berdaya &amp; Berkeadaban</span>
      </div>
    </footer>
  );
}
