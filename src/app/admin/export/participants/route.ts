import { requireAdminSession } from "@/lib/admin-auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { createAdminClient } from "@/lib/supabase/server";

interface ParticipantRow {
  nama_lengkap: string;
  jabatan: string;
  kategori: string;
  status: string;
  email: string;
  no_hp: string;
  masjid_kampus: { nama: string } | null;
}

const KATEGORI_LABEL: Record<string, string> = {
  peserta_penuh: "Peserta Penuh",
  peninjau: "Peninjau",
};

export async function GET() {
  await requireAdminSession();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("participants")
    .select("nama_lengkap, jabatan, kategori, status, email, no_hp, masjid_kampus(nama)")
    .order("created_at", { ascending: false })
    .returns<ParticipantRow[]>();

  const rows = (data ?? []).map((p) => [
    p.nama_lengkap,
    p.masjid_kampus?.nama ?? "-",
    p.jabatan,
    KATEGORI_LABEL[p.kategori] ?? p.kategori,
    p.status,
    `${p.email} / ${p.no_hp}`,
  ]);

  const csv = toCsv(["Nama", "Kampus", "Jabatan", "Kategori", "Status", "Kontak"], rows);
  return csvResponse(`peserta-rakerwil-amki-jatim-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
