import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";

const setCategory = vi.fn();
const setProvider = vi.fn();
const setQuery = vi.fn();
const setLocation = vi.fn();
const toggleRemoteOnly = vi.fn();
const setSalaryFloor = vi.fn();
const toggleTag = vi.fn();
const resetFilters = vi.fn();
const fetchJobs = vi.fn();

const buildJob = (index: number) => ({
  id: `${index}`,
  title: `Rôle ${index}`,
  company: "Taletaff",
  location: "Paris",
  category: "engineering",
  description: "Description",
  remote: true,
  salaryMin: 40000,
  salaryMax: 60000,
  tags: ["TypeScript"],
  createdAt: new Date().toISOString(),
});

const state = {
  category: "product",
  provider: undefined as string | undefined,
  query: "",
  jobs: [] as ReturnType<typeof buildJob>[],
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
    setProvider,
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

  it("gère la pagination sans effets", async () => {
    const user = userEvent.setup();
    state.jobs = Array.from({ length: 8 }, (_, index) => buildJob(index + 1));
    const { rerender } = render(<JobSearchSection />);

    expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Suivant/i }));
    expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();

    state.jobs = Array.from({ length: 3 }, (_, index) => buildJob(index + 1));
    rerender(<JobSearchSection />);
    expect(screen.queryByText(/Page 1 \/ 1/i)).not.toBeInTheDocument();
  });
});
