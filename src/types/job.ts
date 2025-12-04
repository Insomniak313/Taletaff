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
  source?: string;
  externalId?: string | null;
  fetchedAt?: string | null;
}

export interface JobFilters {
  category?: string;
  query?: string;
  limit?: number;
  location?: string;
  remoteOnly?: boolean;
  minSalary?: number;
  maxSalary?: number;
  tags?: string[];
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
}

export interface JobSearchResponse {
  jobs: JobRecord[];
  summary: JobSearchSummary;
}
