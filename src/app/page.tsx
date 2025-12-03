import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { InsightList } from "@/components/sections/InsightList";
import { CategoryGrid } from "@/features/jobs/components/CategoryGrid";
import { jobCategories } from "@/config/jobCategories";

const SuccessStories = dynamic(
  () => import("@/components/sections/SuccessStories").then((mod) => mod.SuccessStories),
  { ssr: false, loading: () => <p className="text-sm text-slate-500">Chargement des retours…</p> }
);

const Home = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16">
    <Hero />
    <InsightList />
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Parcours guidé
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Choisissez un univers métier.
        </h2>
      </header>
      <CategoryGrid categories={jobCategories} />
    </section>
    <Suspense fallback={<p className="text-sm text-slate-500">Chargement…</p>}>
      <SuccessStories />
    </Suspense>
  </div>
);

export default Home;
