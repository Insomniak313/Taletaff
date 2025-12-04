"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import { jobProviderFilters, type JobProviderFilterOption } from "@/config/jobProviders";
import { useJobSearch } from "@/hooks/useJobSearch";

interface JobSearchSectionProps {
  initialCategory?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 40];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

export const JobSearchSection = ({ initialCategory }: JobSearchSectionProps = {}) => {
  const [page, setPage] = useState(1);
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

  const pageCount = Math.max(1, Math.ceil((jobs.length || 0) / pageSize) || 1);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
  }, [jobs]);

  const paginatedJobs = useMemo(() => {
    if (!jobs.length) {
      return [];
    }
    const safePage = Math.min(page, pageCount);
    const startIndex = (safePage - 1) * pageSize;
    return jobs.slice(startIndex, startIndex + pageSize);
  }, [jobs, page, pageCount, pageSize]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, pageCount)));
    },
    [pageCount]
  );

  const handlePageSizeChange = useCallback((nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback(
    (value?: string) => {
      setPage(1);
      setCategory(value);
    },
    [setCategory]
  );

  const handleProviderChange = useCallback(
    (value?: JobProviderFilterOption["id"]) => {
      setPage(1);
      setProvider(value);
    },
    [setProvider]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setPage(1);
      setQuery(value);
    },
    [setQuery]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setPage(1);
      setLocation(value);
    },
    [setLocation]
  );

  const handleRemoteToggle = useCallback(() => {
    setPage(1);
    toggleRemoteFilter();
  }, [toggleRemoteFilter]);

  const handleSalaryFloorChange = useCallback(
    (value: number | null) => {
      setPage(1);
      setSalaryFloor(value);
    },
    [setSalaryFloor]
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      setPage(1);
      toggleTagFilter(tag);
    },
    [toggleTagFilter]
  );

  const handleResetFilters = useCallback(() => {
    setPage(1);
    resetFilters();
  }, [resetFilters]);

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
      {isLoading && (
        <p className="text-sm text-slate-500">Chargement des offres…</p>
      )}
      {error && !isLoading && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {!isLoading && <JobList jobs={paginatedJobs} />}
    </section>
  );
};
