"use client";

import { useCallback, useMemo, useState } from "react";

import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters } from "@/config/jobProviders";
import { useJobSearch } from "@/hooks/useJobSearch";
import type { JobRecord } from "@/types/job";

const PAGE_SIZE = 6;

const computeJobsSignature = (jobs: ReadonlyArray<JobRecord>) =>
  jobs.map((job) => job.id).join("|");

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

  const signature = useMemo(() => computeJobsSignature(jobs), [jobs]);
  const [pageState, setPageState] = useState({ page: 1, signature });

  const pageCount = useMemo(() => Math.max(Math.ceil(jobs.length / PAGE_SIZE), 1), [jobs.length]);

  const requestedPage = pageState.signature === signature ? pageState.page : 1;
  const page = Math.min(Math.max(requestedPage, 1), pageCount);

  const paginatedJobs = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return jobs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [jobs, page]);

  const updatePage = useCallback(
    (nextPage: number) => {
      setPageState({
        page: Math.min(Math.max(nextPage, 1), pageCount),
        signature,
      });
    },
    [pageCount, signature]
  );

  const goToPrevious = useCallback(() => updatePage(page - 1), [page, updatePage]);
  const goToNext = useCallback(() => updatePage(page + 1), [page, updatePage]);

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
      {isLoading && <p className="text-sm text-slate-500">Chargement des offres…</p>}
      {error && !isLoading && <p className="text-sm text-red-500">{error}</p>}
      {!isLoading && (
        <>
          <JobList jobs={paginatedJobs} />
          {jobs.length > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition disabled:opacity-40"
              >
                ← Précédent
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Page {page} / {pageCount}
              </p>
              <button
                type="button"
                onClick={goToNext}
                disabled={page === pageCount}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
