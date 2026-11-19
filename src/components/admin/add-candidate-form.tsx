"use client";

import { useState } from "react";
import { upsertCandidate } from "@/app/admin/(dashboard)/candidates/actions";
import { CandidateFields } from "./candidate-fields";

export function AddCandidateForm() {
  // The name and campus inputs are controlled (suggestions fill them in), so
  // the browser's automatic post-submit form reset doesn't clear them.
  // Remounting the fields with a new key does.
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    await upsertCandidate(formData);
    setFormKey((key) => key + 1);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 border-t border-border p-6">
      <CandidateFields key={formKey} />
      <button
        type="submit"
        className="w-fit rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
      >
        Simpan Kandidat
      </button>
    </form>
  );
}
