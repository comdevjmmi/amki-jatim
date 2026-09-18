# Google Stitch Prompts — AMKI Jatim Rakerwil (5 Halaman)

Semua prompt memakai palet & token di [`design-tokens.md`](./design-tokens.md).
Paste satu prompt per project/screen di Google Stitch. Setelah desain
final, tarik ke Claude Code via Google Stitch MCP untuk diimplementasikan
1:1 ke komponen Next.js + Tailwind.

Style guide yang dilampirkan di setiap prompt (jangan diubah, ini yang
menjaga konsistensi lintas halaman):

```
Design system: Modern clean Islamic academic, trustworthy, mobile-responsive.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7 (gradient allowed).
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Neutral: White #FFFFFF, Light Gray surface #F8FAFC, Dark Slate text #0F172A.
Typography: clean geometric sans-serif, generous whitespace, strong hierarchy.
Corner radius: 8px buttons, 12px cards, 16px modals, full-pill for tags/status badges.
Elevation: soft, low-contrast shadows only (no harsh drop shadows).
Layout: mobile-first, then scale up to desktop (min 375px, max 1440px).
```

---

## Prompt #1 — Landing Page & Public Information

```
Design a mobile-first, responsive landing page for "Rakerwil AMKI Jawa
Timur" (Rapat Kerja Wilayah — regional working meeting of Asosiasi
Masjid Kampus Indonesia, East Java chapter).

[Design system]
Modern clean Islamic academic, trustworthy, mobile-responsive.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7 (gradient allowed).
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Neutral: White #FFFFFF, Light Gray surface #F8FAFC, Dark Slate text #0F172A.
Typography: clean geometric sans-serif, generous whitespace, strong hierarchy.
Corner radius: 8px buttons, 12px cards, 16px modals, full-pill for badges.
Elevation: soft, low-contrast shadows only.

[Sections, top to bottom]
1. Sticky top navbar: AMKI logo (teal/amber wings mark) on the left,
   nav links (Beranda, Rundown, Registrasi, Live Count) on the right,
   collapses to a hamburger menu on mobile. Primary "Daftar Peserta"
   button, pill-shaped, teal-to-blue gradient background, white text.

2. Hero section: full-bleed soft gradient background (teal #0B629B to
   ocean blue #0284C7, subtle diagonal), white text. Small amber pill
   label "RAPAT KERJA WILAYAH" above the headline. Large bold headline
   "AMKI Wilayah Jawa Timur" with subheading naming the event theme
   (placeholder text). A live countdown timer to the event date —
   four stat blocks (Hari / Jam / Menit / Detik) in rounded white
   cards with dark slate numbers and teal labels, laid out in a row on
   desktop and a 2x2 grid on mobile. Below the countdown, two CTA
   buttons side by side: primary amber pill "Daftar Sekarang" and
   secondary white/outline pill "Lihat Rundown".

3. Agenda / Rundown section on white background: section title "Rundown
   Acara" centered, below it a horizontal tab bar with pill tabs for
   "Hari 1", "Hari 2", "Hari 3" (active tab filled teal, inactive
   outline gray). Under the active tab, a vertical timeline list: each
   row has a time badge (amber pill, e.g. "08.00 - 09.00"), a vertical
   teal connector line, and a card with activity title + short
   description. Stack single-column on mobile.

4. Profil Kegiatan section on light gray (#F8FAFC) background: 3-column
   grid of info cards (stacks to 1 column on mobile), each with a
   circular teal icon badge on top, a bold title, and 1-2 line
   description — cover "Tentang AMKI", "Tujuan Rakerwil", "Lokasi &
   Fasilitas".

5. Stats strip: dark slate or teal background band with 3-4 large
   white numeric stats (e.g. "150+ Delegasi", "35+ Masjid Kampus",
   "38 Kabupaten/Kota") in a responsive row.

6. Final CTA banner: amber gradient card, rounded 16px, centered text
   "Belum daftar sebagai delegasi?" with a white outline button
   "Daftar Sekarang".

7. Footer: dark slate background, white text, AMKI logo, contact info,
   social links, copyright line. Simple 2-3 column layout on desktop,
   stacked on mobile.

Deliver both a mobile (375px) and desktop (1440px) frame.
```

---

## Prompt #2 — Registration & Mandate Submission Form

