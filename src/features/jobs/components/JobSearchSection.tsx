"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters } from "@/config/jobProviders";
import { useJobSearch } from "@/hooks/useJobSearch";
import type { JobRecord } from "@/types/job";

interface JobSearchSectionProps {
  initialCategory?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 40];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
const computeJobsSignature = (jobs: ReadonlyArray<JobRecord>) =>
  jobs.map((job) => job.id).join("|");

export const JobSearchSection = ({ initialCategory }: JobSearchSectionProps = {}) => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
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
    toggleRemoteOnly: toggleRemoteFilter,
    salaryFloor,
    setSalaryFloor,
    selectedTags,
    toggleTag: toggleTagFilter,
    resetFilters,
  } = useJobSearch({ initialCategory });

  const signature = useMemo(() => computeJobsSignature(jobs), [jobs]);

  const pageCount = useMemo(
    () => Math.max(Math.ceil(jobs.length / pageSize), 1),
    [jobs.length, pageSize]
  );
  const safePage = Math.min(Math.max(page, 1), pageCount);

  const paginatedJobs = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return jobs.slice(startIndex, startIndex + pageSize);
  }, [jobs, pageSize, safePage]);

  useEffect(() => {
    setPage(1);
  }, [signature, pageSize]);

  const handleCategoryChange = useCallback(
    (nextCategory?: string) => {
      setCategory(nextCategory);
      setPage(1);
    },
    [setCategory]
  );

  const handleProviderChange = useCallback(
    (nextProvider?: JobRecord["source"]) => {
      setProvider(nextProvider);
      setPage(1);
    },
    [setProvider]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setPage(1);
    },
    [setQuery]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocation(value);
      setPage(1);
    },
    [setLocation]
  );

  const handleRemoteToggle = useCallback(() => {
    toggleRemoteFilter();
    setPage(1);
  }, [toggleRemoteFilter]);

  const handleSalaryFloorChange = useCallback(
    (value: number | null) => {
      setSalaryFloor(value);
      setPage(1);
    },
    [setSalaryFloor]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      toggleTagFilter(tag);
      setPage(1);
    },
    [toggleTagFilter]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setPage(1);
  }, [resetFilters]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), pageCount));
    },
    [pageCount]
  );

  const handlePageSizeChange = useCallback(
    (nextSize: number) => {
      if (PAGE_SIZE_OPTIONS.includes(nextSize)) {
        setPageSize(nextSize);
      }
    },
    []
  );

  const goToPrevious = useCallback(() => handlePageChange(safePage - 1), [
    handlePageChange,
    safePage,
  ]);
  const goToNext = useCallback(() => handlePageChange(safePage + 1), [
    handlePageChange,
    safePage,
  ]);

  return (
    <section className="space-y-6">
      <JobFilters
        categories={jobCategories}
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
        providers={jobProviderFilters}
        activeProvider={provider}
        onProviderChange={handleProviderChange}
        query={query}
        onQueryChange={handleQueryChange}
        summary={summary}
        errorMessage={error}
        location={location}
        onLocationChange={handleLocationChange}
        remoteOnly={remoteOnly}
        onRemoteToggle={handleRemoteToggle}
        salaryFloor={salaryFloor}
        onSalaryFloorChange={handleSalaryFloorChange}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onResetFilters={handleResetFilters}
        page={safePage}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      {isLoading && <p className="text-sm text-slate-500">Chargement des offres…</p>}
      {error && !isLoading && <p className="text-sm text-red-500">{error}</p>}
      {!isLoading && (
        <>
          <JobList jobs={paginatedJobs} />
          {jobs.length > pageSize && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={safePage === 1}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition disabled:opacity-40"
              >
                ← Précédent
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Page {safePage} / {pageCount}
              </p>
              <button
                type="button"
                onClick={goToNext}
                disabled={safePage === pageCount}
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
