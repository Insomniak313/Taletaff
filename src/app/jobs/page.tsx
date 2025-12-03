import type { Metadata } from "next";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

export const metadata: Metadata = {
  title: "Offres d'emploi qualifiées · Taletaff",
  description: "Naviguez par catégorie, stack et localisation pour identifier l'offre parfaite.",
};

const JobsPage = () => (
  <div className="mx-auto w-full max-w-6xl px-4 py-16">
    <header className="mb-8 space-y-2">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        Offres vérifiées
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Recherche avancée par catégorie.
      </h1>
      <p className="text-base text-slate-600">
        Filtres interactifs, salaires transparents, matching intelligent.
      </p>
    </header>
    <JobSearchSection />
  </div>
);

export default JobsPage;
