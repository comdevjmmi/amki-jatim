-- Bucket foto kandidat. Publik hanya untuk DIBACA (tag <img> di bilik suara);
-- unggah/hapus hanya lewat server action admin (service role), jadi tidak ada
-- policy tulis untuk anon. Dibatasi 2 MB dan hanya JPG/PNG/WebP.
-- Jalankan sekali di Supabase SQL Editor. Aman dijalankan ulang.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-photos', 'candidate-photos', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
