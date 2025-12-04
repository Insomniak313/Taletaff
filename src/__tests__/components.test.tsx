import { fireEvent, render, screen } from "@testing-library/react";
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
    const { container, rerender } = render(<JobCard job={sampleJob} />);
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
    expect(screen.getByText(/Remote friendly/i)).toBeInTheDocument();
    rerender(<JobCard job={{ ...sampleJob, id: "2", remote: false }} />);
    expect(screen.getByText(/Sur site/)).toBeInTheDocument();
    rerender(
      <JobCard
        job={{
          ...sampleJob,
          id: "3",
          description: "<strong>Important</strong><script>alert('boom')</script>",
        }}
      />
    );
    expect(container.querySelector("strong")).not.toBeNull();
    expect(container.querySelector("script")).toBeNull();
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
    const { rerender } = render(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        providers={providerOptions}
        activeProvider={undefined}
        onProviderChange={onProviderChange}
        query=""
        onQueryChange={onQueryChange}
        summary={summary}
        location=""
        onLocationChange={onLocationChange}
        remoteOnly={false}
        onRemoteToggle={onRemoteToggle}
        salaryFloor={null}
        onSalaryFloorChange={onSalaryFloorChange}
        selectedTags={[]}
        onTagToggle={onTagToggle}
        onResetFilters={onResetFilters}
      />
    );
    const searchInput = screen.getByPlaceholderText(/Poste, stack/i);
    fireEvent.change(searchInput, {
      target: { value: "staff" },
    });
    rerender(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        providers={providerOptions}
        activeProvider={undefined}
        onProviderChange={onProviderChange}
        query="staff"
        onQueryChange={onQueryChange}
        summary={summary}
        location=""
        onLocationChange={onLocationChange}
        remoteOnly={false}
        onRemoteToggle={onRemoteToggle}
        salaryFloor={null}
        onSalaryFloorChange={onSalaryFloorChange}
        selectedTags={[]}
        onTagToggle={onTagToggle}
        onResetFilters={onResetFilters}
      />
    );
    fireEvent.click(screen.getByText(/Effacer/));
    expect(onQueryChange).toHaveBeenLastCalledWith("");
    fireEvent.click(screen.getByText(jobCategories[1].title));
    fireEvent.change(screen.getByLabelText(/Localisation ciblée/i), {
      target: { value: "Paris" },
    });
    const remoteFriendlyElements = screen.getAllByText(/Remote friendly/i);
    fireEvent.click(remoteFriendlyElements[0]);
    fireEvent.change(screen.getByLabelText(/Salaire minimum/i), {
      target: { value: "60000" },
    });
    fireEvent.click(screen.getByText("TypeScript"));
    fireEvent.change(screen.getByLabelText(/Source partenaire/i), {
      target: { value: providerOptions[1].id },
    });
    fireEvent.click(screen.getByText(/Toutes les offres/i));
    expect(onCategoryChange).toHaveBeenCalled();
    expect(onLocationChange).toHaveBeenCalledWith("Paris");
    expect(onRemoteToggle).toHaveBeenCalled();
    expect(onSalaryFloorChange).toHaveBeenCalledWith(60000);
    expect(onTagToggle).toHaveBeenCalledWith("TypeScript");
    expect(onProviderChange).toHaveBeenLastCalledWith(providerOptions[1].id);
    rerender(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        providers={providerOptions}
        activeProvider={providerOptions[1].id}
        onProviderChange={onProviderChange}
        query="staff"
        onQueryChange={onQueryChange}
        summary={summary}
        location="Paris"
        onLocationChange={onLocationChange}
        remoteOnly
        onRemoteToggle={onRemoteToggle}
        salaryFloor={60000}
        onSalaryFloorChange={onSalaryFloorChange}
        selectedTags={["TypeScript"]}
        onTagToggle={onTagToggle}
        onResetFilters={onResetFilters}
      />
    );
    fireEvent.click(screen.getByText(/Réinitialiser/));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
    rerender(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        providers={providerOptions}
        activeProvider={undefined}
        onProviderChange={onProviderChange}
        query=""
        onQueryChange={onQueryChange}
        summary={{ ...summary, count: 0 }}
        errorMessage="Erreur lors du chargement"
        location=""
        onLocationChange={onLocationChange}
        remoteOnly={false}
        onRemoteToggle={onRemoteToggle}
        salaryFloor={null}
        onSalaryFloorChange={onSalaryFloorChange}
        selectedTags={[]}
        onTagToggle={onTagToggle}
        onResetFilters={onResetFilters}
      />
    );
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
