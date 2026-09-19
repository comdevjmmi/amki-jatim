import Link from "next/link";
import { ProjectorScreen } from "@/components/admin/projector-screen";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/server";

interface SessionRow {
  id: string;
  title: string;
  speaker: string | null;
  start_time: string | null;
}

export default async function SessionScreenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("event_sessions")
    .select("id, title, speaker, start_time")
    .eq("id", id)
    .single<SessionRow>();

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-900 p-8 text-center text-white">
        <p>Sesi tidak ditemukan.</p>
        <Link href="/admin/sessions" className="text-sm text-primary-300 hover:underline">
          &larr; Kembali ke Sesi
        </Link>
      </div>
    );
  }

  const siteUrl = await getSiteUrl();
  const checkinUrl = `${siteUrl}/presensi/${session.id}`;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-slate-900 px-6 py-12 text-white">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">
        Presensi Sesi
      </p>
      <h1 className="text-center text-3xl font-extrabold sm:text-4xl">{session.title}</h1>
      <p className="mt-1 text-center text-slate-300">
        {session.speaker && <span>{session.speaker}</span>}
        {session.speaker && session.start_time && <span className="mx-2">&bull;</span>}
        {session.start_time && (
          <span>
            {new Date(session.start_time).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
          </span>
        )}
      </p>

      <div className="mt-8">
        <ProjectorScreen sessionId={session.id} checkinUrl={checkinUrl} />
      </div>
    </div>
  );
}
