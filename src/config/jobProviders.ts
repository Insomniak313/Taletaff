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
  { id: "indeed-us", label: "Indeed (US)" },
  { id: "indeed-uk", label: "Indeed (UK)" },
  { id: "indeed-de", label: "Indeed (DE)" },
  { id: "indeed-es", label: "Indeed (ES)" },
  { id: "indeed-it", label: "Indeed (IT)" },
  { id: "indeed-nl", label: "Indeed (NL)" },
  { id: "glassdoor-fr", label: "Glassdoor (FR)" },
  { id: "glassdoor-uk", label: "Glassdoor (UK)" },
  { id: "glassdoor-de", label: "Glassdoor (DE)" },
  { id: "glassdoor-us", label: "Glassdoor (US)" },
  { id: "linkedin-fr", label: "LinkedIn (FR)" },
  { id: "linkedin-de", label: "LinkedIn (DE)" },
  { id: "linkedin-es", label: "LinkedIn (ES)" },
  { id: "linkedin-uk", label: "LinkedIn (UK)" },
  { id: "stepstone-de", label: "StepStone (DE)" },
  { id: "stepstone-nl", label: "StepStone (NL)" },
  { id: "stepstone-be", label: "StepStone (BE)" },
  { id: "reed-uk", label: "Reed.co.uk" },
  { id: "totaljobs-uk", label: "TotalJobs (UK)" },
  { id: "jobserve-uk", label: "JobServe (UK)" },
  { id: "irishjobs-ie", label: "IrishJobs" },
  { id: "seek-au", label: "SEEK (AU)" },
  { id: "seek-nz", label: "SEEK (NZ)" },
  { id: "jobstreet-sg", label: "JobStreet (SG)" },
  { id: "jobstreet-my", label: "JobStreet (MY)" },
  { id: "jobstreet-ph", label: "JobStreet (PH)" },
  { id: "jobstreet-id", label: "JobStreet (ID)" },
  { id: "jobstreet-vn", label: "JobStreet (VN)" },
  { id: "infojobs-es", label: "InfoJobs (ES)" },
  { id: "infojobs-it", label: "InfoJobs (IT)" },
  { id: "catho-br", label: "Catho (BR)" },
  { id: "gupy-br", label: "Gupy (BR)" },
  { id: "bumeran-ar", label: "Bumeran (AR)" },
  { id: "bumeran-pe", label: "Bumeran (PE)" },
  { id: "computrabajo-mx", label: "Computrabajo (MX)" },
  { id: "computrabajo-co", label: "Computrabajo (CO)" },
  { id: "elempleo-co", label: "Elempleo (CO)" },
  { id: "workana-latam", label: "Workana LATAM" },
  { id: "pracuj-pl", label: "Pracuj.pl" },
  { id: "praca-sk", label: "Praca.sk" },
  { id: "jobs-ch", label: "jobs.ch" },
  { id: "jobup-ch", label: "Jobup.ch" },
  { id: "eures-eu", label: "EURES Europe" },
  { id: "adzuna-uk", label: "Adzuna (UK)" },
  { id: "adzuna-fr", label: "Adzuna (FR)" },
  { id: "adzuna-au", label: "Adzuna (AU)" },
  { id: "adzuna-ca", label: "Adzuna (CA)" },
  { id: "adzuna-us", label: "Adzuna (US)" },
  { id: "wearedevelopers-de", label: "WeAreDevelopers (DE)" },
  { id: "stackshare-us", label: "StackShare (US)" },
];

export const jobProviderFilterMap = jobProviderFilters.reduce<
  Record<JobProviderId, JobProviderFilterOption>
>((acc, provider) => {
  acc[provider.id] = provider;
  return acc;
}, {} as Record<JobProviderId, JobProviderFilterOption>);

const jobProviderIds = jobProviderFilters.map((provider) => provider.id);

export const isJobProviderId = (value: unknown): value is JobProviderId =>
  typeof value === "string" && jobProviderIds.includes(value as JobProviderId);
