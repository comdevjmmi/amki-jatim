"use client";

import { useActionState, useState, type ReactNode } from "react";
import Link from "next/link";
import { getGuestPrefill, registerParticipant, type RegisterState } from "@/app/register/actions";
import { InvitedGuestCombobox } from "./invited-guest-combobox";
import type { InvitedGuestOption, RegistrationType } from "@/lib/types";

const INITIAL_STATE: RegisterState = { status: "idle" };

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerParticipant, INITIAL_STATE);
  const [registrationType, setRegistrationType] = useState<RegistrationType>("invited");
  const [selectedGuest, setSelectedGuest] = useState<InvitedGuestOption | null>(null);
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [hint, setHint] = useState<{ status: "idle" | "loading" | "ready"; noHp?: string | null; emailMasked?: string | null }>({
    status: "idle",
  });

  // Picking a name pre-fills the WhatsApp number panitia stored; the guest
  // reviews it and can correct it before confirming.
  async function handleSelectGuest(guest: InvitedGuestOption | null) {
    setSelectedGuest(guest);
    setEmail("");
    setNoHp("");
    setHint({ status: "idle" });
    if (!guest || guest.isPresent) return;

    setHint({ status: "loading" });
    const prefill = await getGuestPrefill(guest.id);
    setNoHp(prefill?.noHp ?? "");
    setHint({ status: "ready", noHp: prefill?.noHp, emailMasked: prefill?.emailMasked });
  }

  function switchType(next: RegistrationType) {
    setRegistrationType(next);
    setEmail("");
    setNoHp("");
    setHint({ status: "idle" });
    if (next === "representative") setSelectedGuest(null);
  }

  if (state.status === "success") {
    const isInvited = registrationType === "invited";
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
          <span className="text-2xl text-primary-700">✓</span>
        </div>
        <h2 className="text-xl font-bold text-text">
          {isInvited ? "Kehadiran Tercatat" : "Registrasi Terkirim!"}
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          {isInvited
            ? `Selamat datang di Rakerwil II PW AMKI Jawa Timur${
                selectedGuest ? `, ${selectedGuest.fullName}` : ""
              }. Silakan memasuki hall.`
            : "Data Anda sedang diverifikasi oleh panitia. Silakan menuju meja panitia untuk konfirmasi."}
        </p>
        <span
          className={`mt-4 inline-block rounded-full px-4 py-1 text-xs font-semibold ${
            isInvited ? "bg-emerald-100 text-emerald-700" : "bg-accent-100 text-accent-700"
          }`}
        >
          {isInvited ? "Hadir" : "Menunggu Verifikasi"}
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
      {registrationType === "invited" && (
        <input type="hidden" name="invitedGuestId" value={selectedGuest?.id ?? ""} />
      )}

      <section>
        <p className="mb-2 text-sm font-semibold text-text">Tipe Registrasi</p>
        <div className="flex rounded-full border border-border p-1">
          <TypeToggleButton
            active={registrationType === "invited"}
            onClick={() => switchType("invited")}
          >
            Tamu Undangan Terdaftar
          </TypeToggleButton>
          <TypeToggleButton
            active={registrationType === "representative"}
            onClick={() => switchType("representative")}
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
          <InvitedGuestCombobox
            selected={selectedGuest}
            onSelect={handleSelectGuest}
            onNotFound={() => switchType("representative")}
          />
          <p className="mt-2 text-xs text-text-muted">
            Pilih nama Anda, periksa nomor WhatsApp yang terisi otomatis (ubah jika kurang tepat),
            lalu tekan Konfirmasi Hadir. Nama yang sudah hadir ditandai beserta jam
            kedatangannya.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap" name="namaLengkap" required className="sm:col-span-2" />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text">
              Mahasiswa / Dosen<span className="text-accent-600"> *</span>
            </span>
            <select
              name="jabatan"
              required
              defaultValue=""
              className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
            >
              <option value="" disabled>
                Pilih...
              </option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen</option>
            </select>
          </label>
          <Field label="Masjid Kampus / Lembaga" name="kampusNama" required />
          <Field label="Kota/Kabupaten" name="kampusKota" />
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Field
            label="Nomor WhatsApp"
            name="noHp"
            type="tel"
            required
            placeholder="08xxxxxxxxxx"
            value={noHp}
            onChange={setNoHp}
            disabled={hint.status === "loading"}
          />
          {registrationType === "invited" && hint.status === "loading" && (
            <p className="text-xs text-text-muted">Mengambil data Anda...</p>
          )}
          {registrationType === "invited" && hint.status === "ready" && (
            <p className="text-xs text-text-muted">
              {hint.noHp
                ? "Terisi dari data panitia. Ubah jika nomor Anda sudah berganti."
                : "Nomor Anda belum ada di data panitia. Isi nomor WhatsApp aktif Anda."}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Field
            label="Email (opsional)"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            disabled={hint.status === "loading"}
          />
          {registrationType === "invited" && hint.status === "ready" && hint.emailMasked && (
            <p className="text-xs text-text-muted">
              Email terdaftar: <span className="font-mono">{hint.emailMasked}</span>. Kosongkan
              untuk tetap memakai email ini.
            </p>
          )}
        </div>
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
        {isPending
          ? "Mengirim..."
          : registrationType === "invited"
            ? "Konfirmasi Hadir"
            : "Kirim Registrasi"}
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
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
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
        disabled={disabled}
        {...(onChange ? { value, onChange: (event) => onChange(event.target.value) } : {})}
        className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500 disabled:opacity-60"
      />
    </label>
  );
}
