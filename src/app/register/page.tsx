import Link from "next/link";
import { RegistrationForm } from "@/components/register/registration-form";

export const metadata = {
  title: "Registrasi Peserta — Rakerwil AMKI Jawa Timur",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-text-muted hover:text-primary-700">
          &larr; Beranda
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
          Formulir Registrasi Delegasi
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Daftarkan diri Anda sebagai peserta Rapat Kerja Wilayah AMKI Jawa
          Timur.
        </p>

        <div className="mt-8">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
