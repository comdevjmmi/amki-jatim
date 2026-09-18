import type { Candidate } from "@/lib/types";

export function CandidateFields({ defaultValues }: { defaultValues?: Candidate }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Nomor Urut</span>
        <input
          type="number"
          name="nomorUrut"
          min={1}
          defaultValue={defaultValues?.nomor_urut ?? ""}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">
          Nama Lengkap<span className="text-accent-600"> *</span>
        </span>
        <input
          type="text"
          name="nama"
          required
          defaultValue={defaultValues?.nama ?? ""}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Asal Kampus</span>
        <input
          type="text"
          name="asalKampus"
          defaultValue={defaultValues?.asal_kampus ?? ""}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Foto/Avatar URL</span>
        <input
          type="url"
          name="fotoUrl"
          placeholder="https://..."
          defaultValue={defaultValues?.foto_url ?? ""}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="font-medium text-text">Visi &amp; Misi</span>
        <textarea
          name="visiMisi"
          rows={4}
          defaultValue={defaultValues?.visi_misi ?? ""}
          className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
        />
      </label>
    </div>
  );
}
