import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Profil } from "@/components/landing/profil";
import { RundownTabs } from "@/components/landing/rundown-tabs";
import { Stats } from "@/components/landing/stats";
import { getLandingStats } from "@/lib/data/landing-stats";
import { getVotingSettings } from "@/lib/data/voting-settings";

export default async function Home() {
  const [{ isVotingVisible }, stats] = await Promise.all([getVotingSettings(), getLandingStats()]);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar isVotingVisible={isVotingVisible} />

      <main className="flex-1">
        <Hero />

        <section id="rundown" className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary-600">
              Agenda
            </p>
            <h2 className="mt-2 text-3xl font-bold text-text">Rundown Acara</h2>
          </div>
          <div className="mt-10">
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
