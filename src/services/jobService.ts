import { supabaseAdmin } from "@/lib/supabase/server";
import {
  buildJobSearchSummary,
  buildQueryTokens,
  scoreByRelevance,
} from "@/features/jobs/search/searchUtils";
import type { JobFilters, JobRecord, JobSearchResult } from "@/types/job";

const TABLE_NAME = "jobs";

const mapRecord = (record: Record<string, unknown>): JobRecord => ({
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
  source: record.source ? String(record.source) : undefined,
  externalId: record.external_id ? String(record.external_id) : undefined,
  fetchedAt: record.fetched_at ? String(record.fetched_at) : undefined,
});

export const jobService = {
  async searchJobs(filters: JobFilters = {}): Promise<JobSearchResult> {
    const client = supabaseAdmin();
    let query = client.from(TABLE_NAME).select("*").order("created_at", {
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

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const jobs = (data ?? []).map(mapRecord);
    const tokens = buildQueryTokens(filters.query);
    const orderedJobs = scoreByRelevance(jobs, tokens);
    const summary = buildJobSearchSummary(orderedJobs);

    return { jobs: orderedJobs, summary };
  },
};
