import type { JobProviderId } from "@/features/jobs/providers/types";

export interface JobProviderFilterOption {
  id: JobProviderId;
  label: string;
}

export const jobProviderFilters: JobProviderFilterOption[] = [
  { id: "france-travail", label: "France Travail (ex Pôle emploi)" },
  { id: "apec", label: "APEC" },
  { id: "meteojob", label: "Meteojob" },
  { id: "hellowork", label: "HelloWork / RegionsJob" },
  { id: "welcometothejungle", label: "Welcome to the Jungle" },
  { id: "jobteaser", label: "JobTeaser" },
  { id: "chooseyourboss", label: "ChooseYourBoss" },
  { id: "monster-fr", label: "Monster France" },
  { id: "indeed-fr", label: "Indeed France" },
  { id: "talent-io", label: "talent.io" },
  { id: "arbeitnow", label: "Arbeitnow" },
  { id: "jobicy", label: "Jobicy" },
  { id: "remoteok", label: "RemoteOK" },
  { id: "thehub", label: "The Hub" },
  { id: "weworkremotely", label: "We Work Remotely (RSS)" },
  { id: "hackernews-jobs", label: "Hacker News Jobs" },
  { id: "headhunter", label: "HeadHunter" },
  { id: "torre", label: "Torre" },
  { id: "zippia", label: "Zippia" },
  { id: "themuse", label: "The Muse" },
];

export const jobProviderFilterMap = jobProviderFilters.reduce<
  Record<JobProviderId, JobProviderFilterOption>
>((acc, provider) => {
  acc[provider.id] = provider;
  return acc;
}, {} as Record<JobProviderId, JobProviderFilterOption>);
