-- Presensi sesi lewat pilih nama (bukan nomor WhatsApp).
-- Pencarian publik atas peserta yang sudah approved. Hanya nama, kampus, dan
-- jam presensi sesi itu yang dikembalikan; nomor dan email tidak ikut.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
create or replace function search_presensi(p_session_id uuid, p_query text)
returns table (id uuid, nama_lengkap text, campus_name text, checked_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_pattern text;
begin
  if p_query is null or length(trim(p_query)) < 2 then
    return;
  end if;

  v_pattern := '%' || regexp_replace(trim(p_query), '([\\%_])', '\\\1', 'g') || '%';

  return query
    select p.id, p.nama_lengkap, coalesce(mk.nama, '-'), a.checked_in_at
    from participants p
    left join masjid_kampus mk on mk.id = p.masjid_kampus_id
    left join session_attendances a on a.participant_id = p.id and a.session_id = p_session_id
    where p.status = 'approved'
      and (p.nama_lengkap ilike v_pattern or coalesce(mk.nama, '') ilike v_pattern)
    order by p.nama_lengkap
    limit 8;
end;
$$;

revoke all on function search_presensi(uuid, text) from public;
grant execute on function search_presensi(uuid, text) to anon, authenticated;
