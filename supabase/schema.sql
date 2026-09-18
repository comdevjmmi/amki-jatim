-- AMKI Jatim Rakerwil: Registrasi & E-Voting
-- Skema awal (Day 1). Jalankan di Supabase SQL editor / migration.

create extension if not exists "pgcrypto";

-- 1. Masjid Kampus / lembaga pengirim delegasi
create table masjid_kampus (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kampus text not null,
  kota text not null,
  created_at timestamptz not null default now()
);

-- 2. Peserta terdaftar (hasil registrasi publik)
create table participants (
  id uuid primary key default gen_random_uuid(),
  masjid_kampus_id uuid references masjid_kampus(id) on delete set null,
  nama_lengkap text not null,
  email text not null,
  no_hp text not null,
  jabatan text not null,
  kategori text not null check (kategori in ('peserta_penuh', 'peninjau')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (email)
);

create index on participants (status);
create index on participants (kategori);

-- 3. Kandidat Ketua
create table candidates (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nomor_urut int not null unique,
  foto_url text,
  visi_misi text,
  created_at timestamptz not null default now()
);

-- 4. Token voting sekali pakai — hanya untuk peserta_penuh yang approved.
--    Token mentah dikirim ke peserta (email/QR); yang disimpan hanya hash-nya
--    agar admin/DB tidak bisa melihat token asli maupun membocorkan identitas
--    di sisi vote (lihat tabel votes).
create table voting_tokens (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  token_hash text not null unique,
  is_used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (participant_id)
);

-- 5. Suara — sengaja TIDAK menyimpan participant_id, supaya suara tidak bisa
--    ditelusuri balik ke pemilih (secret ballot). Integritas satu-orang-satu-suara
--    dijamin oleh voting_tokens.is_used + transaksi atomik di server action.
create table votes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id),
  voting_token_id uuid not null unique references voting_tokens(id),
  created_at timestamptz not null default now()
);

-- 6. Kontrol status pemilihan (buka/tutup, hidden/live count)
create table voting_settings (
  id int primary key default 1,
  is_open boolean not null default false,
  reveal_live_count boolean not null default false,
  opened_at timestamptz,
  closed_at timestamptz,
  constraint single_row check (id = 1)
);

insert into voting_settings (id) values (1);

-- Row Level Security -------------------------------------------------------
alter table participants enable row level security;
alter table voting_tokens enable row level security;
alter table votes enable row level security;
alter table candidates enable row level security;
alter table voting_settings enable row level security;

-- Publik boleh insert pendaftaran (lewat form), tidak boleh baca data peserta lain.
create policy "public can register" on participants
  for insert to anon with check (true);

-- Kandidat & status voting boleh dibaca publik (untuk landing page & bilik suara).
create policy "candidates are public" on candidates
  for select to anon using (true);

create policy "voting settings are public" on voting_settings
  for select to anon using (true);

-- Semua operasi admin (approve, generate token, buka/tutup voting, export)
-- dilakukan lewat server actions dengan service role key, yang bypass RLS.
-- Jangan buat policy tambahan untuk anon/authenticated pada participants,
-- voting_tokens, votes selain insert pendaftaran di atas.
