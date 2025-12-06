import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  JobProvider,
  JobProviderId,
  JobProviderSettings,
  ProviderJob,
} from "@/features/jobs/providers";

const JOBS_TABLE = "jobs";
const UPSERT_CHUNK_SIZE = 200;
const DEFAULT_MAX_PAGINATION_PAGES = 5;
const MAX_JOBS_PER_PROVIDER = 2000;

type JobsClient = SupabaseClient<Record<string, unknown>, "public">;

interface JobInsertRow {
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  remote: boolean;
  salary_min: number;
  salary_max: number;
  tags: string[];
  source: JobProviderId;
  external_id: string;
  fetched_at: string;
  external_url: string;
}

export interface JobScraperResult {
  providerId: JobProviderId;
  fetched: number;
  persisted: number;
}

const sanitizeTags = (tags: string[] | undefined): string[] => {
  if (!tags || tags.length === 0) {
    return [];
  }
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))).slice(0, 8);
};

const normalizeNumber = (value: number | null | undefined): number => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 0;
};

const looksLikeAbsoluteUrl = (value?: string): boolean => {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
};

const normalizeExternalUrl = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!looksLikeAbsoluteUrl(trimmed)) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const buildSearchFallbackUrl = (job: ProviderJob, provider: JobProvider): string => {
  const segments = [job.title, job.company, provider.label, job.externalId]
    .map((segment) => (typeof segment === "string" ? segment.trim() : undefined))
    .filter((segment): segment is string => Boolean(segment));
  const query = segments.length ? segments.join(" ") : "offre emploi";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};

const resolveExternalUrl = (provider: JobProvider, job: ProviderJob): string => {
  const candidates = [
    job.externalUrl,
    job.externalId && looksLikeAbsoluteUrl(job.externalId) ? job.externalId : undefined,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeExternalUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return buildSearchFallbackUrl(job, provider);
};

const toJobRow = (provider: JobProvider, job: ProviderJob): JobInsertRow | null => {
  if (!job.externalId || !job.title) {
    return null;
  }

  const salaryMin = normalizeNumber(job.salaryMin ?? undefined);
  const salaryMax = Math.max(salaryMin, normalizeNumber(job.salaryMax ?? undefined));
  const externalUrl = resolveExternalUrl(provider, job);

  return {
    title: job.title,
    company: job.company ?? provider.label,
    location: job.location ?? "France",
    category: job.category ?? provider.defaultCategory,
    description: job.description ?? "",
    remote: Boolean(job.remote),
    salary_min: salaryMin,
    salary_max: salaryMax,
    tags: sanitizeTags(job.tags),
    source: provider.id,
    external_id: job.externalId,
    fetched_at: job.publishedAt ?? new Date().toISOString(),
    external_url: externalUrl,
  };
};

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (items.length <= size) {
    return [items];
  }
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const upsertJobs = async (client: JobsClient, rows: JobInsertRow[]): Promise<number> => {
  if (rows.length === 0) {
    return 0;
  }
  const chunks = chunkArray(rows, UPSERT_CHUNK_SIZE);
  let persisted = 0;

  for (const chunk of chunks) {
    const { data, error } = await client
      .from(JOBS_TABLE)
      .upsert(chunk as never, { onConflict: "source,external_id" })
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    persisted += data?.length ?? 0;
  }

  return persisted;
};

const resolveFetchLimit = (provider: JobProvider): number => {
  return provider.maxBatchSize ?? UPSERT_CHUNK_SIZE;
};

const fetchProviderJobs = async (
  provider: JobProvider,
  settings: JobProviderSettings | undefined
): Promise<ProviderJob[]> => {
  const limit = resolveFetchLimit(provider);

  if (!provider.pagination) {
    return provider.fetchJobs({ limit }, settings);
  }

  const jobs: ProviderJob[] = [];
  const startPage = provider.pagination.startPage ?? 1;
  const maxPages = provider.pagination.maxPages ?? DEFAULT_MAX_PAGINATION_PAGES;
  let currentPage = startPage;

  for (let index = 0; index < maxPages; index += 1) {
    const batch = await provider.fetchJobs({ limit, page: currentPage }, settings);

    if (batch.length === 0) {
      break;
    }

    jobs.push(...batch);

    if (jobs.length >= MAX_JOBS_PER_PROVIDER) {
      break;
    }

    if (batch.length < limit) {
      break;
    }

    currentPage += 1;
  }

  return jobs.slice(0, MAX_JOBS_PER_PROVIDER);
};

export const scrapeProvider = async (
  provider: JobProvider,
  settings: JobProviderSettings | undefined,
  client: JobsClient = supabaseAdmin()
): Promise<JobScraperResult> => {
  if (!provider.isConfigured(settings)) {
    return { providerId: provider.id, fetched: 0, persisted: 0 };
  }

  const jobs = await fetchProviderJobs(provider, settings);
  const rows = jobs
    .map((job) => toJobRow(provider, job))
    .filter((row): row is JobInsertRow => Boolean(row));

  const persisted = await upsertJobs(client, rows);

  return {
    providerId: provider.id,
    fetched: jobs.length,
    persisted,
  };
};
