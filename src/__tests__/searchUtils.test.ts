import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildJobSearchSummary,
  buildQueryTokens,
  scoreByRelevance,
} from "@/features/jobs/search/searchUtils";
import type { JobRecord } from "@/types/job";

const sampleJobs: JobRecord[] = [
  {
    id: "1",
    title: "Product Manager",
    company: "Nova",
    location: "Paris",
    category: "product",
    description: "Chef de produit remote pour scale-up",
    remote: true,
    salaryMin: 70000,
    salaryMax: 95000,
    tags: ["Product", "Remote"],
    createdAt: "2025-01-20T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Chef de salle",
    company: "Maison Alba",
    location: "Lyon",
    category: "restauration",
    description: "Hospitalité premium en salle",
    remote: false,
    salaryMin: 32000,
    salaryMax: 38000,
    tags: ["Hospitalité"],
    createdAt: "2024-08-15T00:00:00.000Z",
  },
];

describe("searchUtils", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2025-02-01T00:00:00.000Z").valueOf()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extrait les tokens uniques et leurs synonymes", () => {
    expect(buildQueryTokens("PM remote, data")).toEqual(
      expect.arrayContaining(["pm", "product manager", "remote", "full remote", "data"])
    );
    expect(buildQueryTokens("")).toEqual([]);
  });

  it("classe les offres par pertinence lorsqu'on fournit des tokens", () => {
    const tokens = buildQueryTokens("product remote paris");
    const ordered = scoreByRelevance(sampleJobs, tokens);
    expect(ordered[0].id).toBe("1");
  });

  it("préserve l'ordre initial quand aucun token n'est fourni", () => {
    const ordered = scoreByRelevance(sampleJobs, []);
    expect(ordered.map((job) => job.id)).toEqual(["1", "2"]);
  });

  it("préserve l'ordre d'origine lorsque les scores sont identiques", () => {
    const baseJob: JobRecord = {
      id: "A",
      title: "Analyste",
      company: "DataCorp",
      location: "Paris",
      category: "product",
      description: "Analyse de données",
      remote: false,
      salaryMin: 50000,
      salaryMax: 50000,
      tags: ["Data"],
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    const duplicates: JobRecord[] = [
      baseJob,
      { ...baseJob, id: "B" },
    ];
    const ordered = scoreByRelevance(duplicates, buildQueryTokens("Analyste"));
    expect(ordered.map((job) => job.id)).toEqual(["A", "B"]);
  });

  it("agrège les statistiques de recherche", () => {
    const summary = buildJobSearchSummary(sampleJobs);
    expect(summary.count).toBe(2);
    expect(summary.remoteShare).toBeCloseTo(0.5);
    expect(summary.salaryRange).toEqual({ min: 32000, max: 95000 });
    expect(summary.topLocations[0]).toEqual({ label: "Paris", count: 1 });
    expect(summary.topTags.map((tag) => tag.label)).toContain("Product");
  });

  it("ignore les tags vides lorsqu'il calcule les tendances", () => {
    const summary = buildJobSearchSummary([
      ...sampleJobs,
      { ...sampleJobs[0], id: "3", tags: ["", "  "] },
    ]);
    expect(summary.topTags.some((tag) => tag.label === "")).toBe(false);
  });

  it("valorise les correspondances sur l'entreprise", () => {
    const ordered = scoreByRelevance(sampleJobs, buildQueryTokens("Nova"));
    expect(ordered[0].company).toBe("Nova");
  });

  it("donne un avantage aux offres très récentes", () => {
    const futureJob = { ...sampleJobs[0], id: "future", createdAt: "2025-03-01T00:00:00.000Z" };
    const ordered = scoreByRelevance([sampleJobs[1], futureJob], buildQueryTokens("product"));
    expect(ordered[0].id).toBe("future");
  });

  it("ignore le bonus salaire lorsque la fourchette est vide", () => {
    const lowSalaryJob = { ...sampleJobs[0], id: "low", salaryMin: 0, salaryMax: 0 };
    const ordered = scoreByRelevance([sampleJobs[0], lowSalaryJob], buildQueryTokens("product"));
    expect(ordered.at(-1)?.id).toBe("low");
  });

  it("applique le bonus maximum aux salaires à six chiffres", () => {
    const richJob = { ...sampleJobs[0], id: "rich", salaryMin: 120000, salaryMax: 130000 };
    const ordered = scoreByRelevance([sampleJobs[1], richJob], buildQueryTokens("product"));
    expect(ordered[0].id).toBe("rich");
  });

  it("retourne un résumé vide lorsqu'il n'y a aucune offre", () => {
    expect(buildJobSearchSummary([])).toEqual({
      count: 0,
      remoteShare: 0,
      salaryRange: { min: 0, max: 0 },
      topLocations: [],
      topTags: [],
    });
  });
});
