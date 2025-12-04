"use client";

import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories, defaultJobCategory } from "@/config/jobCategories";
import { useJobSearch } from "@/hooks/useJobSearch";

interface JobSearchSectionProps {
  initialCategory?: string;
}

export const JobSearchSection = ({ initialCategory }: JobSearchSectionProps = {}) => {
  const fallbackCategory = initialCategory ?? defaultJobCategory.slug;
  const {
    category,
    setCategory,
    query,
    setQuery,
    jobs,
    isLoading,
    error,
    summary,
    location,
    setLocation,
    remoteOnly,
    toggleRemoteOnly,
    salaryFloor,
    setSalaryFloor,
    selectedTags,
    toggleTag,
    resetFilters,
  } = useJobSearch({ initialCategory: fallbackCategory });

  return (
    <section className="space-y-6">
      <JobFilters
        categories={jobCategories}
        activeCategory={category}
        onCategoryChange={setCategory}
        query={query}
        onQueryChange={setQuery}
        summary={summary}
        errorMessage={error}
        location={location}
        onLocationChange={setLocation}
        remoteOnly={remoteOnly}
        onRemoteToggle={toggleRemoteOnly}
        salaryFloor={salaryFloor}
        onSalaryFloorChange={setSalaryFloor}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        onResetFilters={resetFilters}
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
