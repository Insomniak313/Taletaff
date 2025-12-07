import { supabaseAdmin } from "@/lib/supabase/server";
import {
  buildJobSearchSummary,
  buildQueryTokens,
  scoreByRelevance,
} from "@/features/jobs/search/searchUtils";
import type { JobFilters, JobRecord, JobSearchResult } from "@/types/job";
import { isJobProviderId } from "@/config/jobProviders";

const TABLE_NAME = "jobs";
const DEFAULT_FETCH_LIMIT = 400;

const resolveSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (envUrl?.trim()) {
    const prefixed = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
    return prefixed.replace(/\/$/, "");
  }
  return "https://taletaff.com";
};

const sanitizeExternalUrl = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
};

const buildFallbackExternalUrl = (record: Record<string, unknown>): string => {
  const identifierParts = [record.source, record.external_id ?? record.externalId, record.id]
    .map((value) => {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
  const ref = identifierParts.length ? identifierParts.join("-") : "taletaff";
  const baseUrl = `${resolveSiteUrl()}/jobs`;
  return `${baseUrl}?ref=${encodeURIComponent(ref)}`;
};

const mapRecord = (record: Record<string, unknown>): JobRecord => {
  const sourceValue = typeof record.source === "string" ? record.source : undefined;
  const source = sourceValue && isJobProviderId(sourceValue) ? sourceValue : undefined;
  const externalUrl =
    sanitizeExternalUrl(record.external_url ?? record.externalUrl) ?? buildFallbackExternalUrl(record);

  return {
    id: String(record.id),
    title: String(record.title ?? ""),
    company: String(record.company ?? ""),
    location: String(record.location ?? ""),
    category: String(record.category ?? ""),
    description: String(record.description ?? ""),
    remote: Boolean(record.remote ?? false),
    salaryMin: Number(record.salary_min ?? record.salaryMin ?? 0),
    salaryMax: Number(record.salary_max ?? record.salaryMax ?? 0),
    tags: (record.tags as string[]) ?? [],
    createdAt: String(record.created_at ?? record.createdAt ?? new Date().toISOString()),
    source,
    externalUrl,
    externalId: record.external_id ? String(record.external_id) : undefined,
    fetchedAt: record.fetched_at ? String(record.fetched_at) : undefined,
  };
};

export const jobService = {
  async searchJobs(filters: JobFilters = {}): Promise<JobSearchResult> {
    const client = supabaseAdmin();
    let query = client.from(TABLE_NAME).select("*", { count: "exact" }).order("created_at", {
      ascending: false,
    });

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.provider) {
      query = query.eq("source", filters.provider);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.remoteOnly) {
      query = query.eq("remote", true);
    }

    if (typeof filters.minSalary === "number") {
      query = query.gte("salary_min", filters.minSalary);
    }

    if (typeof filters.maxSalary === "number") {
      query = query.lte("salary_max", filters.maxSalary);
    }

    if (filters.tags?.length) {
      query = query.contains("tags", filters.tags);
    }

    if (filters.query) {
      const sanitizedQuery = filters.query.replace(/,/g, "\\,");
      query = query.or(
        [
          `title.ilike.%${sanitizedQuery}%`,
          `company.ilike.%${sanitizedQuery}%`,
          `location.ilike.%${sanitizedQuery}%`,
          `description.ilike.%${sanitizedQuery}%`,
        ].join(",")
      );
    }

    if (typeof filters.limit === "number") {
      const safeLimit = Math.max(1, filters.limit);
      const safeOffset = Math.max(0, filters.offset ?? 0);
      query = query.range(safeOffset, safeOffset + safeLimit - 1);
    } else if (typeof filters.offset === "number") {
      const safeOffset = Math.max(0, filters.offset);
      query = query.range(safeOffset, safeOffset + DEFAULT_FETCH_LIMIT - 1);
    } else {
      query = query.limit(DEFAULT_FETCH_LIMIT);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const jobs = (data ?? []).map(mapRecord);
    const tokens = buildQueryTokens(filters.query);
    const orderedJobs = scoreByRelevance(jobs, tokens);
    const totalCount = count ?? orderedJobs.length;
    const summary = buildJobSearchSummary(orderedJobs, totalCount);

    return { jobs: orderedJobs, summary, totalCount };
  },
};
