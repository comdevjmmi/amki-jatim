"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { registerParticipant, type RegisterState } from "@/app/register/actions";
import { InvitedGuestCombobox } from "./invited-guest-combobox";
import type { InvitedGuestOption, ParticipantKategori, RegistrationType } from "@/lib/types";

const INITIAL_STATE: RegisterState = { status: "idle" };

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerParticipant, INITIAL_STATE);
  const [registrationType, setRegistrationType] = useState<RegistrationType>("invited");
  const [selectedGuest, setSelectedGuest] = useState<InvitedGuestOption | null>(null);
  const [kategori, setKategori] = useState<ParticipantKategori>("peserta_penuh");

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
          <span className="text-2xl text-primary-700">✓</span>
        </div>
        <h2 className="text-xl font-bold text-text">Registrasi Terkirim!</h2>
        <p className="mt-2 text-sm text-text-muted">
          Data Anda sedang diverifikasi oleh panitia. Status verifikasi akan
          dikirim ke email/WhatsApp yang Anda daftarkan.
        </p>
        <span className="mt-4 inline-block rounded-full bg-accent-100 px-4 py-1 text-xs font-semibold text-accent-700">
          Menunggu Verifikasi
        </span>
        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-primary-700 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-8 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <input type="hidden" name="registrationType" value={registrationType} />
      <input type="hidden" name="kategori" value={kategori} />
      {registrationType === "invited" && (
        <input type="hidden" name="invitedGuestId" value={selectedGuest?.id ?? ""} />
      )}

      <section>
        <p className="mb-2 text-sm font-semibold text-text">Tipe Registrasi</p>
        <div className="flex rounded-full border border-border p-1">
          <TypeToggleButton
            active={registrationType === "invited"}
            onClick={() => setRegistrationType("invited")}
          >
            Tamu Undangan Terdaftar
          </TypeToggleButton>
          <TypeToggleButton
            active={registrationType === "representative"}
            onClick={() => setRegistrationType("representative")}
          >
            Perwakilan / Delegasi Baru
          </TypeToggleButton>
        </div>
      </section>

      {registrationType === "invited" ? (
        <section>
          <label className="mb-2 block text-sm font-semibold text-text">
            Cari Nama Anda
          </label>
          <InvitedGuestCombobox selected={selectedGuest} onSelect={setSelectedGuest} />
          <p className="mt-2 text-xs text-text-muted">
            Nama, jabatan, dan asal kampus akan otomatis terisi sesuai data
            panitia.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap" name="namaLengkap" required className="sm:col-span-2" />
          <Field label="Jabatan di Organisasi" name="jabatan" placeholder="Ketua Umum" />
          <Field label="Masjid Kampus / Lembaga" name="kampusNama" required />
          <Field label="Kota/Kabupaten" name="kampusKota" />
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Nomor WhatsApp" name="noHp" type="tel" required />
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold text-text">Kategori Peserta</p>
        <div className="flex rounded-full border border-border p-1">
          <TypeToggleButton
            active={kategori === "peserta_penuh"}
            onClick={() => setKategori("peserta_penuh")}
          >
            Peserta Penuh (Hak Suara)
          </TypeToggleButton>
          <TypeToggleButton
            active={kategori === "peninjau"}
            onClick={() => setKategori("peninjau")}
          >
            Peserta Peninjau
          </TypeToggleButton>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Peserta Penuh berhak mengikuti pemilihan Ketua AMKI Jawa Timur.
          Peserta Peninjau mengikuti seluruh agenda tanpa hak suara.
        </p>
      </section>

      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || (registrationType === "invited" && !selectedGuest)}
        className="w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Mengirim..." : "Kirim Registrasi"}
      </button>
    </form>
  );
}

function TypeToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-primary-500 text-white" : "text-text-muted hover:text-primary-700"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span className="font-medium text-text">
        {label}
        {required && <span className="text-accent-600"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
      />
    </label>
  );
}
