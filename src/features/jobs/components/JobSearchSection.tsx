"use client";

import { useCallback, useMemo, useState } from "react";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters, type JobProviderFilterOption } from "@/config/jobProviders";
import { useJobSearch } from "@/hooks/useJobSearch";
import type { JobRecord } from "@/types/job";

const computeJobsSignature = (jobs: ReadonlyArray<JobRecord>) =>
  jobs.map((job) => job.id).join("|");

interface JobSearchSectionProps {
  initialCategory?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 40];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

export const JobSearchSection = ({ initialCategory }: JobSearchSectionProps = {}) => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
  const [pageState, setPageState] = useState({ page: 1, signature });

  const pageCount = useMemo(
    () => Math.max(Math.ceil(jobs.length / pageSize), 1),
    [jobs.length, pageSize]
  );

  const requestedPage = pageState.signature === signature ? pageState.page : 1;
  const page = Math.min(Math.max(requestedPage, 1), pageCount);

  const paginatedJobs = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return jobs.slice(startIndex, startIndex + pageSize);
  }, [jobs, page, pageSize]);

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

  const handleCategoryChange = useCallback(
    (nextCategory?: string) => {
      setCategory(nextCategory);
      updatePage(1);
    },
    [setCategory, updatePage]
  );

  const handleProviderChange = useCallback(
    (value?: JobProviderFilterOption["id"]) => {
      setProvider(value);
      updatePage(1);
    },
    [setProvider, updatePage]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      updatePage(1);
    },
    [setQuery, updatePage]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocation(value);
      updatePage(1);
    },
    [setLocation, updatePage]
  );

  const handleRemoteToggle = useCallback(() => {
    toggleRemoteFilter();
    updatePage(1);
  }, [toggleRemoteFilter, updatePage]);

  const handleSalaryFloorChange = useCallback(
    (value: number | null) => {
      setSalaryFloor(value);
      updatePage(1);
    },
    [setSalaryFloor, updatePage]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      toggleTagFilter(tag);
      updatePage(1);
    },
    [toggleTagFilter, updatePage]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
    setPageSize(DEFAULT_PAGE_SIZE);
    updatePage(1);
  }, [resetFilters, updatePage]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      updatePage(nextPage);
    },
    [updatePage]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      updatePage(1);
    },
    [updatePage]
  );

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
