import type { Metadata } from "next";
import "./globals.css";

const SITE_DESCRIPTION =
  "Registrasi Peserta & E-Voting Rakerwil II PW AMKI Jawa Timur 2026 — Sabtu, 21 November 2026 di Universitas Islam Malang (UNISMA).";

export const metadata: Metadata = {
  title: "Rakerwil II PW AMKI Jawa Timur 2026",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Rakerwil II PW AMKI Jawa Timur 2026 — UNISMA Malang",
    description: SITE_DESCRIPTION,
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        {/*
          Geist, Geist Mono, and Plus Jakarta Sans loaded via standard
          <link> tags instead of next/font/google. Turbopack's font loader
          (`@vercel/turbopack-next/internal/font/google/font`) fails to
          resolve on Vercel's build image for this project ("next/font/google
          queries have exactly one entry") even though it builds fine
          locally — a Vercel-side Turbopack/font-loader mismatch, not
          something fixable from app code. Linking the fonts directly
          sidesteps that loader entirely. The --font-geist-sans,
          --font-geist-mono, and --font-plus-jakarta-sans CSS variables are
          now declared in globals.css (:root) instead of via next/font's
          generated .variable class, so every existing var(--font-*)
          reference (Tailwind's --font-sans/--font-mono, and the inline
          style on the landing page wrapper in src/app/page.tsx) keeps
          working unchanged — the rendered typography is identical.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Material Symbols Outlined — icon font used by the Stitch-designed
            landing page (src/components/landing/*). Not a next/font candidate
            (variable icon font, not a text typeface), so linked directly.
            Must live inside <head>, not directly under <html> — React/Next
            reject <link> as a direct child of <html> at runtime (hydration
            error), even though it doesn't fail the build. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
