import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobRecord, JobSearchSummary } from "@/types/job";

export const JOB_SEARCH_PAGE_SIZE_OPTIONS = [10, 20, 40] as const;
export const JOB_SEARCH_DEFAULT_PAGE_SIZE = JOB_SEARCH_PAGE_SIZE_OPTIONS[0];
const JOB_SEARCH_MAX_PAGE_SIZE = Math.max(...JOB_SEARCH_PAGE_SIZE_OPTIONS);

const sanitizePage = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  return Math.floor(value);
};

const sanitizePageSize = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return JOB_SEARCH_DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(value), JOB_SEARCH_MAX_PAGE_SIZE);
};

interface UseJobSearchOptions {
  initialCategory?: string;
}

interface JobSearchPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
}

interface JobSearchState {
  jobs: JobRecord[];
  summary: JobSearchSummary;
  isLoading: boolean;
  error: string | null;
  pagination: JobSearchPagination;
}

interface ClientFilters {
  category?: string;
  provider?: JobRecord["source"];
  query: string;
  location: string;
  remoteOnly: boolean;
  salaryFloor: number | null;
  selectedTags: string[];
  page: number;
  pageSize: number;
}

const INITIAL_SUMMARY: JobSearchSummary = {
  count: 0,
  remoteShare: 0,
  salaryRange: { min: 0, max: 0 },
  topLocations: [],
  topTags: [],
};

const computePageCount = (total: number, pageSize: number) => {
  const safeTotal = Math.max(total, 0);
  const safePageSize = Math.max(pageSize, 1);
  return Math.max(Math.ceil(safeTotal / safePageSize), 1);
};

const INITIAL_PAGINATION: JobSearchPagination = {
  page: 1,
  pageSize: JOB_SEARCH_DEFAULT_PAGE_SIZE,
  pageCount: 1,
  totalCount: 0,
};

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const useJobSearch = ({ initialCategory }: UseJobSearchOptions) => {
  const [filters, setFilters] = useState<ClientFilters>({
    category: initialCategory,
    provider: undefined,
    query: "",
    location: "",
    remoteOnly: false,
    salaryFloor: null,
    selectedTags: [],
    page: 1,
    pageSize: JOB_SEARCH_DEFAULT_PAGE_SIZE,
  });
  const debouncedQuery = useDebouncedValue(filters.query, 350);
  const effectiveFilters = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [filters, debouncedQuery]
  );

  const [{ jobs, summary, isLoading, error, pagination }, setState] = useState<JobSearchState>({
    jobs: [],
    summary: INITIAL_SUMMARY,
    isLoading: false,
    error: null,
    pagination: INITIAL_PAGINATION,
  });
  const controllerRef = useRef<AbortController>(new AbortController());

  const runSearch = useCallback(async (nextFilters: ClientFilters) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const params = new URLSearchParams();
      const safePage = sanitizePage(nextFilters.page);
      const safePageSize = sanitizePageSize(nextFilters.pageSize);

      params.set("page", String(safePage));
      params.set("pageSize", String(safePageSize));

      if (nextFilters.category) params.set("category", nextFilters.category);
      if (nextFilters.provider) params.set("provider", nextFilters.provider);
      if (nextFilters.query) params.set("query", nextFilters.query);
      if (nextFilters.location) params.set("location", nextFilters.location);
      if (nextFilters.remoteOnly) params.set("remote", "true");
      if (nextFilters.salaryFloor !== null)
        params.set("minSalary", String(nextFilters.salaryFloor));
      if (nextFilters.selectedTags.length) {
        params.set("tags", nextFilters.selectedTags.join(","));
      }

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de charger les offres.");
      }

      const jobsPayload = (data.jobs as JobRecord[]) ?? [];
      const summaryPayload = (data.summary as JobSearchSummary) ?? INITIAL_SUMMARY;
      const paginationPayload = data.pagination as Partial<JobSearchPagination> | undefined;

      const totalCount =
        paginationPayload?.totalCount ??
        summaryPayload.count ??
        jobsPayload.length;
      const pageSize = paginationPayload?.pageSize ?? safePageSize;
      const pageCount = paginationPayload?.pageCount ?? computePageCount(totalCount, pageSize);
      const page = Math.min(paginationPayload?.page ?? safePage, pageCount);

      const resolvedSummary =
        summaryPayload.count === totalCount
          ? summaryPayload
          : { ...summaryPayload, count: totalCount };

      setState({
        jobs: jobsPayload,
        summary: resolvedSummary,
        isLoading: false,
        error: null,
        pagination: {
          page,
          pageSize,
          pageCount,
          totalCount,
        },
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      setState({
        jobs: [],
        summary: INITIAL_SUMMARY,
        isLoading: false,
        error:
          err instanceof Error ? err.message : "Une erreur inattendue est survenue.",
        pagination: INITIAL_PAGINATION,
      });
    }
  }, []);

  useEffect(() => {
    runSearch(effectiveFilters);
    return () => controllerRef.current.abort();
  }, [effectiveFilters, runSearch]);

  const setCategory = useCallback((value?: string) => {
    setFilters((prev) => ({ ...prev, category: value, page: 1 }));
  }, []);

  const setProvider = useCallback((value?: JobRecord["source"]) => {
    setFilters((prev) => ({ ...prev, provider: value, page: 1 }));
  }, []);

  const setQuery = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, query: value, page: 1 }));
  }, []);

  const setLocation = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, location: value, page: 1 }));
  }, []);

  const toggleRemoteOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly, page: 1 }));
  }, []);

  const setSalaryFloor = useCallback((value: number | null) => {
    setFilters((prev) => ({ ...prev, salaryFloor: value, page: 1 }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedTags.includes(tag);
      const nextTags = exists
        ? prev.selectedTags.filter((current) => current !== tag)
        : [...prev.selectedTags, tag];
      return { ...prev, selectedTags: nextTags, page: 1 };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      query: "",
      location: "",
      remoteOnly: false,
      salaryFloor: null,
      selectedTags: [],
      provider: undefined,
      page: 1,
      pageSize: JOB_SEARCH_DEFAULT_PAGE_SIZE,
    }));
  }, []);

  const setPage = useCallback((value: number) => {
    const nextPage = sanitizePage(value);
    setFilters((prev) => (prev.page === nextPage ? prev : { ...prev, page: nextPage }));
  }, []);

  const setPageSize = useCallback((value: number) => {
    const nextSize = sanitizePageSize(value);
    setFilters((prev) => {
      if (prev.pageSize === nextSize && prev.page === 1) {
        return prev;
      }
      return { ...prev, pageSize: nextSize, page: 1 };
    });
  }, []);

  const fetchJobs = useCallback(
    (override?: Partial<ClientFilters>) =>
      runSearch({ ...effectiveFilters, ...override }),
    [effectiveFilters, runSearch]
  );

  return {
    category: filters.category,
    setCategory,
    provider: filters.provider,
    setProvider,
    query: filters.query,
    setQuery,
    location: filters.location,
    setLocation,
    remoteOnly: filters.remoteOnly,
    toggleRemoteOnly,
    salaryFloor: filters.salaryFloor,
    setSalaryFloor,
    selectedTags: filters.selectedTags,
    toggleTag,
    resetFilters,
    jobs,
    summary,
    isLoading,
    error,
    page: pagination.page,
    pageCount: pagination.pageCount,
    pageSize: pagination.pageSize,
    totalCount: pagination.totalCount,
    setPage,
    setPageSize,
    fetchJobs,
  };
};
