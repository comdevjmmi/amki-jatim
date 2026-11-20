import { parseGuestContact } from "@/lib/guest-contact";
import { normalizePhone } from "@/lib/mask";

export const GROUP_LINK = "https://chat.whatsapp.com/EbS8CMNqwvJ31S28FGT6mV?s=cl&p=a&iam=2";
export const PIC_COUNT = 7;

export const INVITE_STATUSES = [
  { value: "belum", label: "Belum dikirim" },
  { value: "terkirim", label: "Terkirim" },
  { value: "dibalas", label: "Dibalas" },
  { value: "bermasalah", label: "Bermasalah" },
] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number]["value"];

export function isInviteStatus(value: unknown): value is InviteStatus {
  return INVITE_STATUSES.some((s) => s.value === value);
}

/**
 * Template pesan undangan grup — ubah di sini kalau ada revisi teks.
 * Tanpa emoji: emoji (karakter 4-byte) sering rusak jadi "�" saat diteruskan
 * lewat link wa.me di sebagian aplikasi/WhatsApp Web.
 */
export function buildInviteMessage(nama: string, institusi: string): string {
  return `Assalamu'alaikum warahmatullahi wabarakatuh

Yth. ${nama}
(${institusi})

Terima kasih atas kesediaan dan partisipasi Bapak/Ibu/Saudara/i dalam *Rapat Kerja Wilayah (Rakerwil) II PW AMKI Jawa Timur 2026*.

Untuk mempermudah koordinasi dan penyampaian informasi seputar acara, kami mengundang Bapak/Ibu/Saudara/i untuk bergabung ke *grup WhatsApp komunal peserta* melalui tautan berikut:

${GROUP_LINK}

Mohon kesediaannya untuk bergabung ke grup tersebut ya. Apabila ada pertanyaan atau kendala, silakan hubungi kami melalui pesan ini.

Atas perhatian dan kerja samanya, kami ucapkan terima kasih. Jazakumullahu khairan.

Wassalamu'alaikum warahmatullahi wabarakatuh.
Panitia Rakerwil II PW AMKI Jawa Timur`;
}

/** wa.me link yang membuka chat ke nomor tamu dengan teks sudah terisi; null jika nomor kosong. */
export function buildWaLink(contact: string | null, message: string): string | null {
  const { phone } = parseGuestContact(contact);
  const digits = normalizePhone(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
