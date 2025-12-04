export type JobProviderId =
  | "france-travail"
  | "apec"
  | "meteojob"
  | "hellowork"
  | "welcometothejungle"
  | "jobteaser"
  | "chooseyourboss"
  | "monster-fr"
  | "indeed-fr"
  | "talent-io"
  | "arbeitnow"
  | "jobicy"
  | "remoteok"
  | "thehub"
  | "weworkremotely"
  | "hackernews-jobs"
  | "headhunter"
  | "torre"
  | "zippia"
  | "themuse";

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
  maxBatchSize?: number;
  pagination?: ProviderPagination;
  isConfigured: (settings?: JobProviderSettings) => boolean;
  fetchJobs: (context: JobProviderContext, settings?: JobProviderSettings) => Promise<ProviderJob[]>;
}
