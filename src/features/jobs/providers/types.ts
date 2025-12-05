import { providerCatalog } from "@/features/jobs/providers/providerCatalog";

export type JobProviderId = (typeof providerCatalog)[number]["id"];
export type JobProviderLanguage = (typeof providerCatalog)[number]["language"];

export const JOB_PROVIDER_IDS = providerCatalog.map((entry) => entry.id) as JobProviderId[];

export interface ProviderJob {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  category?: string;
  description?: string;
  remote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  tags?: string[];
  publishedAt?: string;
  language?: JobProviderLanguage;
}

export interface JobProviderContext {
  since?: Date;
  limit?: number;
  page?: number;
}

export interface ProviderPagination {
  mode: "page";
  startPage?: number;
  maxPages?: number;
}

export interface JobProviderSettings {
  endpoint?: string;
  authToken?: string;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface JobProvider {
  id: JobProviderId;
  label: string;
  defaultCategory: string;
  language: JobProviderLanguage;
  maxBatchSize?: number;
  pagination?: ProviderPagination;
  isConfigured: (settings?: JobProviderSettings) => boolean;
  fetchJobs: (context: JobProviderContext, settings?: JobProviderSettings) => Promise<ProviderJob[]>;
}
