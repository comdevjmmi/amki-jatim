"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = { status: "idle" };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, INITIAL_STATE);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-muted px-6">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-[var(--shadow-card)]"
      >
        <h1 className="text-xl font-bold text-text">Admin AMKI Jatim</h1>
        <p className="mt-1 text-sm text-text-muted">Masuk untuk mengelola peserta & sesi.</p>

        <label className="mt-6 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
          />
        </label>

        {state.status === "error" && (
          <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
