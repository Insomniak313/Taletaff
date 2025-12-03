import { supabaseAdmin } from "@/lib/supabase/server";
import type { JobFilters, JobRecord } from "@/types/job";

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
  async searchJobs(filters: JobFilters = {}): Promise<JobRecord[]> {
    const client = supabaseAdmin();
    let query = client.from(TABLE_NAME).select("*").order("created_at", {
      ascending: false,
    });

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.query) {
      query = query.or(
        `title.ilike.%${filters.query}%,company.ilike.%${filters.query}%`
      );
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapRecord);
  },
};
