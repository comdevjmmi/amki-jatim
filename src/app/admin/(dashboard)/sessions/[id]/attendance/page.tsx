import Link from "next/link";
import { AttendanceList, type AttendanceParticipantRow } from "@/components/admin/attendance-list";
import { createAdminClient } from "@/lib/supabase/server";

interface SessionRow {
  id: string;
  title: string;
  is_active: boolean;
}

interface ParticipantRow {
  id: string;
  nama_lengkap: string;
  jabatan: string;
  masjid_kampus: { nama: string } | null;
  session_attendances: { checked_in_at: string }[];
}

export default async function SessionAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: session }, { data: participantsData, error }] = await Promise.all([
    supabase.from("event_sessions").select("id, title, is_active").eq("id", id).single<SessionRow>(),
    supabase
      .from("participants")
      .select("id, nama_lengkap, jabatan, masjid_kampus(nama), session_attendances(checked_in_at)")
      .eq("status", "approved")
      .eq("session_attendances.session_id", id)
      .order("nama_lengkap")
      .returns<ParticipantRow[]>(),
  ]);

  if (!session) {
    return (
      <div>
        <p className="text-sm text-text-muted">Sesi tidak ditemukan.</p>
        <Link href="/admin/sessions" className="text-sm text-primary-700 hover:underline">
          &larr; Kembali ke Sesi
        </Link>
      </div>
    );
  }

  const participants: AttendanceParticipantRow[] = (participantsData ?? []).map((p) => ({
    id: p.id,
    nama_lengkap: p.nama_lengkap,
    jabatan: p.jabatan,
    kampus: p.masjid_kampus?.nama ?? "-",
    isCheckedIn: (p.session_attendances?.length ?? 0) > 0,
  }));

  const checkedInCount = participants.filter((p) => p.isCheckedIn).length;

  return (
    <div>
      <Link href="/admin/sessions" className="text-sm text-text-muted hover:text-primary-700">
        &larr; Sesi
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-text">Presensi: {session.title}</h1>
      <p className="mt-1 flex items-center gap-2 text-sm text-text-muted">
        {checkedInCount} / {participants.length} peserta approved sudah check-in
        {session.is_active && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Sesi Aktif
          </span>
        )}
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat peserta: {error.message}
        </p>
      )}

      <div className="mt-6">
        <AttendanceList sessionId={session.id} participants={participants} />
      </div>
    </div>
  );
}
