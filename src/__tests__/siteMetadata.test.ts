import { describe, expect, it } from "vitest";
import { absoluteUrl, siteMetadata } from "@/config/siteMetadata";

describe("siteMetadata", () => {
  it("fournit un titre et une description", () => {
    expect(siteMetadata.title).toContain("Taletaff");
    expect(siteMetadata.description.length).toBeGreaterThan(10);
  });

  it("expose une liste de mots-clés SEO", () => {
    expect(Array.isArray(siteMetadata.keywords)).toBe(true);
    expect(siteMetadata.keywords.length).toBeGreaterThanOrEqual(5);
  });

  it("génère des URLs absolues cohérentes", () => {
    const jobsUrl = absoluteUrl("/jobs");
    expect(jobsUrl).toContain(siteMetadata.siteUrl);
    expect(jobsUrl.endsWith("/jobs")).toBe(true);
  });

  it("préserve le slash final pour la page d'accueil", () => {
    const homeUrl = absoluteUrl("/");
    expect(homeUrl).toBe(`${siteMetadata.siteUrl}/`);
  });

  it("ajoute un slash initial si le chemin ne commence pas par /", () => {
    const nestedUrl = absoluteUrl("jobs/product");
    expect(nestedUrl).toContain("/jobs/product");
  });
});
