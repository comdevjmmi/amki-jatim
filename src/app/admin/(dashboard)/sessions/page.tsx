import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { createSession, toggleSessionActive } from "./actions";

interface EventSession {
  id: string;
  title: string;
  speaker: string | null;
  start_time: string | null;
  is_active: boolean;
}

export default async function AdminSessionsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_sessions")
    .select("id, title, speaker, start_time, is_active")
    .order("start_time", { ascending: true, nullsFirst: false })
    .returns<EventSession[]>();

  const sessions = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Manajemen Sesi Presensi</h1>
      <p className="mt-1 text-sm text-text-muted">
        Buat sesi materi/acara, lalu aktifkan satu sesi saat presensi dibuka.
      </p>

      <form
        action={createSession}
        className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-text">Judul Materi</span>
          <input
            type="text"
            name="title"
            required
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Pemateri</span>
          <input
            type="text"
            name="speaker"
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Waktu Mulai</span>
          <input
            type="datetime-local"
            name="startTime"
            className="rounded-md border border-border bg-surface px-4 py-2.5 text-text outline-none focus:border-primary-500"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 sm:col-span-2"
        >
          Buat Sesi
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat sesi: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Materi</th>
              <th className="px-4 py-3 font-semibold">Pemateri</th>
              <th className="px-4 py-3 font-semibold">Waktu</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Belum ada sesi.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text">{s.title}</td>
                <td className="px-4 py-3 text-text-muted">{s.speaker ?? "-"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {s.start_time
                    ? new Date(s.start_time).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {s.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={toggleSessionActive}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="nextActive" value={(!s.is_active).toString()} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          s.is_active ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-500 hover:bg-primary-600"
                        }`}
                      >
                        {s.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/sessions/${s.id}/attendance`}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-muted hover:text-text"
                    >
                      Presensi
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
