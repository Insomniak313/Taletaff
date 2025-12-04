import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobRecord, JobSearchSummary } from "@/types/job";

interface UseJobSearchOptions {
  initialCategory?: string;
}

interface JobSearchState {
  jobs: JobRecord[];
  summary: JobSearchSummary;
  isLoading: boolean;
  error: string | null;
}

interface ClientFilters {
  category?: string;
  provider?: JobRecord["source"];
  query: string;
  location: string;
  remoteOnly: boolean;
  salaryFloor: number | null;
  selectedTags: string[];
}

const INITIAL_SUMMARY: JobSearchSummary = {
  count: 0,
  remoteShare: 0,
  salaryRange: { min: 0, max: 0 },
  topLocations: [],
  topTags: [],
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
  });
  const debouncedQuery = useDebouncedValue(filters.query, 350);
  const effectiveFilters = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [filters, debouncedQuery]
  );

  const [{ jobs, summary, isLoading, error }, setState] = useState<JobSearchState>({
    jobs: [],
    summary: INITIAL_SUMMARY,
    isLoading: false,
    error: null,
  });
  const controllerRef = useRef<AbortController>(new AbortController());

  const runSearch = useCallback(async (nextFilters: ClientFilters) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const params = new URLSearchParams();

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

      setState({
        jobs: data.jobs as JobRecord[],
        summary: (data.summary as JobSearchSummary) ?? INITIAL_SUMMARY,
        isLoading: false,
        error: null,
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
      });
    }
  }, []);

  useEffect(() => {
    runSearch(effectiveFilters);
    return () => controllerRef.current.abort();
  }, [effectiveFilters, runSearch]);

  const setCategory = useCallback((value?: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const setProvider = useCallback((value?: JobRecord["source"]) => {
    setFilters((prev) => ({ ...prev, provider: value }));
  }, []);

  const setQuery = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, query: value }));
  }, []);

  const setLocation = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, location: value }));
  }, []);

  const toggleRemoteOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }));
  }, []);

  const setSalaryFloor = useCallback((value: number | null) => {
    setFilters((prev) => ({ ...prev, salaryFloor: value }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedTags.includes(tag);
      const nextTags = exists
        ? prev.selectedTags.filter((current) => current !== tag)
        : [...prev.selectedTags, tag];
      return { ...prev, selectedTags: nextTags };
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
    }));
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
    fetchJobs,
  };
};
