import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Landing-page-only typeface (Stitch design spec) — registered as a CSS
// variable here rather than the default body font, so /admin, /register and
// /vote keep using Geist. Applied via var(--font-plus-jakarta-sans) on the
// landing page's own wrapper in src/app/page.tsx.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rakerwil AMKI Jawa Timur",
  description: "Registrasi Peserta & E-Voting Pemilihan Ketua AMKI Wilayah Jawa Timur",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      {/* Material Symbols Outlined — icon font used by the Stitch-designed
          landing page (src/components/landing/*). Not a next/font candidate
          (variable icon font, not a text typeface), so linked directly. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        rel="stylesheet"
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
