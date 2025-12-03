import { Hero } from "@/components/sections/Hero";
import { InsightList } from "@/components/sections/InsightList";
import { SuccessStoriesLoader } from "@/components/sections/SuccessStoriesLoader";
import { CategoryGrid } from "@/features/jobs/components/CategoryGrid";
import { jobCategories } from "@/config/jobCategories";

const Home = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 py-12">
    <Hero />
    <InsightList />
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
    <SuccessStoriesLoader />
  </div>
);

export default Home;
