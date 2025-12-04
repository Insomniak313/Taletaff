import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Hero } from "@/components/sections/Hero";
import { IllustratedPitch } from "@/components/sections/IllustratedPitch";
import { InsightList } from "@/components/sections/InsightList";
import { SuccessStories } from "@/components/sections/SuccessStories";
import { InputField } from "@/components/ui/InputField";
import { CategoryCard } from "@/features/jobs/components/CategoryCard";
import { CategoryGrid } from "@/features/jobs/components/CategoryGrid";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobList } from "@/features/jobs/components/JobList";
import { jobCategories } from "@/config/jobCategories";
import type { JobProviderFilterOption } from "@/config/jobProviders";

const sampleJob = {
  id: "1",
  title: "Lead Designer",
  company: "Atlas",
  location: "Lyon",
  category: "product",
  description: "Définir la vision UX",
  remote: true,
  salaryMin: 65000,
  salaryMax: 85000,
  tags: ["Figma"],
  createdAt: new Date().toISOString(),
};

const providerOptions: JobProviderFilterOption[] = [
  { id: "apec", label: "APEC" },
  { id: "indeed-fr", label: "Indeed France" },
];

describe("UI components", () => {
  it("affiche le header et les CTA", () => {
    render(<AppHeader />);
    expect(screen.getByText("Taletaff")).toBeInTheDocument();
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
    expect(screen.getByText("Créer un compte")).toBeInTheDocument();
  });

  it("affiche le hero et les insights", () => {
    render(
      <div>
        <Hero />
        <InsightList />
      </div>
    );
    expect(screen.getByText(/champ à la scale-up/i)).toBeInTheDocument();
    expect(screen.getAllByText(/vérifié/i).length).toBeGreaterThan(0);
  });

  it("affiche la grille de catégories", () => {
    const { unmount } = render(<CategoryGrid categories={jobCategories} />);
    expect(screen.getByText(jobCategories[0].title)).toBeInTheDocument();
    unmount();
    render(<CategoryCard category={jobCategories[0]} isActive />);
    const card = screen.getByText(jobCategories[0].title).closest("article");
    expect(card?.className).toContain("bg-brand-50");
  });

  it("affiche un job card complet", () => {
    const { rerender } = render(<JobCard job={sampleJob} />);
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
    expect(screen.getByText(/Remote friendly/i)).toBeInTheDocument();
    rerender(<JobCard job={{ ...sampleJob, id: "2", remote: false }} />);
    expect(screen.getByText(/Sur site/)).toBeInTheDocument();
    rerender(
      <JobCard
        job={{
          ...sampleJob,
          id: "3",
          description:
            "<ul><li>Mission &amp; vision</li><li>Impact &#169;</li></ul><script>alert('boom')</script><style>.x{}</style><p>Remote &#x26; hybrid<br/>Team</p><p></p>",
        }}
      />
    );
    expect(screen.getByText(/Mission & vision/)).toBeInTheDocument();
    expect(screen.getByText(/Impact ©/)).toBeInTheDocument();
    expect(screen.getByText(/Remote & hybrid/)).toBeInTheDocument();
    expect(screen.queryByText(/boom/)).toBeNull();
    rerender(<JobCard job={{ ...sampleJob, id: "4", description: "" }} />);
    expect(
      screen.getByText(/Description en cours de rédaction/i)
    ).toBeInTheDocument();
    const longDescription = `<ul>${Array.from({ length: 10 }, (_, index) => `<li>Item ${index + 1}</li>`).join("")}</ul>`;
    rerender(<JobCard job={{ ...sampleJob, id: "5", description: longDescription }} />);
    expect(screen.getByText(/Item 1/)).toBeInTheDocument();
    expect(screen.getByText(/Item 8/)).toBeInTheDocument();
    expect(screen.queryByText(/Item 9/)).toBeNull();
    rerender(
      <JobCard
        job={{
          ...sampleJob,
          id: "6",
          description: "Check &#xGG; &unknown;",
        }}
      />
    );
    const sanitizedLine = screen.getByText(/Check/).textContent ?? "";
    expect(sanitizedLine).toMatch(/&#xGG;.*&unknown;/);
  });

  it("affiche la liste des jobs", () => {
    render(<JobList jobs={[sampleJob]} />);
    expect(screen.getByText(sampleJob.title)).toBeInTheDocument();
  });

  it("gère les interactions des filtres", () => {
    const onCategoryChange = vi.fn();
    const onQueryChange = vi.fn();
    const onLocationChange = vi.fn();
    const onRemoteToggle = vi.fn();
    const onSalaryFloorChange = vi.fn();
    const onTagToggle = vi.fn();
    const onResetFilters = vi.fn();
    const onProviderChange = vi.fn();
    const summary = {
      count: 2,
      remoteShare: 0.5,
      salaryRange: { min: 50000, max: 70000 },
      topLocations: [{ label: "Paris", count: 1 }],
      topTags: [{ label: "TypeScript", count: 1 }],
    };
    type JobFiltersPropsType = ComponentProps<typeof JobFilters>;
    let currentProps: JobFiltersPropsType = {
      categories: jobCategories,
      activeCategory: jobCategories[0].slug,
      onCategoryChange,
      providers: providerOptions,
      activeProvider: undefined,
      onProviderChange,
      query: "",
      onQueryChange,
      summary,
      location: "",
      onLocationChange,
      remoteOnly: false,
      onRemoteToggle,
      salaryFloor: null,
      onSalaryFloorChange,
      selectedTags: [],
      onTagToggle,
      onResetFilters,
    };
    const { rerender } = render(<JobFilters {...currentProps} />);
    const rerenderWith = (overrides: Partial<JobFiltersPropsType> = {}) => {
      currentProps = { ...currentProps, ...overrides };
      rerender(<JobFilters {...currentProps} />);
    };
    const searchInput = screen.getByPlaceholderText(/Poste, stack/i);
    fireEvent.change(searchInput, {
      target: { value: "staff" },
    });
    rerenderWith({ query: "staff" });
    fireEvent.click(screen.getByText(/Effacer/));
    expect(onQueryChange).toHaveBeenLastCalledWith("");
    fireEvent.click(screen.getByText(jobCategories[1].title));
    rerenderWith({ activeCategory: jobCategories[1].slug });
    fireEvent.click(screen.getByText(jobCategories[1].title));
    fireEvent.change(screen.getByLabelText(/Localisation ciblée/i), {
      target: { value: "Paris" },
    });
    rerenderWith({ location: "Paris" });
    const remoteFriendlyElements = screen.getAllByText(/Remote friendly/i);
    fireEvent.click(remoteFriendlyElements[0]);
    rerenderWith({ remoteOnly: true });
    fireEvent.change(screen.getByLabelText(/Salaire minimum/i), {
      target: { value: "60000" },
    });
    rerenderWith({ salaryFloor: 60000 });
    fireEvent.click(screen.getByText("TypeScript"));
    rerenderWith({ selectedTags: ["TypeScript"] });
    fireEvent.change(screen.getByLabelText(/Source partenaire/i), {
      target: { value: providerOptions[1].id },
    });
    expect(onProviderChange).toHaveBeenLastCalledWith(providerOptions[1].id);
    rerenderWith({ activeProvider: providerOptions[1].id });
    fireEvent.click(screen.getByText(/Toutes les offres/i));
    rerenderWith({ activeCategory: undefined });
    fireEvent.change(screen.getByLabelText(/Source partenaire/i), {
      target: { value: "" },
    });
    expect(onProviderChange).toHaveBeenLastCalledWith(undefined);
    rerenderWith({ activeProvider: undefined });
    expect(onCategoryChange).toHaveBeenCalled();
    expect(onCategoryChange).toHaveBeenLastCalledWith(undefined);
    expect(onLocationChange).toHaveBeenCalledWith("Paris");
    expect(onRemoteToggle).toHaveBeenCalled();
    expect(onSalaryFloorChange).toHaveBeenCalledWith(60000);
    expect(onTagToggle).toHaveBeenCalledWith("TypeScript");
    rerenderWith({
      activeCategory: jobCategories[0].slug,
      query: "staff",
    });
    fireEvent.click(screen.getByText(/Réinitialiser/));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
    rerenderWith({
      query: "",
      location: "",
      remoteOnly: false,
      salaryFloor: null,
      selectedTags: [],
      summary: { ...summary, count: 0 },
      errorMessage: "Erreur lors du chargement",
    });
    expect(screen.getByText(/Erreur lors du chargement/i)).toBeInTheDocument();
  });

  it("ajoute les localisations et tags manquants aux suggestions", () => {
    const noop = vi.fn();
    const onSalaryFloorChange = vi.fn();
    render(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={noop}
        providers={providerOptions}
        activeProvider={providerOptions[0].id}
        onProviderChange={noop}
        query="nantes"
        onQueryChange={noop}
        summary={{
          count: 0,
          remoteShare: 0,
          salaryRange: { min: 0, max: 0 },
          topLocations: [],
          topTags: [],
        }}
        errorMessage={null}
        location="Nantes"
        onLocationChange={noop}
        remoteOnly={false}
        onRemoteToggle={noop}
        salaryFloor={null}
        onSalaryFloorChange={onSalaryFloorChange}
        selectedTags={["Go"]}
        onTagToggle={noop}
        onResetFilters={noop}
      />
    );
    expect(screen.getByDisplayValue("Nantes")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText(/Effacer/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Salaire minimum/i), {
      target: { value: "" },
    });
    expect(onSalaryFloorChange).toHaveBeenCalledWith(null);
  });

  it("affiche les témoignages", () => {
    render(<SuccessStories />);
    expect(screen.getByText(/Head of Product/i)).toBeInTheDocument();
  });

  it("met en scène l'illustrated pitch", () => {
    render(<IllustratedPitch />);
    expect(screen.getByText(/Des rituels visuels/i)).toBeInTheDocument();
    expect(screen.getByText("Coaching onboarding")).toBeInTheDocument();
    expect(screen.getByText("Playbooks secteur")).toBeInTheDocument();
    expect(screen.getByText("Suivi mesure")).toBeInTheDocument();
    expect(screen.getByText(/illustrations Popsy/i)).toBeInTheDocument();
    const highlightItems = screen.getAllByRole("listitem");
    expect(highlightItems.length).toBeGreaterThanOrEqual(3);
  });

  it("affiche les états d'un InputField", () => {
    const { rerender } = render(
      <InputField
        label="Nom"
        value="Alex"
        onChange={() => {}}
        helperText="Infos"
        icon={<span data-testid="icon">*</span>}
      />
    );
    expect(screen.getByText("Infos")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    rerender(
      <InputField
        label="Nom"
        value="Alex"
        onChange={() => {}}
        error="Obligatoire"
        helperText="Infos"
      />
    );
    expect(screen.getByText("Obligatoire")).toBeInTheDocument();
  });

  it("affiche le footer", () => {
    render(<AppFooter />);
    expect(screen.getByText(/©/i)).toBeInTheDocument();
  });
});