```
Design a mobile-first registration form page for delegates of "Rakerwil
AMKI Jawa Timur" to register themselves and submit their mandate letter
(surat mandat) from their Masjid Kampus.

[Design system]
Modern clean Islamic academic, trustworthy, mobile-responsive.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7.
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Neutral: White #FFFFFF, Light Gray surface #F8FAFC, Dark Slate text #0F172A.
Corner radius: 8px inputs/buttons, 12px cards.
Elevation: soft shadow on the form card only.

[Layout]
Centered page on light gray (#F8FAFC) background. Top: small breadcrumb
"Beranda / Registrasi Peserta" and a page title "Formulir Registrasi
Delegasi" with a one-line description below it. Below the title, a
horizontal step indicator with 2 steps: "1. Data Delegasi" (active,
teal filled circle) and "2. Konfirmasi" (inactive, gray outline
circle), connected by a line.

Main content: a white rounded-12px card with soft shadow, max-width
~760px, containing a responsive 2-column form grid (collapses to 1
column on mobile, gap 16-24px):

Section "Data Diri":
- Nama Lengkap (text input, full width)
- Email (text input)
- Nomor WhatsApp (text input)
- Jabatan di Organisasi (text input, e.g. "Ketua Umum")

Section "Data Delegasi", divider line above with label:
- Masjid Kampus / Lembaga — a searchable dropdown/combobox component:
  input field with a search icon, showing a dropdown list of masjid
  kampus options with a "Tidak ketemu? Tambah baru" link at the bottom
  of the list.
- Kota/Kabupaten (dropdown, full width)
- Kategori Peserta — a segmented toggle/switch component with two
  options side by side, pill-shaped container: "Peserta Penuh (Hak
  Suara)" and "Peserta Peninjau", selected option filled teal with
  white text, unselected option transparent with gray text. Add a
  small helper caption below explaining the difference in muted gray
  text.

Section "Surat Mandat", divider line above with label:
- A drag-and-drop file upload box: dashed 2px border in teal, rounded
  12px, light teal tint background (#EFF9FF), centered upload cloud
  icon in teal, bold text "Seret file ke sini atau klik untuk upload",
  caption below in muted gray "Format PDF/JPG, maks 5MB". Once a file
  is attached, show a compact file chip below with filename, file
  size, a green checkmark icon, and a remove (x) icon.

Bottom of form: a full-width primary button "Kirim Registrasi" (teal
to blue gradient, pill shape, white bold text), and a secondary ghost
button "Simpan sebagai Draft" below or beside it.

[Status feedback states — show as a separate frame]
A confirmation state: card replaced with a centered success illustration
(simple line icon in a teal circle), bold headline "Registrasi
Terkirim!", body text explaining the data is being verified by
panitia, a status badge pill "Menunggu Verifikasi" in amber
(background #FEF3C7, text #B45309), and a button "Kembali ke Beranda".
Also show an error/rejected state variant with a rose-tinted badge
"Ditolak" and a short reason text field.
```

---

## Prompt #3 — Secret E-Voting Booth

