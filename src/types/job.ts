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
}

export interface JobSearchResponse {
  jobs: JobRecord[];
}
