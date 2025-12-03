import { describe, expect, it } from "vitest";
import { jobCategories, jobCategoryMap, defaultJobCategory } from "@/config/jobCategories";

describe("configuration des catégories", () => {
  it("expose un mapping par slug", () => {
    expect(jobCategoryMap[jobCategories[0].slug]).toBeDefined();
  });

  it("définit une catégorie par défaut", () => {
    expect(defaultJobCategory.slug).toBe(jobCategories[0].slug);
  });
});
