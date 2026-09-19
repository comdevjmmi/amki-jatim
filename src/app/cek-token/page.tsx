import Image from "next/image";
import Link from "next/link";
import { TokenLookupForm } from "@/components/cek-token/token-lookup-form";

export const metadata = {
  title: "Cek Token Pemilih — Rakerwil AMKI Jawa Timur",
};

export default function CekTokenPage() {
  return (
    <div className="flex flex-1 flex-col bg-surface-muted px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/vote" className="text-sm text-text-muted hover:text-primary-700">
          &larr; Kembali ke Bilik Suara
        </Link>
        <div className="mt-4 flex flex-col items-center text-center">
          <Image src="/images/amki-logo.png" alt="Logo AMKI Jawa Timur" width={48} height={48} className="h-12 w-auto object-contain" priority />
          <h1 className="mt-4 text-xl font-bold text-text sm:text-2xl">
            Pemeriksaan Hak Suara &amp; Token Pemilih
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Masukkan Email dan Nomor WhatsApp yang Anda gunakan saat registrasi untuk memeriksa
            hak suara Anda.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <TokenLookupForm />
      </div>
    </div>
  );
}
