-- /register sebagai "absen masuk hall" di hari-H.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.

-- 1. Satu sumber pencarian untuk wizard "Tamu Undangan Terdaftar":
--    - semua tamu undangan (sudah hadir atau belum), dan
--    - delegasi baru (jalur representative) yang sudah mendaftar, supaya
--      mereka tidak mendaftar dua kali kalau kembali ke /register.
--    Hanya nama, kampus, jabatan, dan jam hadir yang diekspos; email, nomor
--    WA, dan kontak tetap privat.
create or replace view register_lookup as
  select
    g.id,
    g.full_name,
    g.campus_name,
    g.title,
    g.is_claimed as is_present,
    g.claimed_at as present_at,
    'invited'::text as source
  from invited_guests g
  union all
  select
    p.id,
    p.nama_lengkap,
    coalesce(mk.nama, '-'),
    p.jabatan,
    true,
    p.created_at,
    'representative'::text
  from participants p
  left join masjid_kampus mk on mk.id = p.masjid_kampus_id
  where p.registration_type = 'representative';

grant select on register_lookup to anon, authenticated;

-- 2. Tamu undangan yang konfirmasi hadir langsung berstatus approved (mereka
--    sudah ada di daftar resmi panitia). Delegasi baru tetap pending untuk
--    diperiksa panitia.
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
  v_status text;
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
    v_status := 'approved';

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
    v_status := 'pending';

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
    email, no_hp, jabatan, kategori, status, approved_at
  ) values (
    p_invited_guest_id, v_masjid_kampus_id, p_registration_type, v_nama,
    trim(p_email), trim(p_no_hp), v_jabatan, p_kategori, v_status,
    case when v_status = 'approved' then now() end
  )
  returning * into v_participant;

  return v_participant;
end;
$$;

revoke all on function register_participant(text, uuid, text, text, text, text, text, text, text) from public;
grant execute on function register_participant(text, uuid, text, text, text, text, text, text, text) to service_role;
