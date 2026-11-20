-- Undangan grup WhatsApp komunal: tiap tamu undangan dipegang satu PIC (1-7)
-- dan punya status pengiriman undangan grup. Aman dijalankan ulang.

alter table invited_guests add column if not exists pic smallint check (pic between 1 and 7);
alter table invited_guests
  add column if not exists invite_status text not null default 'belum'
  check (invite_status in ('belum', 'terkirim', 'dibalas', 'bermasalah'));

-- Pembagian awal: urut kampus lalu nama, 7 kelompok sama besar, sehingga tamu
-- dari kampus yang sama cenderung dipegang PIC yang sama.
with ranked as (
  select id, ntile(7) over (order by campus_name, full_name) as grp
  from invited_guests
  where pic is null
)
update invited_guests g set pic = r.grp from ranked r where g.id = r.id;
