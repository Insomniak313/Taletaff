export const JOB_PROVIDER_IDS = [
  "france-travail",
  "apec",
  "meteojob",
  "hellowork",
  "welcometothejungle",
  "jobteaser",
  "chooseyourboss",
  "monster-fr",
  "indeed-fr",
  "talent-io",
  "arbeitnow",
  "jobicy",
  "remoteok",
  "thehub",
  "weworkremotely",
  "hackernews-jobs",
  "headhunter",
  "torre",
  "zippia",
  "themuse",
  "indeed-us",
  "indeed-uk",
  "indeed-de",
  "indeed-es",
  "indeed-it",
  "indeed-nl",
  "glassdoor-fr",
  "glassdoor-uk",
  "glassdoor-de",
  "glassdoor-us",
  "linkedin-fr",
  "linkedin-de",
  "linkedin-es",
  "linkedin-uk",
  "stepstone-de",
  "stepstone-nl",
  "stepstone-be",
  "reed-uk",
  "totaljobs-uk",
  "jobserve-uk",
  "irishjobs-ie",
  "seek-au",
  "seek-nz",
  "jobstreet-sg",
  "jobstreet-my",
  "jobstreet-ph",
  "jobstreet-id",
  "jobstreet-vn",
  "infojobs-es",
  "infojobs-it",
  "catho-br",
  "gupy-br",
  "bumeran-ar",
  "bumeran-pe",
  "computrabajo-mx",
  "computrabajo-co",
  "elempleo-co",
  "workana-latam",
  "pracuj-pl",
  "praca-sk",
  "jobs-ch",
  "jobup-ch",
  "eures-eu",
  "adzuna-uk",
  "adzuna-fr",
  "adzuna-au",
  "adzuna-ca",
  "adzuna-us",
  "wearedevelopers-de",
  "stackshare-us",
] as const;

export type JobProviderId = (typeof JOB_PROVIDER_IDS)[number];

export type JobProviderLanguage =
  | "fr"
  | "en"
  | "de"
  | "es"
  | "it"
  | "nl"
  | "pt"
  | "pl"
  | "sk"
  | "vi"
  | "id"
  | "ms"
  | "ru";

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
