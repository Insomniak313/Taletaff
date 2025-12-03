import { describe, expect, it } from "vitest";
import { determineDueProviders, JOB_REFRESH_INTERVAL_MS } from "@/features/jobs/scheduler/jobScheduler";
import type { JobProvider, JobProviderId } from "@/features/jobs/providers";

const buildProvider = (id: JobProviderId, enabled = true): JobProvider => ({
  id,
  label: id,
  defaultCategory: "engineering",
  maxBatchSize: 50,
  isConfigured: () => enabled,
  fetchJobs: async () => [],
});

describe("determineDueProviders", () => {
  const now = new Date("2025-12-03T10:00:00Z");

  it("cible les providers sans exécution précédente", () => {
    const provider = buildProvider("france-travail");
    const result = determineDueProviders({
      providers: [provider],
      runs: {},
      jobCounts: { "france-travail": 0 },
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    expect(result).toEqual([provider]);
  });

  it("ignore les providers désactivés", () => {
    const provider = buildProvider("apec", false);
    const result = determineDueProviders({
      providers: [provider],
      runs: {},
      jobCounts: { apec: 0 },
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    expect(result).toEqual([]);
  });

  it("relance quand aucune offre n'est présente en base", () => {
    const provider = buildProvider("hellowork");
    const runs = {
      hellowork: {
        provider: "hellowork",
        last_run_at: now.toISOString(),
        last_success_at: now.toISOString(),
        status: "success" as const,
        error: null,
      },
    };
    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: { hellowork: 0 },
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    expect(result).toEqual([provider]);
  });

  it("attend 3 jours quand des données fraîches existent", () => {
    const provider = buildProvider("welcometothejungle");
    const runs = {
      welcometothejungle: {
        provider: "welcometothejungle",
        last_run_at: now.toISOString(),
        last_success_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS + 1000).toISOString(),
        status: "success" as const,
        error: null,
      },
    };

    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: { welcometothejungle: 15 },
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    expect(result).toEqual([]);
  });

  it("relance au-delà du délai de 3 jours", () => {
    const provider = buildProvider("jobteaser");
    const runs = {
      jobteaser: {
        provider: "jobteaser",
        last_run_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS - 1).toISOString(),
        last_success_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS - 1).toISOString(),
        status: "success" as const,
        error: null,
      },
    };

    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: { jobteaser: 42 },
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    expect(result).toEqual([provider]);
  });
});
