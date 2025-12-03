"use client";

import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories, defaultJobCategory } from "@/config/jobCategories";
import { useJobSearch } from "@/hooks/useJobSearch";

export const JobSearchSection = () => {
  const { category, setCategory, query, setQuery, jobs, isLoading, error, summary } =
    useJobSearch({ initialCategory: defaultJobCategory.slug });

  return (
    <section className="space-y-4">
      <JobFilters
        categories={jobCategories}
        activeCategory={category}
        onCategoryChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        summary={summary}
      />
      {isLoading && (
        <p className="text-sm text-slate-500">Chargement des offres…</p>
      )}
      {error && !isLoading && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {!isLoading && <JobList jobs={jobs} />}
    </section>
  );
};
