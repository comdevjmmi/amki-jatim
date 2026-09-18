import { TokensDashboard, type TokenParticipantRow } from "@/components/admin/tokens-dashboard";
import { createAdminClient } from "@/lib/supabase/server";

interface ParticipantWithToken {
  id: string;
  nama_lengkap: string;
  email: string;
  // voting_tokens.participant_id is unique, so PostgREST embeds this as a
  // to-one relation (a single object, or null) — not an array.
  voting_tokens: { is_used: boolean } | null;
}

export default async function AdminTokensPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id, nama_lengkap, email, voting_tokens(is_used)")
    .eq("kategori", "peserta_penuh")
    .eq("status", "approved")
    .order("nama_lengkap")
    .returns<ParticipantWithToken[]>();

  const participants: TokenParticipantRow[] = (data ?? []).map((p) => ({
    id: p.id,
    nama_lengkap: p.nama_lengkap,
    email: p.email,
    tokenStatus: p.voting_tokens ? (p.voting_tokens.is_used ? "used" : "unused") : "none",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Generator Token Pemilih</h1>
      <p className="mt-1 text-sm text-text-muted">
        Token sekali pakai untuk Peserta Penuh yang sudah Approved. Token asli hanya tampil sekali
        saat dibuat — segera catat/bagikan sebelum meninggalkan halaman ini.
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat data: {error.message}
        </p>
      )}

      <div className="mt-6">
        <TokensDashboard participants={participants} />
      </div>
    </div>
  );
}
