import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JOB_PROVIDERS } from "@/features/jobs/providers";
import type { JobProvider, JobProviderId, JobProviderSettings } from "@/features/jobs/providers";
import { scrapeProvider } from "@/features/jobs/scraper/jobScraper";
import { providerConfigStore } from "@/features/jobs/providers/providerConfigStore";

const JOB_PROVIDER_RUNS_TABLE = "job_provider_runs";
const JOBS_TABLE = "jobs";
export const JOB_REFRESH_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

type JobsClient = SupabaseClient<Record<string, unknown>, "public">;

export type ProviderRunRow = {
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

type ProviderRunMap = Partial<Record<JobProviderId, ProviderRunRow>>;

export const fetchRunRows = async (client: JobsClient): Promise<ProviderRunMap> => {
  const { data, error } = await client.from(JOB_PROVIDER_RUNS_TABLE).select("*");
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return {};
  }
  const rows = data as ProviderRunRow[];
  return rows.reduce<ProviderRunMap>((acc, row) => {
    acc[row.provider as JobProviderId] = row as ProviderRunRow;
    return acc;
  }, {});
};

export const fetchJobCounts = async (
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

export const upsertRunRow = async (
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
    .upsert(payload as never, { onConflict: "provider" });
  if (error) {
    throw new Error(error.message);
  }
};

interface DetermineDueProvidersArgs {
  providers: JobProvider[];
  runs: ProviderRunMap;
  jobCounts: Record<JobProviderId, number | undefined>;
  now: Date;
  refreshIntervalMs: number;
  settings: Partial<Record<JobProviderId, JobProviderSettings | undefined>>;
}

export const determineDueProviders = ({
  providers,
  runs,
  jobCounts,
  now,
  refreshIntervalMs,
  settings,
}: DetermineDueProvidersArgs): JobProvider[] => {
  return providers.filter((provider) => {
    if (!provider.isConfigured(settings[provider.id])) {
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
  result: SchedulerSummaryItem | null,
  settings: JobProviderSettings | undefined
): SchedulerSummaryItem => {
  if (result) {
    return result;
  }
  if (!provider.isConfigured(settings)) {
    return { providerId: provider.id, status: "disabled" };
  }
  return { providerId: provider.id, status: "skipped" };
};

const runProviderOnce = async (
  provider: JobProvider,
  settings: JobProviderSettings | undefined,
  client: JobsClient
): Promise<SchedulerSummaryItem> => {
  await upsertRunRow(client, provider.id, {
    status: "running",
    last_run_at: new Date().toISOString(),
    error: null,
  });

  try {
    const result = await scrapeProvider(provider, settings, client);
    await upsertRunRow(client, provider.id, {
      status: "success",
      last_success_at: new Date().toISOString(),
      error: null,
    });
    return {
      providerId: provider.id,
      status: "success",
      fetched: result.fetched,
      persisted: result.persisted,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur scraper";
    await upsertRunRow(client, provider.id, {
      status: "failed",
      error: message,
    });
    return {
      providerId: provider.id,
      status: "error",
      message,
    };
  }
};

export const jobScheduler = {
  JOB_REFRESH_INTERVAL_MS,
  determineDueProviders,
  async syncDueProviders(): Promise<SchedulerSummary> {
    const client = supabaseAdmin();
    const providers = JOB_PROVIDERS;
    const now = new Date();

    const [runs, jobCounts, settingsMap] = await Promise.all([
      fetchRunRows(client),
      fetchJobCounts(client, providers.map((provider) => provider.id)),
      providerConfigStore.fetchSettingsMap(client),
    ]);

    const dueProviders = determineDueProviders({
      providers,
      runs,
      jobCounts,
      now,
      refreshIntervalMs: JOB_REFRESH_INTERVAL_MS,
      settings: settingsMap,
    });

    const items: SchedulerSummaryItem[] = [];

    for (const provider of dueProviders) {
      const providerSettings = settingsMap[provider.id];
      items.push(await runProviderOnce(provider, providerSettings, client));
    }

    const flattened = providers.map((provider) => {
      const existing = items.find((item) => item.providerId === provider.id) ?? null;
      return summarizeProviderState(provider, existing, settingsMap[provider.id]);
    });

    return {
      triggeredAt: now.toISOString(),
      dueProviders: dueProviders.map((provider) => provider.id),
      items: flattened,
    };
  },
  async runProvider(providerId: JobProviderId): Promise<SchedulerSummaryItem> {
    const provider = JOB_PROVIDERS.find((entry) => entry.id === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} introuvable`);
    }

    const client = supabaseAdmin();
    const settings = await providerConfigStore.fetchSettings(providerId, client);

    if (!provider.isConfigured(settings)) {
      throw new Error(`Le provider ${provider.label} n'est pas configuré`);
    }

    return runProviderOnce(provider, settings, client);
  },
  async runAllProviders(): Promise<SchedulerSummary> {
    const client = supabaseAdmin();
    const [settingsMap] = await Promise.all([providerConfigStore.fetchSettingsMap(client)]);
    const triggeredAt = new Date();
    const items: SchedulerSummaryItem[] = [];

    for (const provider of JOB_PROVIDERS) {
      const settings = settingsMap[provider.id];
      if (!provider.isConfigured(settings)) {
        items.push({ providerId: provider.id, status: "disabled" });
        continue;
      }
      items.push(await runProviderOnce(provider, settings, client));
    }

    return {
      triggeredAt: triggeredAt.toISOString(),
      dueProviders: JOB_PROVIDERS.map((provider) => provider.id),
      items,
    };
  },
};
