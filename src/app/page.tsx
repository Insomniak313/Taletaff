import { Hero } from "@/components/sections/Hero";
import { InsightList } from "@/components/sections/InsightList";
import { SuccessStoriesLoader } from "@/components/sections/SuccessStoriesLoader";
import { CategoryGrid } from "@/features/jobs/components/CategoryGrid";
import { jobCategories } from "@/config/jobCategories";

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
    <SuccessStoriesLoader />
  </div>
);

export default Home;
