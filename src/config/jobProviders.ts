import type { JobProviderId } from "@/features/jobs/providers/types";
import { providerCatalog } from "@/features/jobs/providers/providerCatalog";

export interface JobProviderFilterOption {
  id: JobProviderId;
  label: string;
}

const uniqueProviderEntries = Array.from(
  providerCatalog.reduce((acc, entry) => {
    if (!acc.has(entry.id)) {
      acc.set(entry.id, entry);
    }
    return acc;
  }, new Map<string, (typeof providerCatalog)[number]>()).values()
);

export const jobProviderFilters: JobProviderFilterOption[] = uniqueProviderEntries.map((entry) => ({
  id: entry.id,
  label: entry.label,
}));

export const jobProviderFilterMap = jobProviderFilters.reduce<
  Record<JobProviderId, JobProviderFilterOption>
>((acc, provider) => {
  acc[provider.id] = provider;
  return acc;
}, {} as Record<JobProviderId, JobProviderFilterOption>);

const jobProviderIds = jobProviderFilters.map((provider) => provider.id);

export const isJobProviderId = (value: unknown): value is JobProviderId =>
  typeof value === "string" && jobProviderIds.includes(value as JobProviderId);