```
Design a secure, focused, mobile-first e-voting booth screen for
electing the Ketua (Chairman) of AMKI Jawa Timur. The design must feel
serious, trustworthy, and distraction-free — this is a secret ballot.

[Design system]
Modern clean Islamic academic, trustworthy, mobile-responsive.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7.
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Neutral: White #FFFFFF, Light Gray surface #F8FAFC, Dark Slate text #0F172A.
Corner radius: 12px cards, 16px modals, full-pill badges/buttons.
Elevation: strong soft shadow on modals to lift them above a dimmed backdrop.

[Screen A — Token Authentication Gate]
Full-screen centered layout on a light gray background with a subtle
teal radial gradient glow behind the card. Centered white card,
rounded 16px, soft shadow, max-width ~420px: AMKI logo at top, lock
icon in a teal circular badge, headline "Bilik Suara Digital", body
text "Masukkan token rahasia yang dikirimkan ke email/WhatsApp Anda".
Below it, a segmented OTP-style input — 6 separate boxed character
cells in a row, teal border on focus. Helper caption below in muted
gray "Token hanya bisa digunakan satu kali". Primary button "Masuk ke
Bilik Suara" (full width, teal gradient, disabled/gray state until all
6 cells filled). Small footer note with a shield icon: "Suara Anda
bersifat rahasia dan tidak dapat dilacak".

[Screen B — Candidate Selection]
Top: slim sticky header showing event name, a live countdown/voting
session indicator (pill badge "Voting Dibuka" in emerald green with a
pulsing dot), and a subtle progress note "Pilih 1 dari N kandidat".
Below it, headline "Pemilihan Ketua AMKI Jawa Timur 2026-2029".

Main content: a responsive grid of candidate cards (1 column mobile, 2
columns tablet+), each card rounded-12px white background, soft
shadow, containing: a large circular candidate photo centered at top
with a teal ring border, candidate number badge (amber pill, "Calon
No. 1") overlapping the top-right of the photo, candidate name in
bold large text, a short visi-misi excerpt (2-3 lines, muted gray,
with a "Lihat selengkapnya" link that opens a detail modal), and at
the bottom a large circular radio-select control — unselected state is
an outlined teal circle, selected state is a filled teal circle with a
white checkmark and the whole card gets a teal border highlight + light
teal background tint.

Sticky bottom bar (mobile) / bottom-right fixed button (desktop): a
large pill button "Konfirmasi Pilihan" in amber gradient, disabled/gray
until a candidate is selected.

[Screen C — Confirmation Modal]
Dimmed dark backdrop over Screen B. Centered modal, rounded-16px white
card, strong shadow, max-width ~400px: warning/info icon in amber
circle at top, headline "Konfirmasi Suara Anda", body text "Anda akan
memilih [Nama Calon]. Pilihan tidak dapat diubah setelah dikirim.",
a compact preview row showing the selected candidate's small photo +
name, two buttons side by side at the bottom: secondary outline button
"Batal" and primary solid button "Kirim Suara Sekarang" (rose/red-teal
distinct tone to signal irreversibility, e.g. dark teal filled).

[Screen D — Success State]
Centered card, checkmark burst illustration in teal/amber, headline
"Suara Anda Telah Tercatat", body text thanking the voter, a note that
they may now close the page, no way back to the ballot.
```

---

## Prompt #4 — Realtime Live Count & Big Screen Projector View

```
Design a big-screen / projector display for live vote counting during
the AMKI Jawa Timur chairman election, meant to be viewed from a
distance on a large screen during the Rakerwil session. High contrast,
very large type, minimal clutter, real-time data feel.

[Design system]
Modern clean Islamic academic, trustworthy.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7.
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Background: dark slate #0F172A (this screen uses a dark theme for
projector contrast), card surfaces in a slightly lighter slate with
subtle teal glow borders.
Corner radius: 16-20px cards, full-pill for status badges.
Elevation: glow/soft shadow, no harsh lines.

[Layout — 1920x1080 landscape frame]
Top bar: AMKI logo + event name "Live Count — Pemilihan Ketua AMKI
Jawa Timur" on the left, large voting status pill on the right —
two states to show as variants: "VOTING DIBUKA" (emerald green,
pulsing dot) and "VOTING DITUTUP" (rose red, static dot). Next to it
a toggle-style control implying an admin can flip open/closed (show
as a switch element, teal when open).

Top stats row (3 large stat cards): "Total Delegasi Terdaftar",
"Total Suara Masuk", "Partisipasi (%)" — each with a huge bold white
number, small teal/amber icon, and a muted label underneath.

Main content, split into two halves:
Left half (~60% width): a large modern horizontal bar chart, one bar
per candidate, ranked descending. Each bar: candidate name + number on
the left, the bar itself in a teal-to-amber gradient fill with rounded
end caps, vote count and percentage displayed at the end of the bar in
large bold white text. Bars animate/fill from left (implied via a
subtle motion-highlight edge).

Right half (~40% width): a large donut/ring chart showing the same
vote distribution, each candidate slice colored distinctly using the
teal/amber/neutral palette family (e.g. primary-500, accent-500,
primary-300, accent-300), with a legend below listing candidate name,
color swatch, and percentage. Center of the donut shows the total
votes count in large bold text with "Total Suara" caption.

Bottom ticker bar: slim strip showing "Update terakhir: [timestamp]"
with a small live-refresh icon (rotating arrows), reinforcing this
is a realtime feed.

Provide a second frame variant for "Hidden Result" mode: same layout
but the bar chart and donut chart values are blurred/obscured with a
frosted-glass overlay and a centered lock icon + text "Hasil
disembunyikan hingga voting ditutup", while the stats row (total
delegasi, total suara masuk, partisipasi) remains visible.
```

---

## Prompt #5 — Admin & Pimpinan Sidang Dashboard

