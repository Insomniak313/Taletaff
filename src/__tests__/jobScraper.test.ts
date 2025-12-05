import { describe, expect, it, vi } from "vitest";
import { scrapeProvider } from "@/features/jobs/scraper/jobScraper";
import type { JobProvider, ProviderJob } from "@/features/jobs/providers";

const buildJob = (externalId: string): ProviderJob => ({
  externalId,
  title: `Offre ${externalId}`,
  company: "Test Corp",
});

const buildMockClient = () => {
  const from = vi.fn().mockImplementation(() => ({
    upsert: (payload: unknown) => {
      const rows = Array.isArray(payload) ? payload : [];
      return {
        select: async () => ({
          data: rows.map((_, index) => ({ id: index })),
          error: null,
        }),
      };
    },
  }));

  return { from };
};

describe("scrapeProvider", () => {
  it("itère sur les pages tant qu'elles sont remplies", async () => {
    const fetchJobs = vi.fn(async (context = {}) => {
      if ((context.page ?? 1) === 1) {
        return [buildJob("job-1"), buildJob("job-2")];
      }
      if ((context.page ?? 1) === 2) {
        return [buildJob("job-3")];
      }
      return [];
    });

    const provider: JobProvider = {
      id: "arbeitnow",
      label: "Arbeitnow",
      defaultCategory: "engineering",
      language: "en",
      maxBatchSize: 2,
      pagination: { mode: "page", startPage: 1, maxPages: 5 },
      isConfigured: () => true,
      fetchJobs,
    };

    const client = buildMockClient();
    const result = await scrapeProvider(provider, undefined, client as never);

    expect(fetchJobs).toHaveBeenCalledTimes(2);
    expect(result.fetched).toBe(3);
    expect(result.persisted).toBe(3);
    expect(client.from).toHaveBeenCalledWith("jobs");
  });

  it("respecte la limite de pages configurée", async () => {
    let pageCounter = 0;
    const fetchJobs = vi.fn(async () => {
      pageCounter += 1;
      return [buildJob(`job-${pageCounter}-a`), buildJob(`job-${pageCounter}-b`)];
    });

    const provider: JobProvider = {
      id: "torre",
      label: "Torre",
      defaultCategory: "product",
      language: "en",
      maxBatchSize: 2,
      pagination: { mode: "page", startPage: 0, maxPages: 2 },
      isConfigured: () => true,
      fetchJobs,
    };

    const client = buildMockClient();
    const result = await scrapeProvider(provider, undefined, client as never);

    expect(fetchJobs).toHaveBeenCalledTimes(2);
    expect(result.fetched).toBe(4);
    expect(result.persisted).toBe(4);
  });
});
