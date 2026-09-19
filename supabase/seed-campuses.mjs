// Seeds masjid_kampus from the official invited-campus list
// (docs/design/nama_kampus.md, Surat Undangan Rakerwil AMKI Jatim 2026).
// Insert-only: never overwrites an
// existing row (some may already carry real registration links via
// participants.masjid_kampus_id), so re-running this is always safe.
// Run: node --env-file=.env.local supabase/seed-campuses.mjs
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

function stripLinks(s) {
  return s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

function stripTrailingAbbrev(s) {
  return s.replace(/\s*\([A-Z0-9.\-]+\)\s*$/, "");
}

function cleanName(s) {
  return s
    .replace(/\\\[.*?\\\]/g, "") // stray \[1, 2, 3\] citation markers
    .replace(/\s+/g, " ")
    .trim()
    .replace(/,$/, "");
}

// Cities that actually appear in nama_kampus.md — used only to recover a
// city from a campus name when the source line itself omits one (several
// POLITEKNIK entries), never to assert a fact absent from the document.
const KNOWN_CITIES = [
  "Surabaya", "Malang", "Jember", "Kediri", "Madiun", "Blitar", "Mojokerto",
  "Pasuruan", "Probolinggo", "Banyuwangi", "Situbondo", "Bondowoso", "Jombang",
  "Ponorogo", "Magetan", "Gresik", "Tulungagung", "Lamongan", "Sidoarjo",
  "Bojonegoro", "Tuban", "Ngawi", "Sumenep", "Pamekasan", "Sampang",
  "Bangkalan", "Lumajang", "Pacitan", "Trenggalek", "Nganjuk",
];

function guessCityFromName(name) {
  return KNOWN_CITIES.find((city) => name.includes(city)) ?? null;
}

function parseCampuses(raw) {
  const results = [];
  let section = null;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("# NAMA-NAMA")) { section = "univ"; continue; }
    if (line.startsWith("# INSTITUT")) { section = "institut"; continue; }
    if (line.startsWith("**POLITEKNIK**")) { section = "politeknik"; continue; }
    if (!line || line.startsWith("![")) continue;

    const m = line.match(/^(\d+)\.\s*(.*)$/);
    if (!m || !section) continue;
    const rest = stripLinks(m[2]);

    if (section === "politeknik") {
      const name = stripTrailingAbbrev(cleanName(rest));
      if (!name) continue;
      results.push({ nama: name, kampus: name, kota: guessCityFromName(name) ?? "N/A" });
      continue;
    }

    // univ / institut: "Name, City" or "Name – City"
    let name;
    let city;
    if (rest.includes(" – ")) {
      [name, city] = rest.split(" – ").map((s) => s.trim());
    } else {
      const lastComma = rest.lastIndexOf(",");
      if (lastComma === -1) {
        name = rest;
        city = null;
      } else {
        name = rest.slice(0, lastComma);
        city = rest.slice(lastComma + 1);
      }
    }
    name = stripTrailingAbbrev(cleanName(name));
    city = city ? cleanName(city).replace(/^Kota |^Kabupaten /, "") : null;
    if (city === "Suarabaya") city = "Surabaya"; // typo in source

    // Category-header lines, not real institutions.
    if (!name || /^Universitas Islam Negeri$/i.test(name) || /^Politeknik Negeri Favorit$/i.test(name)) {
      continue;
    }

    if (!city || city.length < 2) city = guessCityFromName(name) ?? "N/A";
    results.push({ nama: name, kampus: name, kota: city });
  }

  // Dedup case-insensitively by name; prefer whichever occurrence has a real
  // (non-"N/A") city. The one genuine source self-contradiction — Universitas
  // Wijaya Putra listed once as Pasuruan and once as "Suarabaya"/Surabaya —
  // resolves to the first-seen entry (Pasuruan) here; flagged in the seed
  // summary since Wijaya Putra is in fact a Surabaya campus.
  const byName = new Map();
  for (const r of results) {
    const key = r.kampus.toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, r);
    } else if (existing.kota === "N/A" && r.kota !== "N/A") {
      byName.set(key, r);
    }
  }
  return [...byName.values()];
}

const raw = readFileSync(new URL("../docs/design/nama_kampus.md", import.meta.url), "utf-8");
const campuses = parseCampuses(raw);
console.log(`Parsed ${campuses.length} unique campuses from nama_kampus.md`);

const unresolvedCity = campuses.filter((c) => c.kota === "N/A");
if (unresolvedCity.length > 0) {
  console.log(`  ${unresolvedCity.length} with no city in source (kota="N/A"): ${unresolvedCity.map((c) => c.kampus).join(", ")}`);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data: existing, error: fetchError } = await supabase.from("masjid_kampus").select("kampus");
if (fetchError) throw fetchError;

const existingNames = new Set(existing.map((r) => r.kampus.toLowerCase()));
const toInsert = campuses.filter((c) => !existingNames.has(c.kampus.toLowerCase()));

console.log(`${campuses.length - toInsert.length} already in masjid_kampus, inserting ${toInsert.length} new rows.`);

if (toInsert.length > 0) {
  const { error: insertError } = await supabase.from("masjid_kampus").insert(toInsert);
  if (insertError) throw insertError;
}

console.log("Done.");
