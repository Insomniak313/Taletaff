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
    render(<JobCard job={sampleJob} />);
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
    expect(screen.getByText(/Remote friendly/i)).toBeInTheDocument();
    render(<JobCard job={{ ...sampleJob, id: "2", remote: false }} />);
    expect(screen.getByText(/Sur site/)).toBeInTheDocument();
  });

  it("affiche la liste des jobs", () => {
    render(<JobList jobs={[sampleJob]} />);
    expect(screen.getByText(sampleJob.title)).toBeInTheDocument();
  });

  it("gère les interactions des filtres", () => {
    const onCategoryChange = vi.fn();
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        query=""
        onQueryChange={onQueryChange}
        summary={{ count: 2, hasError: false }}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/Rechercher/), {
      target: { value: "staff" },
    });
    fireEvent.click(screen.getByText(jobCategories[1].title));
    expect(onCategoryChange).toHaveBeenCalled();
    rerender(
      <JobFilters
        categories={jobCategories}
        activeCategory={jobCategories[0].slug}
        onCategoryChange={onCategoryChange}
        query=""
        onQueryChange={onQueryChange}
        summary={{ count: 0, hasError: true }}
      />
    );
    expect(screen.getByText(/Erreur/i)).toBeInTheDocument();
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
