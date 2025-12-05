import { describe, expect, it } from "vitest";
import { determineDueProviders, JOB_REFRESH_INTERVAL_MS } from "@/features/jobs/scheduler/jobScheduler";
import type { JobProvider, JobProviderId } from "@/features/jobs/providers";
import type { ProviderRunRow } from "@/features/jobs/scheduler/jobScheduler";
import type { JobProviderSettings } from "@/features/jobs/providers/types";
import { JOB_PROVIDER_IDS } from "@/features/jobs/providers/types";

const buildProvider = (id: JobProviderId, enabled = true): JobProvider => ({
  id,
  label: id,
  defaultCategory: "engineering",
  language: "en",
  maxBatchSize: 50,
  isConfigured: () => enabled,
  fetchJobs: async () => [],
});

const PROVIDER_IDS = JOB_PROVIDER_IDS as JobProviderId[];

const createJobCounts = (
  overrides: Partial<Record<JobProviderId, number>> = {}
): Record<JobProviderId, number | undefined> =>
  PROVIDER_IDS.reduce<Record<JobProviderId, number | undefined>>((acc, providerId) => {
    acc[providerId] = overrides[providerId];
    return acc;
  }, {} as Record<JobProviderId, number | undefined>);

const buildRun = (
  providerId: JobProviderId,
  overrides: Partial<ProviderRunRow> = {}
): ProviderRunRow => ({
  provider: providerId,
  last_run_at: null,
  last_success_at: null,
  status: "success",
  error: null,
  ...overrides,
});

const withSettings = (providerId: JobProviderId, enabled = true) =>
  ({
    [providerId]: enabled ? { endpoint: "https://api.example.com" } : undefined,
  }) as Partial<Record<JobProviderId, JobProviderSettings | undefined>>;

describe("determineDueProviders", () => {
  const now = new Date("2025-12-03T10:00:00Z");

  it("cible les providers sans exécution précédente", () => {
    const provider = buildProvider("france-travail");
    const result = determineDueProviders({
      providers: [provider],
      runs: {},
      jobCounts: createJobCounts({ "france-travail": 0 }),
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: withSettings("france-travail"),
    });

    expect(result).toEqual([provider]);
  });

  it("ignore les providers désactivés", () => {
    const provider = buildProvider("apec", false);
    const result = determineDueProviders({
      providers: [provider],
      runs: {},
      jobCounts: createJobCounts({ apec: 0 }),
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: withSettings("apec", false),
    });

    expect(result).toEqual([]);
  });

  it("relance quand aucune offre n'est présente en base", () => {
    const provider = buildProvider("hellowork");
    const runs = {
      hellowork: buildRun("hellowork", {
        last_run_at: now.toISOString(),
        last_success_at: now.toISOString(),
      }),
    };
    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: createJobCounts({ hellowork: 0 }),
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: withSettings("hellowork"),
    });

    expect(result).toEqual([provider]);
  });

  it("attend 3 jours quand des données fraîches existent", () => {
    const provider = buildProvider("welcometothejungle");
    const runs = {
      welcometothejungle: buildRun("welcometothejungle", {
        last_run_at: now.toISOString(),
        last_success_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS + 1000).toISOString(),
      }),
    };

    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: createJobCounts({ welcometothejungle: 15 }),
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: withSettings("welcometothejungle"),
    });

    expect(result).toEqual([]);
  });

  it("relance au-delà du délai de 3 jours", () => {
    const provider = buildProvider("jobteaser");
    const runs = {
      jobteaser: buildRun("jobteaser", {
        last_run_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS - 1).toISOString(),
        last_success_at: new Date(now.getTime() - JOB_REFRESH_INTERVAL_MS - 1).toISOString(),
      }),
    };

    const result = determineDueProviders({
      providers: [provider],
      runs,
      jobCounts: createJobCounts({ jobteaser: 42 }),
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: withSettings("jobteaser"),
    });

    expect(result).toEqual([provider]);
  });
});