```
Design a desktop-first (min 1280px, responsive down to tablet) admin
dashboard for event committee (panitia) and session leadership
(pimpinan sidang) to manage registration, voting tokens, candidates,
and exports for the AMKI Jawa Timur Rakerwil.

[Design system]
Modern clean Islamic academic, trustworthy, data-dense but organized.
Primary color: Deep Islamic Teal / Ocean Blue — #0B629B to #0284C7.
Accent color: Golden Amber / Warm Ochre — #F59E0B to #D97706.
Neutral: White #FFFFFF, Light Gray surface #F8FAFC, Dark Slate text #0F172A.
Corner radius: 8px inputs/buttons, 12px cards, full-pill for status badges.
Elevation: soft card shadows, subtle divider lines in tables.

[Layout]
Left sidebar (fixed, dark slate #0F172A background, ~260px wide, white
text): AMKI logo at top, nav items with icons — "Ringkasan", "Peserta
& Delegasi", "Token Voting", "Kandidat", "Live Count", "Export Data" —
active item has a teal pill background highlight. User profile chip
at the bottom of the sidebar (avatar, name, role "Admin/Panitia").

Top bar (white, sticky): page title on the left (dynamic per section),
search input in the middle, notification bell icon and admin avatar on
the right.

[Main section: "Peserta & Delegasi" — the primary screen to design in
full detail]
Header row: title "Data Peserta & Delegasi", subtitle with total count,
and a primary button "Export CSV/Excel" (teal outline button with a
download icon) top-right.

Filter/toolbar row below header: a segmented pill filter for status —
"Semua", "Pending" (amber dot), "Approved" (emerald dot), "Rejected"
(rose dot) — plus a dropdown filter for "Kategori" (Peserta
Penuh/Peninjau) and a search input with icon on the right side of the
row.

Data table, white card rounded-12px with soft shadow:
Columns: checkbox (bulk select), Nama, Masjid Kampus, Kategori (small
pill badge: teal for "Peserta Penuh", gray outline for "Peninjau"),
Status (pill badge colored per status as above), Tanggal Daftar, Aksi
(row of small icon buttons: view detail, approve — checkmark icon in
emerald, reject — x icon in rose).
Table rows have subtle alternating background or hover highlight
(light teal tint on hover). Header row sticky, bold, muted gray text,
small sort arrows on sortable columns.
Bottom of table: pagination control (page numbers + prev/next, teal
active page) and rows-per-page selector.
When rows are bulk-selected via checkbox, show a floating contextual
action bar above the table: "3 peserta dipilih" with buttons "Approve
Semua" and "Export Terpilih".

[Section: "Token Voting"]
Similar table layout listing approved Peserta Penuh with columns:
Nama, Masjid Kampus, Status Token (badge: "Belum Dibuat" gray,
"Terkirim" teal, "Sudah Digunakan" emerald with a checkmark), Aksi
(button "Generate & Kirim Token"). Top of page: a summary stat row —
"Token Terbit", "Token Terpakai", "Belum Vote" — as 3 compact stat
cards, plus a prominent button "Generate Token untuk Semua yang
Approved".

[Section: "Kandidat"]
Card-grid layout (not table) for managing candidates: each candidate
shown as a horizontal card with photo thumbnail, name, nomor urut
badge, short visi-misi excerpt, and edit/delete icon buttons. A
prominent "+ Tambah Kandidat" button (dashed border card acting as an
add-button) at the end of the grid.

[Section: "Live Count" control]
A simplified control panel version of the projector view (Prompt #4)
scaled for a laptop screen, plus a prominent large toggle switch card
at the top: "Status Voting" with the open/close switch, current state
label, and a confirmation-required note ("Menutup voting tidak dapat
dibatalkan").

Use consistent status badge colors throughout: emerald = positive/
approved/used, amber = pending/in-progress, rose = rejected/error,
teal = neutral primary state, gray = inactive/unset.
```

---

## Prompt Modifier — Reusable Style Block

Simpan blok ini terpisah agar bisa ditempel ke prompt tambahan
(misalnya halaman detail kandidat, halaman error, email template) agar
tetap konsisten:

```
Maintain the AMKI Jawa Timur design system: primary teal/ocean blue
(#0B629B–#0284C7), accent golden amber (#F59E0B–#D97706), white/light
gray neutrals (#FFFFFF, #F8FAFC), dark slate text (#0F172A). 8px button
radius, 12px card radius, 16px modal radius, full-pill badges. Soft
low-contrast shadows only. Mobile-first, clean Islamic academic vibe,
generous whitespace, strong visual hierarchy.
```
