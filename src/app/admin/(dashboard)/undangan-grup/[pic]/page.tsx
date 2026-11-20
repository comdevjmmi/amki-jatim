import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteTable, type InviteRow } from "@/components/admin/invite-table";
import { parseGuestContact } from "@/lib/guest-contact";
import { buildInviteMessage, buildWaLink, isInviteStatus, PIC_COUNT } from "@/lib/group-invite";
import { createAdminClient } from "@/lib/supabase/server";

export default async function PicPage({ params }: { params: Promise<{ pic: string }> }) {
  const { pic: picParam } = await params;
  const pic = Number(picParam);
  if (!Number.isInteger(pic) || pic < 1 || pic > PIC_COUNT) notFound();

  const { data, error } = await createAdminClient()
    .from("invited_guests")
    .select("id, full_name, campus_name, contact, invite_status")
    .eq("pic", pic)
    .order("campus_name")
    .order("full_name");

  const rows: InviteRow[] = (data ?? []).map((g) => ({
    id: g.id,
    fullName: g.full_name,
    campusName: g.campus_name,
    phoneDisplay: parseGuestContact(g.contact).phone || null,
    waLink: buildWaLink(g.contact, buildInviteMessage(g.full_name, g.campus_name)),
    status: isInviteStatus(g.invite_status) ? g.invite_status : "belum",
    pic,
  }));
  const sent = rows.filter((r) => r.status === "terkirim" || r.status === "dibalas").length;

  return (
    <div>
      <Link href="/admin/undangan-grup" className="text-sm font-medium text-primary-700 hover:underline">
        &larr; Semua PIC
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-text">PIC {pic}</h1>
      <p className="mt-1 text-sm text-text-muted">
        {sent} dari {rows.length} sudah dikirim. Klik &ldquo;Kirim via WhatsApp&rdquo;, tekan kirim di
        WhatsApp, lalu ubah status menjadi Terkirim.
      </p>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">Gagal memuat: {error.message}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface p-0 shadow-[var(--shadow-card)]">
        <InviteTable rows={rows} />
      </div>
    </div>
  );
}
