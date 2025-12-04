import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

const setCategory = vi.fn();
const setQuery = vi.fn();
const setLocation = vi.fn();
const toggleRemoteOnly = vi.fn();
const setSalaryFloor = vi.fn();
const toggleTag = vi.fn();
const resetFilters = vi.fn();
const fetchJobs = vi.fn();

const state = {
  category: "product",
  query: "",
  jobs: [],
  isLoading: false,
  error: null as string | null,
  summary: {
    count: 0,
    remoteShare: 0,
    salaryRange: { min: 0, max: 0 },
    topLocations: [],
    topTags: [],
  },
  location: "",
  remoteOnly: false,
  salaryFloor: null as number | null,
  selectedTags: [] as string[],
};

vi.mock("@/hooks/useJobSearch", () => ({
  useJobSearch: () => ({
    ...state,
    setCategory,
    setQuery,
    setLocation,
    toggleRemoteOnly,
    setSalaryFloor,
    toggleTag,
    resetFilters,
    fetchJobs,
  }),
}));

describe("JobSearchSection", () => {
  beforeEach(() => {
    state.jobs = [];
    state.isLoading = false;
    state.error = null;
    state.summary = {
      count: 0,
      remoteShare: 0,
      salaryRange: { min: 0, max: 0 },
      topLocations: [],
      topTags: [],
    };
    state.location = "";
    state.remoteOnly = false;
    state.salaryFloor = null;
    state.selectedTags = [];
  });

  it("rend les filtres et la liste vide", () => {
    render(<JobSearchSection />);
    expect(screen.getByPlaceholderText(/Poste, stack/i)).toBeInTheDocument();
    expect(screen.getByText(/Aucune offre/i)).toBeInTheDocument();
  });

  it("affiche les états de chargement et d'erreur", () => {
    state.isLoading = true;
    render(<JobSearchSection />);
    expect(screen.getByText(/Chargement des offres/i)).toBeInTheDocument();

    state.isLoading = false;
    state.error = "Boom";
    render(<JobSearchSection />);
    expect(screen.getAllByText("Boom").length).toBeGreaterThan(0);
  });
});
