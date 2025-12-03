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
  | "talent-io";

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
}

export interface JobProvider {
  id: JobProviderId;
  label: string;
  defaultCategory: string;
  maxBatchSize?: number;
  isConfigured: () => boolean;
  fetchJobs: (context: JobProviderContext) => Promise<ProviderJob[]>;
}
