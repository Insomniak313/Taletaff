import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JOB_PROVIDERS } from "@/features/jobs/providers";
import type { JobProvider, JobProviderId } from "@/features/jobs/providers";
import { scrapeProvider } from "@/features/jobs/scraper/jobScraper";

const JOB_PROVIDER_RUNS_TABLE = "job_provider_runs";
const JOBS_TABLE = "jobs";
export const JOB_REFRESH_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

type JobsClient = SupabaseClient<any, "public">;

type ProviderRunRow = {
  provider: JobProviderId;
  last_run_at: string | null;
  last_success_at: string | null;
  status: "idle" | "running" | "success" | "failed";
  error: string | null;
};

export interface SchedulerSummaryItem {
  providerId: JobProviderId;
  status: "success" | "error" | "skipped" | "disabled";
  fetched?: number;
  persisted?: number;
  message?: string;
}

export interface SchedulerSummary {
  triggeredAt: string;
  dueProviders: JobProviderId[];
  items: SchedulerSummaryItem[];
}

const fetchRunRows = async (client: JobsClient): Promise<Record<JobProviderId, ProviderRunRow>> => {
  const { data, error } = await client.from(JOB_PROVIDER_RUNS_TABLE).select("*");
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return {} as Record<JobProviderId, ProviderRunRow>;
  }
  return data.reduce<Record<JobProviderId, ProviderRunRow>>((acc, row) => {
    acc[row.provider as JobProviderId] = row as ProviderRunRow;
    return acc;
  }, {});
};

const fetchJobCounts = async (
  client: JobsClient,
  providers: JobProviderId[]
): Promise<Record<JobProviderId, number>> => {
  const entries = await Promise.all(
    providers.map(async (providerId) => {
      const { count, error } = await client
        .from(JOBS_TABLE)
        .select("id", { head: true, count: "exact" })
        .eq("source", providerId);

      if (error) {
        throw new Error(error.message);
      }

      return [providerId, count ?? 0] as const;
    })
  );

  return Object.fromEntries(entries) as Record<JobProviderId, number>;
};

const upsertRunRow = async (
  client: JobsClient,
  providerId: JobProviderId,
  patch: Partial<ProviderRunRow>
) => {
  const payload = {
    provider: providerId,
    ...patch,
  };
  const { error } = await client
    .from(JOB_PROVIDER_RUNS_TABLE)
    .upsert(payload, { onConflict: "provider" });
  if (error) {
    throw new Error(error.message);
  }
};

interface DetermineDueProvidersArgs {
  providers: JobProvider[];
  runs: Record<JobProviderId, ProviderRunRow | undefined>;
  jobCounts: Record<JobProviderId, number | undefined>;
  now: Date;
  refreshIntervalMs: number;
}

export const determineDueProviders = ({
  providers,
  runs,
  jobCounts,
  now,
  refreshIntervalMs,
}: DetermineDueProvidersArgs): JobProvider[] => {
  return providers.filter((provider) => {
    if (!provider.isConfigured()) {
      return false;
    }

    const run = runs[provider.id];
    const lastSuccessAt = run?.last_success_at ? new Date(run.last_success_at).getTime() : null;
    const hasJobs = (jobCounts[provider.id] ?? 0) > 0;

    if (!hasJobs) {
      return true;
    }

    if (!lastSuccessAt) {
      return true;
    }

    return now.getTime() - lastSuccessAt >= refreshIntervalMs;
  });
};

const summarizeProviderState = (
  provider: JobProvider,
  result: SchedulerSummaryItem | null
): SchedulerSummaryItem => {
  if (result) {
    return result;
  }
  if (!provider.isConfigured()) {
    return { providerId: provider.id, status: "disabled" };
  }
  return { providerId: provider.id, status: "skipped" };
};

export const jobScheduler = {
  JOB_REFRESH_INTERVAL_MS,
  determineDueProviders,
  async syncDueProviders(): Promise<SchedulerSummary> {
    const client = supabaseAdmin();
    const providers = JOB_PROVIDERS;
    const now = new Date();

    const [runs, jobCounts] = await Promise.all([
      fetchRunRows(client),
      fetchJobCounts(client, providers.map((provider) => provider.id)),
    ]);

    const dueProviders = determineDueProviders({
      providers,
      runs,
      jobCounts,
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
    });

    const items: SchedulerSummaryItem[] = [];

    for (const provider of dueProviders) {
      await upsertRunRow(client, provider.id, {
        status: "running",
        last_run_at: new Date().toISOString(),
        error: null,
      });

      try {
        const result = await scrapeProvider(provider, client);
        await upsertRunRow(client, provider.id, {
          status: "success",
          last_success_at: new Date().toISOString(),
          error: null,
        });
        items.push({
          providerId: provider.id,
          status: "success",
          fetched: result.fetched,
          persisted: result.persisted,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur scraper";
        await upsertRunRow(client, provider.id, {
          status: "failed",
          error: message,
        });
        items.push({
          providerId: provider.id,
          status: "error",
          message,
        });
      }
    }

    const flattened = providers.map((provider) => {
      const existing = items.find((item) => item.providerId === provider.id) ?? null;
      return summarizeProviderState(provider, existing);
    });

    return {
      triggeredAt: now.toISOString(),
      dueProviders: dueProviders.map((provider) => provider.id),
      items: flattened,
    };
  },
};
