import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobRecord } from "@/types/job";

interface UseJobSearchOptions {
  initialCategory?: string;
}

interface JobSearchState {
  jobs: JobRecord[];
  isLoading: boolean;
  error: string | null;
}

export const useJobSearch = ({ initialCategory }: UseJobSearchOptions) => {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [{ jobs, isLoading, error }, setState] = useState<JobSearchState>({
    jobs: [],
    isLoading: false,
    error: null,
  });
  const controllerRef = useRef<AbortController>(new AbortController());

  const fetchJobs = useCallback(
    async (searchParams?: { category?: string; query?: string }) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const params = new URLSearchParams();
        const selectedCategory = searchParams?.category ?? category;
        const searchQuery = searchParams?.query ?? query;

        if (selectedCategory) params.set("category", selectedCategory);
        if (searchQuery) params.set("query", searchQuery);

        const response = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Impossible de charger les offres.");
        }

        setState({ jobs: data.jobs, isLoading: false, error: null });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
        setState({
          jobs: [],
          isLoading: false,
          error:
            err instanceof Error ? err.message : "Une erreur inattendue est survenue.",
        });
      }
    },
    [category, query]
  );

  useEffect(() => {
    fetchJobs();
    return () => controllerRef.current.abort();
  }, [fetchJobs]);

  const summary = useMemo(
    () => ({ count: jobs.length, hasError: Boolean(error) }),
    [jobs.length, error]
  );

  return {
    category,
    setCategory,
    query,
    setQuery,
    jobs,
    isLoading,
    error,
    summary,
    fetchJobs,
  };
};
