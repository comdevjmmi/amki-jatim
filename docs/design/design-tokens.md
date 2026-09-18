# Design Tokens — AMKI Jatim Rakerwil

Diturunkan dari logo AMKI (sayap teal/ocean blue + api golden amber).
Sumber kebenaran ada di `src/app/globals.css` (Tailwind v4 `@theme`) —
dokumen ini adalah referensi cepat untuk desain (Google Stitch) dan
implementasi.

## Warna

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `primary-50` | `#EFF9FF` | Background tint / hover halus |
| `primary-100` | `#DEF2FF` | Badge/chip terang |
| `primary-500` | `#0284C7` | Primary action, link, ikon aktif |
| `primary-600` | `#0369A1` | Hover state tombol primary |
| `primary-700` | `#0B629B` | Header/hero gradient, teks primary di atas terang |
| `primary-900` | `#0C4A6E` | Teks/heading kontras tinggi |
| `accent-50` | `#FFFBEB` | Background badge status "pending" |
| `accent-100` | `#FEF3C7` | Highlight ringan |
| `accent-500` | `#F59E0B` | Accent CTA, badge kategori, progress bar |
| `accent-600` | `#D97706` | Hover accent, ikon kandidat |
| `accent-700` | `#B45309` | Teks accent kontras tinggi |
| `surface` | `#FFFFFF` | Card/panel background |
| `surface-muted` | `#F8FAFC` | Page background, section alternating |
| `border` | `#E2E8F0` | Border/divider netral |
| `text` | `#0F172A` | Heading & body text utama |
| `text-muted` | `#475569` | Secondary text, caption |

Status semantik (dipetakan ke Tailwind default, konsisten dengan vibe):
- Approved / sukses → `emerald-500` (`#10B981`)
- Rejected / error → `rose-500` (`#F43F5E`)
- Pending → `accent-500`

## Tipografi

- Font: `Geist Sans` (sudah terpasang via `next/font`), fallback `ui-sans-serif`.
- Skala: `text-sm` (14px, caption/label) → `text-base` (16px, body) →
  `text-lg` (18px, lead) → `text-3xl`/`text-4xl` (heading section) →
  `text-5xl` (hero, desktop only).
- Heading weight `font-semibold`/`font-bold`, body `font-normal`,
  label/caption `font-medium` + `uppercase tracking-widest` (gaya "AMKI
  academic").

## Radius & Elevation

| Token | Value | Pemakaian |
| --- | --- | --- |
| `radius-sm` | 6px | Input, badge kecil |
| `radius-md` | 8px | Tombol |
| `radius-lg` | 12px | Card |
| `radius-xl` | 16px | Modal, panel besar |
| `radius-full` | 9999px | Pill button, avatar, chip |
| `shadow-card` | `0 1px 2px rgb(15 23 42 / 6%), 0 1px 3px rgb(15 23 42 / 10%)` | Card default |
| `shadow-elevated` | `0 4px 6px rgb(15 23 42 / 8%), 0 10px 15px rgb(15 23 42 / 8%)` | Modal, dropdown, sticky header |

## Tailwind Class Cheatsheet (untuk hand-off ke Stitch/MCP)

```
bg-primary-500 / hover:bg-primary-600 / text-primary-700
bg-accent-500 / hover:bg-accent-600 / text-accent-700
bg-surface / bg-surface-muted / border-border
text-text / text-text-muted
rounded-md (button) / rounded-lg (card) / rounded-xl (modal) / rounded-full (pill)
shadow-[var(--shadow-card)] / shadow-[var(--shadow-elevated)]
```

## Vibe

Modern, clean Islamic academic — banyak whitespace, garis tegas,
gradient teal→ocean blue halus di hero, aksen amber dipakai secukupnya
(CTA & status), tidak ramai. Mobile-first: semua layout harus scannable
di layar HP sebelum diperluas ke desktop.
