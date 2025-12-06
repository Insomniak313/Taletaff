import type { JobProviderId } from "@/features/jobs/providers/types";

export interface JobCategory {
  slug: string;
  title: string;
  description: string;
  hero: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  tags: string[];
  createdAt: string;
  source?: JobProviderId;
  externalUrl: string;
  externalId?: string | null;
  fetchedAt?: string | null;
}

export interface JobFilters {
  category?: string;
  provider?: JobProviderId;
  query?: string;
  location?: string;
  remoteOnly?: boolean;
  minSalary?: number;
  maxSalary?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface JobSearchSummary {
  count: number;
  remoteShare: number;
  salaryRange: {
    min: number;
    max: number;
  };
  topLocations: Array<{ label: string; count: number }>;
  topTags: Array<{ label: string; count: number }>;
}

export interface JobSearchResult {
  jobs: JobRecord[];
  summary: JobSearchSummary;
  totalCount: number;
}

export interface JobSearchResponse {
  jobs: JobRecord[];
  summary: JobSearchSummary;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    pageCount: number;
  };
}
