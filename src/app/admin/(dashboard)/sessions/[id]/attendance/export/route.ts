import { requireAdminSession } from "@/lib/admin-auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { createAdminClient } from "@/lib/supabase/server";

interface AttendanceRow {
  checked_in_at: string;
  method: string;
  participants: { nama_lengkap: string; jabatan: string; masjid_kampus: { nama: string } | null } | null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();

  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: session }, { data }] = await Promise.all([
    supabase.from("event_sessions").select("title").eq("id", id).single(),
    supabase
      .from("session_attendances")
      .select("checked_in_at, method, participants(nama_lengkap, jabatan, masjid_kampus(nama))")
      .eq("session_id", id)
      .order("checked_in_at", { ascending: true })
      .returns<AttendanceRow[]>(),
  ]);

  const rows = (data ?? []).map((a) => [
    a.participants?.nama_lengkap ?? "-",
    a.participants?.masjid_kampus?.nama ?? "-",
    a.participants?.jabatan ?? "-",
    new Date(a.checked_in_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
    a.method,
  ]);

  const csv = toCsv(["Nama", "Kampus", "Jabatan", "Waktu Check-in", "Metode"], rows);
  const slug = (session?.title ?? "sesi").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return csvResponse(`presensi-${slug}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
