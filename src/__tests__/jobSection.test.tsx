import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobSearchSection } from "@/features/jobs/components/JobSearchSection";
import { jobCategories } from "@/config/jobCategories";
import type { JobSearchSummary } from "@/types/job";

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

const buildSummary = (): JobSearchSummary => ({
  count: 0,
  remoteShare: 0,
  salaryRange: { min: 0, max: 0 },
  topLocations: [],
  topTags: [],
});

const state = {
  category: "product",
  provider: undefined as string | undefined,
  query: "",
  jobs: [] as ReturnType<typeof buildJob>[],
  isLoading: false,
  error: null as string | null,
  summary: buildSummary(),
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
    vi.clearAllMocks();
    state.jobs = [];
    state.isLoading = false;
    state.error = null;
    state.summary = buildSummary();
    state.location = "";
    state.remoteOnly = false;
    state.salaryFloor = null;
    state.selectedTags = [];
  });

  it("rend les filtres et la liste vide", () => {
    const { rerender } = render(<JobSearchSection />);
    expect(screen.getByPlaceholderText(/Poste, stack/i)).toBeInTheDocument();
    expect(
      screen.getByText("Aucune offre ne correspond à vos filtres pour le moment.")
    ).toBeInTheDocument();
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
    state.jobs = Array.from({ length: 12 }, (_, index) => buildJob(index + 1));
    const { rerender } = render(<JobSearchSection />);

    expect(screen.getAllByText(/Page 1 \/ 2/i).length).toBeGreaterThan(0);
    const [, listNextButton] = screen.getAllByRole("button", { name: /Suivant/i });
    await user.click(listNextButton);
    expect(screen.getAllByText(/Page 2 \/ 2/i).length).toBeGreaterThan(0);

    state.jobs = Array.from({ length: 3 }, (_, index) => buildJob(index + 1));
    rerender(<JobSearchSection />);
    expect(screen.getByText(/Page 1 \/ 1/i)).toBeInTheDocument();
  });

  it("propage tous les handlers de filtre", async () => {
    const user = userEvent.setup();
    state.summary = {
      count: 12,
      remoteShare: 0.5,
      salaryRange: { min: 40000, max: 80000 },
      topLocations: [{ label: "Paris", count: 6 }],
      topTags: [{ label: "TypeScript", count: 5 }],
    };
    state.jobs = Array.from({ length: 12 }, (_, index) => buildJob(index + 1));
    const { rerender } = render(<JobSearchSection />);

    await user.click(screen.getByText(jobCategories[1].title));
    expect(setCategory).toHaveBeenCalledWith(jobCategories[1].slug);

    const searchInput = screen.getByPlaceholderText(/Poste, stack/i);
    await user.type(searchInput, "staff");
    expect(setQuery).toHaveBeenCalledTimes("staff".length);

    await user.selectOptions(screen.getByLabelText(/Source partenaire/i), "apec");
    expect(setProvider).toHaveBeenCalledWith("apec");

    await user.selectOptions(screen.getByLabelText(/Localisation rapide/i), "Paris");
    expect(setLocation).toHaveBeenCalledWith("Paris");

    await user.click(screen.getByRole("button", { name: /Remote friendly/i }));
    expect(toggleRemoteOnly).toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/Salaire minimum/i), "60000");
    expect(setSalaryFloor).toHaveBeenCalledWith(60000);

    await user.click(screen.getByRole("button", { name: "TypeScript" }));
    expect(toggleTag).toHaveBeenCalledWith("TypeScript");

    const [filtersNextButton] = screen.getAllByRole("button", { name: /Suivant/i });
    await user.click(filtersNextButton);
    expect(screen.getAllByText(/Page 2 \/ 2/i).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText(/Par page/i), "20");
    expect(screen.getByLabelText(/Par page/i)).toHaveValue("20");

    state.query = "staff";
    state.location = "Paris";
    state.remoteOnly = true;
    state.salaryFloor = 60000;
    state.selectedTags = ["TypeScript"];
    state.provider = "apec";
    rerender(<JobSearchSection />);

    await user.click(screen.getByText(/Réinitialiser/));
    expect(resetFilters).toHaveBeenCalled();
    expect(screen.getByLabelText(/Par page/i)).toHaveValue("10");
  });
});
