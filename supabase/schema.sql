-- AMKI Jatim Rakerwil: Registrasi & E-Voting
-- Skema database. Jalankan di Supabase SQL editor / migration, urut dari atas.

create extension if not exists "pgcrypto";

-- 1. Masjid Kampus / lembaga pengirim delegasi (master data, dipakai oleh
--    jalur registrasi "Perwakilan / Delegasi Baru").
create table masjid_kampus (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kampus text not null,
  kota text not null,
  created_at timestamptz not null default now()
);

-- 2. Tamu undangan resmi yang sudah didata panitia sebelum acara. Delegasi
--    cukup search & klaim namanya di form registrasi (lihat fungsi
--    register_participant di bawah) — tidak perlu isi ulang data.
create table invited_guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  campus_name text not null,
  title text not null,
  contact text,
  is_claimed boolean not null default false,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on invited_guests (is_claimed);

-- 3. Peserta terdaftar (hasil registrasi publik).
create table participants (
  id uuid primary key default gen_random_uuid(),
  masjid_kampus_id uuid references masjid_kampus(id) on delete set null,
  invited_guest_id uuid references invited_guests(id) on delete set null,
  registration_type text not null check (registration_type in ('invited', 'representative')),
  nama_lengkap text not null,
  email text not null,
  no_hp text not null,
  jabatan text not null,
  kategori text not null check (kategori in ('peserta_penuh', 'peninjau')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (email),
  unique (invited_guest_id)
);

create index on participants (status);
create index on participants (kategori);

-- 4. Kandidat Ketua. Sengaja tidak diisi manual di sini — kandidat baru
--    ditentukan Hari-H lewat proses sidang, dan dikelola penuh (create/
--    update/delete) oleh panitia lewat CRUD di Dashboard Admin (service
--    role, bypass RLS). nomor_urut nullable karena kandidat bisa dibuat
--    dulu sebagai draft sebelum nomor urut resmi ditetapkan sidang.
create table candidates (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  asal_kampus text,
  nomor_urut int,
  foto_url text,
  visi_misi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index candidates_nomor_urut_key on candidates (nomor_urut) where nomor_urut is not null;

-- 5. Token voting sekali pakai — hanya untuk peserta_penuh yang approved.
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

-- 6. Suara — sengaja TIDAK menyimpan participant_id, supaya suara tidak bisa
--    ditelusuri balik ke pemilih (secret ballot). Integritas satu-orang-satu-suara
--    dijamin oleh voting_tokens.is_used + transaksi atomik di server action.
create table votes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id),
  voting_token_id uuid not null unique references voting_tokens(id),
  created_at timestamptz not null default now()
);

-- 7. Kontrol status pemilihan.
--    is_voting_visible: feature flag — kalau false, menu/section pemilihan
--    ketua sama sekali tidak tampil di landing page / navigasi publik.
--    is_voting_open: kontrol buka/tutup sesi coblosan itu sendiri (baru
--    relevan begitu is_voting_visible sudah diaktifkan panitia).
create table voting_settings (
  id int primary key default 1,
  is_voting_visible boolean not null default false,
  is_voting_open boolean not null default false,
  reveal_live_count boolean not null default false,
  opened_at timestamptz,
  closed_at timestamptz,
  constraint single_row check (id = 1)
);

insert into voting_settings (id) values (1);

-- 8. Sesi acara (Pembukaan, Materi 1, Materi 2, Sidang Pleno/Pemilihan, ...).
--    Panitia mengaktifkan satu sesi presensi pada satu waktu lewat is_active.
create table event_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text,
  start_time timestamptz,
  end_time timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index on event_sessions (is_active);

