"use client";

import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters } from "@/config/jobProviders";
import { useJobSearch } from "@/hooks/useJobSearch";

interface JobSearchSectionProps {
  initialCategory?: string;
}

export const JobSearchSection = ({ initialCategory }: JobSearchSectionProps = {}) => {
  const {
    category,
    setCategory,
    provider,
    setProvider,
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
  } = useJobSearch({ initialCategory });

  return (
    <section className="space-y-6">
      <JobFilters
        categories={jobCategories}
        activeCategory={category}
        onCategoryChange={setCategory}
        providers={jobProviderFilters}
        activeProvider={provider}
        onProviderChange={setProvider}
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
