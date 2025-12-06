"use client";

import { useCallback } from "react";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters, type JobProviderFilterOption } from "@/config/jobProviders";
import {
  JOB_SEARCH_PAGE_SIZE_OPTIONS,
  useJobSearch,
} from "@/hooks/useJobSearch";

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
    toggleRemoteOnly: toggleRemoteFilter,
    salaryFloor,
    setSalaryFloor,
    selectedTags,
    toggleTag: toggleTagFilter,
    resetFilters,
    page,
    pageCount,
    pageSize,
    setPage,
    setPageSize,
  } = useJobSearch({ initialCategory });

  const handleCategoryChange = useCallback(
    (nextCategory?: string) => {
      setCategory(nextCategory);
    },
    [setCategory]
  );

  const handleProviderChange = useCallback(
    (value?: JobProviderFilterOption["id"]) => {
      setProvider(value);
    },
    [setProvider]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocation(value);
    },
    [setLocation]
  );

  const handleRemoteToggle = useCallback(() => {
    toggleRemoteFilter();
  }, [toggleRemoteFilter]);

  const handleSalaryFloorChange = useCallback(
    (value: number | null) => {
      setSalaryFloor(value);
    },
    [setSalaryFloor]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      toggleTagFilter(tag);
    },
    [toggleTagFilter]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
    },
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
    },
    [setPageSize]
  );

  const goToPrevious = useCallback(() => setPage(page - 1), [page, setPage]);
  const goToNext = useCallback(() => setPage(page + 1), [page, setPage]);

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
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizeOptions={JOB_SEARCH_PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      {isLoading && <p className="text-sm text-slate-500">Chargement des offres…</p>}
      {error && !isLoading && <p className="text-sm text-red-500">{error}</p>}
      {!isLoading && (
        <>
          <JobList jobs={jobs} />
          {pageCount > 1 && (
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