-- 9. Presensi per sesi — satu peserta hanya bisa check-in sekali per sesi.
create table session_attendances (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references event_sessions(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  method text not null default 'self' check (method in ('self', 'qr', 'manual_admin')),
  unique (session_id, participant_id)
);

create index on session_attendances (session_id);
create index on session_attendances (participant_id);

-- Row Level Security -------------------------------------------------------
alter table masjid_kampus enable row level security;
alter table invited_guests enable row level security;
alter table participants enable row level security;
alter table candidates enable row level security;
alter table voting_tokens enable row level security;
alter table votes enable row level security;
alter table voting_settings enable row level security;
alter table event_sessions enable row level security;
alter table session_attendances enable row level security;

-- Publik boleh baca info yang memang untuk ditampilkan di landing page /
-- bilik suara / layar presensi. Tidak ada policy anon untuk INSERT/UPDATE
-- langsung ke participants, invited_guests, voting_tokens, votes,
-- session_attendances — semua write sensitif wajib lewat fungsi
-- register_participant() (SECURITY DEFINER, di bawah) atau server action
-- dengan service role key, supaya validasi & anti-race-condition selalu
-- ditegakkan di satu tempat.
create policy "candidates are public" on candidates
  for select to anon using (true);

create policy "voting settings are public" on voting_settings
  for select to anon using (true);

create policy "event sessions are public" on event_sessions
  for select to anon using (true);

create policy "masjid kampus is public" on masjid_kampus
  for select to anon using (true);

-- votes has no participant_id/name (see cast_vote's comment above) — a row
-- here is only { candidate_id, voting_token_id, created_at }, and
-- voting_token_id is meaningless to anon since voting_tokens itself has no
-- public policy. Public select is required for the Live Count screen's
-- realtime subscription (Realtime authorizes postgres_changes per-row via
-- this same RLS policy).
create policy "votes are public" on votes
  for select to anon using (true);

-- Realtime broadcasts only for tables added to this publication.
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table voting_settings;

-- invited_guests TIDAK diberi policy select langsung ke anon — data pribadi
-- (contact, status klaim) tidak boleh dibaca bebas. Pencarian dari form
-- registrasi memakai view invited_guests_public di bawah, yang hanya
-- mengekspos kolom & baris yang aman.

-- View pencarian tamu undangan yang belum diklaim, untuk combobox di form
-- registrasi. Hanya mengekspos kolom yang perlu untuk pencarian & auto-fill
-- (tanpa contact, tanpa status internal), dan hanya baris yang belum
-- diklaim. security_invoker = false (default) supaya view ini tetap bisa
-- membaca invited_guests walau anon tidak punya policy select langsung ke
-- tabel aslinya.
create view invited_guests_public as
  select id, full_name, campus_name, title
  from invited_guests
  where is_claimed = false;

grant select on invited_guests_public to anon, authenticated;

-- Fungsi atomik untuk registrasi peserta. Mengunci & menandai invited_guest
-- sebagai claimed (jika jalur "invited") dan insert participants dalam satu
-- transaksi, sehingga dua orang tidak bisa mengklaim tamu undangan yang sama
-- secara bersamaan (race condition). Untuk jalur "invited", nama & jabatan
-- diambil ulang dari invited_guests di server (bukan dari input client) agar
-- data auto-fill tidak bisa dipalsukan.
create or replace function register_participant(
  p_registration_type text,
  p_invited_guest_id uuid,
  p_nama_lengkap text,
  p_email text,
  p_no_hp text,
  p_jabatan text,
  p_kategori text,
  p_kampus_nama text,
  p_kampus_kota text
) returns participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant participants;
  v_guest invited_guests;
  v_masjid_kampus_id uuid;
  v_nama text;
  v_jabatan text;
begin
  if p_registration_type not in ('invited', 'representative') then
    raise exception 'INVALID_REGISTRATION_TYPE';
  end if;

  if p_kategori not in ('peserta_penuh', 'peninjau') then
    raise exception 'INVALID_KATEGORI';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'EMAIL_REQUIRED';
  end if;

  if p_no_hp is null or length(trim(p_no_hp)) = 0 then
    raise exception 'NO_HP_REQUIRED';
  end if;

  if p_registration_type = 'invited' then
    if p_invited_guest_id is null then
      raise exception 'INVITED_GUEST_REQUIRED';
    end if;

    update invited_guests
      set is_claimed = true, claimed_at = now()
      where id = p_invited_guest_id and is_claimed = false
      returning * into v_guest;

    if v_guest.id is null then
      raise exception 'INVITED_GUEST_ALREADY_CLAIMED';
    end if;

    v_nama := v_guest.full_name;
    v_jabatan := v_guest.title;

    select id into v_masjid_kampus_id
      from masjid_kampus
      where lower(kampus) = lower(v_guest.campus_name)
      limit 1;

    if v_masjid_kampus_id is null then
      insert into masjid_kampus (nama, kampus, kota)
      values (v_guest.campus_name, v_guest.campus_name, 'N/A')
      returning id into v_masjid_kampus_id;
    end if;
  else
    if p_nama_lengkap is null or length(trim(p_nama_lengkap)) = 0 then
      raise exception 'NAMA_REQUIRED';
    end if;

    if p_kampus_nama is null or length(trim(p_kampus_nama)) = 0 then
      raise exception 'CAMPUS_REQUIRED';
    end if;

    v_nama := trim(p_nama_lengkap);
    v_jabatan := coalesce(nullif(trim(p_jabatan), ''), '-');

    select id into v_masjid_kampus_id
      from masjid_kampus
      where lower(kampus) = lower(trim(p_kampus_nama))
      limit 1;

    if v_masjid_kampus_id is null then
      insert into masjid_kampus (nama, kampus, kota)
      values (trim(p_kampus_nama), trim(p_kampus_nama), coalesce(nullif(trim(p_kampus_kota), ''), 'N/A'))
      returning id into v_masjid_kampus_id;
    end if;
  end if;

  insert into participants (
    invited_guest_id, masjid_kampus_id, registration_type, nama_lengkap,
    email, no_hp, jabatan, kategori
  ) values (
    p_invited_guest_id, v_masjid_kampus_id, p_registration_type, v_nama,
    trim(p_email), trim(p_no_hp), v_jabatan, p_kategori
  )
  returning * into v_participant;

  return v_participant;
end;
$$;

revoke all on function register_participant(text, uuid, text, text, text, text, text, text, text) from public;
grant execute on function register_participant(text, uuid, text, text, text, text, text, text, text) to service_role;

-- Mengaktifkan satu sesi presensi sekaligus menonaktifkan semua sesi lain,
-- dalam satu statement UPDATE (jadi satu transaksi atomik) — supaya dua
-- admin yang mengklik "Aktifkan" pada dua sesi berbeda hampir bersamaan
-- tidak bisa membuat dua sesi aktif sekaligus.
create or replace function set_active_session(p_session_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  -- `where true` is required, not decorative: this project's live DB rejects
  -- any UPDATE without a WHERE clause (safe-update guard), and this one is
  -- intentionally whole-table.
  update event_sessions set is_active = (id = p_session_id) where true;
$$;

revoke all on function set_active_session(uuid) from public;
grant execute on function set_active_session(uuid) to service_role;

-- Mencoblos secara atomik: klaim token (is_used false -> true) dan insert
-- suara dalam satu function call/transaksi, supaya token yang sama tidak
-- bisa dipakai dua kali walau dua request datang nyaris bersamaan — baris
-- voting_tokens terkunci oleh UPDATE ... WHERE is_used = false, jadi hanya
-- satu pemanggil yang berhasil mengklaimnya. p_token_hash dihitung di server
-- (HMAC dengan VOTE_TOKEN_SECRET) sebelum RPC ini dipanggil — token mentah
-- tidak pernah dikirim ke database.
create or replace function cast_vote(p_token_hash text, p_candidate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token voting_tokens;
  v_is_open boolean;
begin
  select is_voting_open into v_is_open from voting_settings where id = 1;
  if v_is_open is not true then
    raise exception 'VOTING_CLOSED';
  end if;

  if not exists (select 1 from candidates where id = p_candidate_id) then
    raise exception 'INVALID_CANDIDATE';
  end if;

  update voting_tokens
    set is_used = true, used_at = now()
    where token_hash = p_token_hash and is_used = false
    returning * into v_token;

  if v_token.id is null then
    raise exception 'INVALID_OR_USED_TOKEN';
  end if;

  insert into votes (candidate_id, voting_token_id) values (p_candidate_id, v_token.id);
end;
$$;

revoke all on function cast_vote(text, uuid) from public;
grant execute on function cast_vote(text, uuid) to service_role;

-- Semua operasi admin lain (approve/reject peserta, generate token, CRUD
-- kandidat, kelola sesi & presensi, toggle voting) dilakukan lewat server
-- actions dengan service role key, yang bypass RLS.
