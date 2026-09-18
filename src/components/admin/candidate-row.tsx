"use client";

import { useState } from "react";
import { deleteCandidate, upsertCandidate } from "@/app/admin/(dashboard)/candidates/actions";
import type { Candidate } from "@/lib/types";
import { CandidateFields } from "./candidate-fields";

export function CandidateRow({ candidate }: { candidate: Candidate }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={5} className="px-4 py-4">
          <form action={upsertCandidate} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={candidate.id} />
            <CandidateFields defaultValues={candidate} />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-600"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-muted hover:text-text"
              >
                Batal
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-text-muted">{candidate.nomor_urut ?? "-"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {candidate.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.foto_url}
              alt={candidate.nama}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {candidate.nama.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-text">{candidate.nama}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-text-muted">{candidate.asal_kampus ?? "-"}</td>
      <td className="max-w-xs truncate px-4 py-3 text-text-muted">{candidate.visi_misi ?? "-"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-600"
          >
            Edit
          </button>
          <form action={deleteCandidate}>
            <input type="hidden" name="id" value={candidate.id} />
            <button
              type="submit"
              className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Hapus
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
