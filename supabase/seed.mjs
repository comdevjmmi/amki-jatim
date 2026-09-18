// Seed dummy data into the live Supabase project for local dev/testing.
// Run: node --env-file=.env.local supabase/seed.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const masjidKampus = [
  { nama: "Masjid Kampus Baitul Hikmah UNAIR", kampus: "Universitas Airlangga", kota: "Surabaya" },
  { nama: "Masjid Kampus Manarul Ilmi ITS", kampus: "Institut Teknologi Sepuluh Nopember", kota: "Surabaya" },
  { nama: "Masjid Kampus Ulul Albab UB", kampus: "Universitas Brawijaya", kota: "Malang" },
];

const invitedGuests = [
  { full_name: "Ahmad Fauzi", campus_name: "Universitas Airlangga", title: "Ketua Umum", contact: "0812xxxxxx01" },
  { full_name: "Siti Nur Aini", campus_name: "Institut Teknologi Sepuluh Nopember", title: "Sekretaris Umum", contact: "0812xxxxxx02" },
  { full_name: "Muhammad Rizal", campus_name: "Universitas Brawijaya", title: "Ketua Umum", contact: "0812xxxxxx03" },
  { full_name: "Dewi Kartika", campus_name: "Universitas Negeri Malang", title: "Bendahara Umum", contact: "0812xxxxxx04" },
  { full_name: "Yusuf Hidayat", campus_name: "Universitas Jember", title: "Ketua Umum", contact: "0812xxxxxx05" },
];

// No unique constraint on masjid_kampus.kampus / invited_guests.full_name,
// so this is a plain insert (not upsert) — safe to run once against a fresh
// DB; re-running will duplicate rows.
const { data: mk, error: mkError } = await supabase
  .from("masjid_kampus")
  .insert(masjidKampus)
  .select();
if (mkError) throw mkError;
console.log(`masjid_kampus: inserted ${mk.length} rows`);

const { data: guests, error: guestError } = await supabase
  .from("invited_guests")
  .insert(invitedGuests)
  .select();
if (guestError) throw guestError;
console.log(`invited_guests: inserted ${guests.length} rows`);

const { error: settingsError } = await supabase
  .from("voting_settings")
  .upsert({ id: 1, is_voting_visible: false, is_voting_open: false }, { onConflict: "id" });
if (settingsError) throw settingsError;
console.log("voting_settings: row id=1 ensured (visible=false, open=false)");
