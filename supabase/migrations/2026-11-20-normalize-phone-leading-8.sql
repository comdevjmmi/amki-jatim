-- Nomor seluler Indonesia yang ditulis tanpa angka 0 di depan (mis.
-- 85102633369) harus dianggap sama dengan 085102633369 / +62 851-0263-3369.
-- Sebelumnya hanya awalan "0" yang diubah menjadi "62", jadi dua penulisan
-- itu dianggap nomor berbeda (lolos dari batasan unik dan tidak ketemu di
-- /cek-token). Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.

create or replace function normalize_phone(raw text)
returns text
language sql
immutable
as $$
  select case
    when d = '' then ''
    when d like '0%' then '62' || substr(d, 2)
    when d like '8%' then '62' || d
    else d
  end
  from (select regexp_replace(coalesce(raw, ''), '\D', '', 'g') as d) t;
$$;

-- Kolom turunan yang disimpan tidak dihitung ulang otomatis saat fungsinya
-- berubah, jadi dibangun ulang bersama indeks uniknya.
drop index if exists participants_no_hp_norm_key;
alter table participants drop column if exists no_hp_norm;
alter table participants
  add column no_hp_norm text generated always as (normalize_phone(no_hp)) stored;
create unique index participants_no_hp_norm_key on participants (no_hp_norm);
