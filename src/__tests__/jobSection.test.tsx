import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

const setCategory = vi.fn();
const setQuery = vi.fn();
const fetchJobs = vi.fn();

const state = {
  category: "product",
  query: "",
  jobs: [],
  isLoading: false,
  error: null as string | null,
  summary: { count: 0, hasError: false },
};

vi.mock("@/hooks/useJobSearch", () => ({
  useJobSearch: () => ({
    ...state,
    setCategory,
    setQuery,
    fetchJobs,
  }),
}));

describe("JobSearchSection", () => {
  beforeEach(() => {
    state.jobs = [];
    state.isLoading = false;
    state.error = null;
    state.summary = { count: 0, hasError: false };
  });

  it("rend les filtres et la liste vide", () => {
    render(<JobSearchSection />);
    expect(screen.getByPlaceholderText(/Rechercher par titre/i)).toBeInTheDocument();
    expect(screen.getByText(/Aucune offre/i)).toBeInTheDocument();
  });

  it("affiche les états de chargement et d'erreur", () => {
    state.isLoading = true;
    render(<JobSearchSection />);
    expect(screen.getByText(/Chargement des offres/i)).toBeInTheDocument();

    state.isLoading = false;
    state.error = "Boom";
    render(<JobSearchSection />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });
});
