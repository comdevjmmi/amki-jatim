import { createAdminClient } from "@/lib/supabase/server";
import { setVotingOpen, setVotingVisible } from "./actions";

interface VotingSettingsRow {
  is_voting_visible: boolean;
  is_voting_open: boolean;
  opened_at: string | null;
  closed_at: string | null;
}

export default async function AdminVotingControlPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("voting_settings")
    .select("is_voting_visible, is_voting_open, opened_at, closed_at")
    .eq("id", 1)
    .single<VotingSettingsRow>();

  const settings = data ?? {
    is_voting_visible: false,
    is_voting_open: false,
    opened_at: null,
    closed_at: null,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Kontrol Voting</h1>
      <p className="mt-1 text-sm text-text-muted">
        Kendalikan visibilitas dan buka/tutup bilik e-voting publik (/vote).
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Gagal memuat pengaturan: {error.message}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <ToggleCard
          title="Tampilkan Bilik Suara"
          description="Kalau nonaktif, menu Bilik Suara tidak muncul sama sekali di navigasi publik."
          isOn={settings.is_voting_visible}
          action={setVotingVisible}
          fieldName="nextVisible"
        />
        <ToggleCard
          title="Buka Sesi Pemungutan Suara"
          description="Kalau nonaktif, /vote menampilkan pesan bahwa sidang pemilihan belum dibuka — walau visibilitas aktif."
          isOn={settings.is_voting_open}
          action={setVotingOpen}
          fieldName="nextOpen"
        />
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  isOn,
  action,
  fieldName,
}: {
  title: string;
  description: string;
  isOn: boolean;
  action: (formData: FormData) => void;
  fieldName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div>
        <p className="font-semibold text-text">{title}</p>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      <form action={action}>
        <input type="hidden" name={fieldName} value={(!isOn).toString()} />
        <button
          type="submit"
          className={`w-fit shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors ${
            isOn ? "bg-rose-600 hover:bg-rose-700" : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {isOn ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </form>
    </div>
  );
}
