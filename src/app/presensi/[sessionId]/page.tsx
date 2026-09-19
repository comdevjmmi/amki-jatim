import Image from "next/image";
import { CheckinForm } from "@/components/presensi/checkin-form";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Presensi — Rakerwil AMKI Jawa Timur",
};

interface SessionRow {
  id: string;
  title: string;
  speaker: string | null;
}

export default async function PresensiPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("event_sessions")
    .select("id, title, speaker")
    .eq("id", sessionId)
    .maybeSingle<SessionRow>();

  return (
    <div className="flex flex-1 flex-col items-center bg-surface-muted px-6 py-12">
      <Image src="/images/amki-logo.png" alt="Logo AMKI Jawa Timur" width={48} height={48} className="h-12 w-auto object-contain" priority />

      {session ? (
        <>
          <h1 className="mt-4 text-center text-xl font-bold text-text sm:text-2xl">
            Presensi: {session.title}
          </h1>
          {session.speaker && <p className="mt-1 text-center text-sm text-text-muted">{session.speaker}</p>}

          <div className="mt-8 w-full max-w-sm">
            <CheckinForm sessionId={sessionId} />
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">Sesi tidak ditemukan.</p>
      )}
    </div>
  );
}
