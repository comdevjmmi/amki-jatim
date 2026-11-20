-- Kota/Kabupaten asal tamu undangan, ditampilkan di langkah "cari nama" pada
-- /register. Diisi dari kolom "Alamat Institusi" di Google Sheet (disatukan
-- per kampus) dan bisa diedit di menu Tamu Undangan.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
alter table invited_guests add column if not exists kota text;
