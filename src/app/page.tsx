import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Icon } from "@/components/landing/icon";
import { Navbar } from "@/components/landing/navbar";
import { Profil } from "@/components/landing/profil";
import { RundownTabs } from "@/components/landing/rundown-tabs";
import { Stats } from "@/components/landing/stats";
import { getLandingStats } from "@/lib/data/landing-stats";
import { getVotingSettings } from "@/lib/data/voting-settings";

export default async function Home() {
  const [{ isVotingVisible }, stats] = await Promise.all([getVotingSettings(), getLandingStats()]);

  return (
    // Plus Jakarta Sans applied only within this tree (Stitch design spec) —
    // /admin, /register and /vote are untouched and keep the Geist body font.
    <div className="flex flex-1 flex-col bg-stitch-surface" style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}>
      <Navbar isVotingVisible={isVotingVisible} />

      {/* pt-20 compensates for the fixed (not sticky) header, same as the
          Stitch export's <main class="pt-20">. */}
      <main className="w-full flex-1 pt-20">
        <Hero />

        <section id="rundown" className="w-full bg-stitch-surface py-space-xl lg:py-24">
          <div className="mx-auto flex max-w-4xl flex-col px-margin-sm lg:px-margin">
            <div className="mb-space-xl text-center">
              <div className="mb-space-xs inline-flex items-center gap-1 text-stitch-primary">
                <Icon name="schedule" className="text-[18px]" />
                <span className="text-label-md font-bold uppercase tracking-widest">
                  Agenda &amp; Sidang
                </span>
              </div>
              <h2 className="mb-space-xs text-headline-lg font-extrabold tracking-tight text-stitch-on-surface">
                Rundown Acara
              </h2>
              <p className="mx-auto max-w-xl text-stitch-on-surface-variant">
                Rangkaian Kegiatan dan Sidang Pleno Komisi Rakerwil AMKI Jawa Timur
              </p>
            </div>

            <RundownTabs />
          </div>
        </section>

        <Profil />
        <Stats {...stats} />
        <CtaBanner />
      </main>

      <Footer />
    </div>
  );
}
