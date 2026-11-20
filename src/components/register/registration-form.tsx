"use client";

import { useActionState, useState, type ReactNode } from "react";
import { getGuestInfo, registerParticipant, type GuestInfo, type RegisterState } from "@/app/register/actions";
import { formatJam } from "@/lib/format-time";
import { InvitedGuestCombobox } from "./invited-guest-combobox";
import type { InvitedGuestOption, RegistrationType } from "@/lib/types";

const INITIAL_STATE: RegisterState = { status: "idle" };

// Remounting the inner form with a new key is how "back to registration"
// clears everything for the next person without reloading the page.
export function RegistrationForm() {
  const [formKey, setFormKey] = useState(0);
  return <RegistrationFormInner key={formKey} onReset={() => setFormKey((key) => key + 1)} />;
}

function RegistrationFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, isPending] = useActionState(registerParticipant, INITIAL_STATE);
  const [registrationType, setRegistrationType] = useState<RegistrationType>("invited");
  const [selectedGuest, setSelectedGuest] = useState<InvitedGuestOption | null>(null);
  const [info, setInfo] = useState<{ status: "idle" | "loading" | "ready"; data?: GuestInfo | null }>({
    status: "idle",
  });

  // Picking a name only *shows* what panitia have on file (campus, kalangan,
  // city, and a masked WhatsApp/email); none of it is editable here. Fixes go
  // through panitia in /admin.
  async function handleSelectGuest(guest: InvitedGuestOption | null) {
    setSelectedGuest(guest);
    setInfo({ status: guest ? "loading" : "idle" });
    if (!guest) return;
    setInfo({ status: "ready", data: await getGuestInfo(guest.id, guest.source) });
  }

  function switchType(next: RegistrationType) {
    setRegistrationType(next);
    setInfo({ status: "idle" });
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
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-primary-700 hover:underline"
          >
            Kembali ke Halaman Registrasi
          </button>
        </div>
      </div>
    );
  }

  const alreadyPresent = Boolean(selectedGuest?.isPresent);

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
          <TypeToggleButton active={registrationType === "invited"} onClick={() => switchType("invited")}>
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
          <label className="mb-2 block text-sm font-semibold text-text">Cari Nama Anda</label>
          <InvitedGuestCombobox
            selected={selectedGuest}
            onSelect={handleSelectGuest}
            onNotFound={() => switchType("representative")}
          />

          {selectedGuest && (
            <div className="mt-3 flex flex-col gap-3">
              {alreadyPresent && (
                <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  ✓ Sudah konfirmasi hadir
                  {selectedGuest.presentAt && ` pukul ${formatJam(selectedGuest.presentAt)} WIB`}
                </p>
              )}

              {info.status === "loading" && <p className="text-xs text-text-muted">Mengambil data Anda...</p>}

              {info.status === "ready" && info.data && (
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 rounded-md bg-surface-muted px-4 py-3 text-sm">
                  <InfoRow label="Asal Kampus" value={info.data.kampus} />
                  <InfoRow label="Mahasiswa / Dosen" value={info.data.kalangan} />
                  <InfoRow label="Kota / Kabupaten" value={info.data.kota} />
                  <InfoRow label="WhatsApp" value={info.data.noHpMasked} mono />
                  <InfoRow label="Email" value={info.data.emailMasked} mono />
                </dl>
              )}

              {info.status === "ready" && !info.data && (
                <p className="text-xs text-rose-700">Data Anda gagal dimuat. Coba pilih nama lagi atau hubungi panitia.</p>
              )}

              {!alreadyPresent && (
                <p className="text-xs text-text-muted">
                  Data di atas tidak bisa diubah di sini. Jika ada yang keliru, sampaikan ke panitia.
                </p>
              )}
            </div>
          )}
        </section>
      ) : (
        <>
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

          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Nomor WhatsApp" name="noHp" type="tel" required placeholder="08xxxxxxxxxx" />
            <Field label="Email (opsional)" name="email" type="email" />
          </section>
        </>
      )}

      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          (registrationType === "invited" && (!selectedGuest || alreadyPresent || info.status === "loading"))
        }
        className="w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Mengirim..."
          : registrationType === "invited"
            ? alreadyPresent
              ? "Sudah Konfirmasi Hadir"
              : "Konfirmasi Hadir"
            : "Kirim Registrasi"}
      </button>
    </form>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <>
      <dt className="text-text-muted">{label}</dt>
      <dd className={`font-medium text-text ${mono ? "font-mono" : ""}`}>{value || "-"}</dd>
    </>
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
