import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResponse = {
  data: unknown[] | null;
  error: { message: string } | null;
  count?: number | null;
};

const queryBuilder = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  then: (resolve: (value: QueryResponse) => void) => resolve({ data: [], error: null, count: 0 }),
};

const fromMock = vi.fn().mockReturnValue(queryBuilder);

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: () => ({ from: fromMock }),
}));

let mockData: QueryResponse = { data: [], error: null, count: 0 };

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
      count: 1,
    };
    fromMock.mockClear();
    queryBuilder.eq.mockClear();
    queryBuilder.ilike.mockClear();
    queryBuilder.gte.mockClear();
    queryBuilder.lte.mockClear();
    queryBuilder.contains.mockClear();
    queryBuilder.or.mockClear();
    queryBuilder.limit.mockClear();
    queryBuilder.range.mockClear();
  });

  it("retourne les offres formatées et un résumé", async () => {
    const result = await jobService.searchJobs();
    expect(result.jobs[0]).toMatchObject({
      company: "Taletaff",
      salaryMin: 60000,
      salaryMax: 80000,
    });
    expect(result.summary.count).toBe(1);
    expect(result.totalCount).toBe(1);
  });

  it("applique les filtres de catégorie et recherche avancée", async () => {
    await jobService.searchJobs({
      category: "product",
      query: "PM",
      location: "Paris",
      remoteOnly: true,
      minSalary: 50000,
      maxSalary: 90000,
      tags: ["Product"],
    });
    expect(queryBuilder.eq).toHaveBeenCalledWith("category", "product");
    expect(queryBuilder.ilike).toHaveBeenCalledWith("location", "%Paris%");
    expect(queryBuilder.eq).toHaveBeenCalledWith("remote", true);
    expect(queryBuilder.gte).toHaveBeenCalledWith("salary_min", 50000);
    expect(queryBuilder.lte).toHaveBeenCalledWith("salary_max", 90000);
    expect(queryBuilder.contains).toHaveBeenCalledWith("tags", ["Product"]);
    expect(queryBuilder.or).toHaveBeenCalled();
  });

  it("applique un filtre provider", async () => {
    await jobService.searchJobs({
      provider: "apec",
    });
    expect(queryBuilder.eq).toHaveBeenCalledWith("source", "apec");
  });

  it("applique une limite personnalisée", async () => {
    await jobService.searchJobs({ limit: 5 });
    expect(queryBuilder.range).toHaveBeenCalledWith(0, 4);
  });

  it("propage les erreurs Supabase", async () => {
    mockData = { data: null, error: { message: "boom" }, count: null };
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
      count: null,
    };
    const result = await jobService.searchJobs();
    expect(result.jobs[0]).toMatchObject({
      title: "",
      tags: [],
      salaryMin: 0,
    });
  });

  it("retourne un tableau vide quand aucun résultat", async () => {
    mockData = { data: null, error: null, count: 0 };
    const result = await jobService.searchJobs();
    expect(result.jobs).toEqual([]);
    expect(result.summary.count).toBe(0);
  });

  it("mappe les champs optionnels liés à la source", async () => {
    const fetchedAt = new Date().toISOString();
    mockData = {
      data: [
        {
          id: "3",
          source: "apec",
          external_id: "ext-123",
          fetched_at: fetchedAt,
        },
      ],
      error: null,
      count: null,
    };
    const result = await jobService.searchJobs();
    expect(result.jobs[0]).toMatchObject({
      source: "apec",
      externalId: "ext-123",
      fetchedAt,
    });
  });

  it("applique un offset personnalisé quand seule la page change", async () => {
    await jobService.searchJobs({ offset: 20 });
    expect(queryBuilder.range).toHaveBeenCalledWith(20, 419);
  });

  it("retombe sur le nombre d'offres lorsque le count est absent", async () => {
    mockData = {
      data: [
        {
          id: "42",
          title: "Ops Lead",
          company: "Acme",
          location: "Remote",
          category: "operations",
          description: "Desc",
          remote: true,
          salary_min: 50000,
          salary_max: 80000,
          tags: [],
          created_at: new Date().toISOString(),
        },
      ],
      error: null,
      count: null,
    };

    const result = await jobService.searchJobs();
    expect(result.totalCount).toBe(1);
    expect(result.summary.count).toBe(1);
  });
});
