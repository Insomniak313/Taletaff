import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResponse = { data: unknown[] | null; error: { message: string } | null };

const queryBuilder = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: (resolve: (value: QueryResponse) => void) => resolve({ data: [], error: null }),
};

const fromMock = vi.fn().mockReturnValue(queryBuilder);

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: () => ({ from: fromMock }),
}));

let mockData: QueryResponse = { data: [], error: null };

queryBuilder.then = (resolve) => resolve(mockData);

const { jobService } = await import("@/services/jobService");

describe("jobService", () => {
  beforeEach(() => {
    mockData = {
      data: [
        {
          id: "1",
          title: "PM",
          company: "Taletaff",
          location: "Remote",
          category: "product",
          description: "Desc",
          remote: true,
          salary_min: 60000,
          salary_max: 80000,
          tags: ["Product"],
          created_at: new Date().toISOString(),
        },
      ],
      error: null,
    };
    fromMock.mockClear();
    queryBuilder.eq.mockClear();
    queryBuilder.or.mockClear();
    queryBuilder.limit.mockClear();
  });

  it("retourne les offres formatées", async () => {
    const jobs = await jobService.searchJobs();
    expect(jobs[0]).toMatchObject({
      company: "Taletaff",
      salaryMin: 60000,
      salaryMax: 80000,
    });
  });

  it("applique les filtres de catégorie et recherche", async () => {
    await jobService.searchJobs({ category: "product", query: "PM" });
    expect(queryBuilder.eq).toHaveBeenCalledWith("category", "product");
    expect(queryBuilder.or).toHaveBeenCalled();
  });

  it("applique une limite personnalisée", async () => {
    await jobService.searchJobs({ limit: 5 });
    expect(queryBuilder.limit).toHaveBeenCalledWith(5);
  });

  it("propage les erreurs Supabase", async () => {
    mockData = { data: null, error: { message: "boom" } };
    await expect(jobService.searchJobs()).rejects.toThrow("boom");
  });

  it("retourne des valeurs par défaut lorsque les champs sont absents", async () => {
    mockData = {
      data: [
        {
          id: "2",
        },
      ],
      error: null,
    };
    const jobs = await jobService.searchJobs();
    expect(jobs[0]).toMatchObject({
      title: "",
      tags: [],
      salaryMin: 0,
    });
  });

  it("retourne un tableau vide quand aucun résultat", async () => {
    mockData = { data: null, error: null };
    const jobs = await jobService.searchJobs();
    expect(jobs).toEqual([]);
  });
});
