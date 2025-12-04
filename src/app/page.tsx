import { Suspense } from "react";
import dynamic from "next/dynamic";

import { Hero } from "@/components/sections/Hero";
import { IllustratedPitch } from "@/components/sections/IllustratedPitch";
import { InsightList } from "@/components/sections/InsightList";
import { SuccessStoriesLoader } from "@/components/sections/SuccessStoriesLoader";
import { ProjectModules } from "@/components/sections/ProjectModules";
import { CategoryGrid } from "@/features/jobs/components/CategoryGrid";
import { jobCategories } from "@/config/jobCategories";

const DataPulse = dynamic(() => import("@/components/sections/DataPulse").then((mod) => mod.DataPulse));

const AutomationPlayground = dynamic(
  () => import("@/components/sections/AutomationPlayground").then((mod) => mod.AutomationPlayground)
);

const SectionPlaceholder = ({ title }: { title: string }) => (
  <section className="rounded-[32px] border border-dashed border-white/60 bg-white/40 p-8">
    <p className="text-sm text-ink-500">Chargement de {title}…</p>
  </section>
);

const Home = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 py-12">
    <Hero />
    <ProjectModules />
    <Suspense fallback={<SectionPlaceholder title="Data Pulse" />}>
      <DataPulse />
    </Suspense>
    <InsightList />
    <IllustratedPitch />
    <section className="space-y-6 rounded-[32px] border border-white/70 bg-white/80 px-6 py-8 shadow-lg">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
          Parcours guidé
        </p>
        <h2 className="text-3xl font-semibold text-ink-900">
          Choisissez un univers métier.
        </h2>
        <p className="text-sm text-ink-500">
          Des catégories triées sur le volet pour gagner du temps et poser les bonnes priorités.
        </p>
      </header>
      <CategoryGrid categories={jobCategories} />
    </section>
    <Suspense fallback={<SectionPlaceholder title="Playground automatisation" />}>
      <AutomationPlayground />
    </Suspense>
    <SuccessStoriesLoader />
  </div>
);

export default Home;
