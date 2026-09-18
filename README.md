# AMKI Jatim — Registrasi & E-Voting Rakerwil

Web registrasi peserta & e-voting Pemilihan Ketua AMKI (Asosiasi Masjid
Kampus Indonesia) Wilayah Jawa Timur untuk Rapat Kerja Wilayah (Rakerwil).

## Tech Stack

- **Next.js (App Router) + TypeScript** — satu codebase untuk landing page,
  form registrasi, bilik e-voting, dan dashboard admin. Server Actions
  dipakai untuk semua operasi sensitif (approval, generate token, submit
  suara) sehingga logic anti-kecurangan tidak pernah berjalan di client.
- **Tailwind CSS** — styling cepat, konsisten, mobile-first (mayoritas
  peserta akan mengakses dari HP saat registrasi ulang di venue).
- **Supabase (Postgres + Auth + Realtime)** — database terkelola, Row Level
  Security untuk membatasi akses publik hanya pada insert pendaftaran &
  baca data kandidat/status voting, serta channel Realtime untuk live
  count di layar panitia.
- **Vercel** — deploy cepat, preview per-PR, cocok untuk timeline 7 hari.

Alasan pemilihan: seluruh stack di atas menghindari kebutuhan
provisioning server/backend terpisah, punya integrasi bawaan yang matang
(auth, RLS, realtime), dan tim bisa langsung produktif dari hari pertama.

## Skema Database (ringkas)

Lihat [`supabase/schema.sql`](./supabase/schema.sql) untuk DDL lengkap.

- `masjid_kampus` — daftar Masjid Kampus/lembaga pengirim delegasi.
- `participants` — data pendaftar; `kategori` (`peserta_penuh` /
  `peninjau`) menentukan hak suara; `status` (`pending` / `approved` /
  `rejected`) dikontrol panitia.
- `candidates` — kandidat Ketua AMKI Jatim.
- `voting_tokens` — token sekali pakai per `participant_id` (hanya untuk
  `peserta_penuh` yang `approved`); yang disimpan adalah **hash** token,
  bukan token mentah.
- `votes` — satu baris per suara, terhubung ke `voting_token_id` (bukan ke
  `participant_id`) agar suara tidak bisa ditelusuri balik ke pemilih
  (secret ballot), sementara `voting_tokens.is_used` (di-update dalam satu
  transaksi atomik) mencegah double-vote.
- `voting_settings` — baris tunggal untuk kontrol buka/tutup voting dan
  toggle live count vs hidden result.

## Roadmap Sprint 7 Hari

| Hari | Fokus |
| --- | --- |
| 1 | Setup project (Next.js + Tailwind + Supabase), skema DB & RLS, landing page skeleton |
| 2 | Landing page final (tema, rundown, profil kegiatan) + form registrasi peserta/delegasi |
| 3 | Alur approval admin: list peserta, approve/reject, klasifikasi peserta_penuh vs peninjau |
| 4 | Generator token voting (hash + kirim token), halaman input kandidat, bilik e-voting (submit suara via server action, transaksi atomik) |
| 5 | Live count / hidden result (Realtime), kontrol buka/tutup voting, dashboard hasil |
| 6 | Export rekap (CSV/PDF), hardening keamanan (rate limit, validasi token, audit log), testing end-to-end |
| 7 | UAT bareng panitia, perbaikan bug, deploy production, dry-run voting |

## Environment Variables

Salin `.env.example` ke `.env.local` dan isi kredensial Supabase project.

## Development

```bash
npm run dev
```
