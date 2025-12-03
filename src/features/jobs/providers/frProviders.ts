import type { JobProvider } from "@/features/jobs/providers/types";
import {
  booleanFrom,
  coerceTags,
  createJsonProvider,
  numberFrom,
  optionalEnv,
  publishedAtFrom,
  stringFrom,
} from "@/features/jobs/providers/providerFactory";

type RecordValue = Record<string, unknown>;

const readValue = (record: RecordValue, key: string): unknown => {
  if (!key.includes(".")) {
    return record[key];
  }
  return key.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as RecordValue)) {
      return (acc as RecordValue)[segment];
    }
    return undefined;
  }, record);
};

const buildProviderJob = (
  record: RecordValue,
  options: {
    externalIdKeys: string[];
    titleKeys: string[];
    companyKeys?: string[];
    locationKeys?: string[];
    descriptionKeys?: string[];
    categoryKeys?: string[];
    tagKeys?: string[];
    remoteKeys?: string[];
    salaryMinKeys?: string[];
    salaryMaxKeys?: string[];
    publishedAtKeys?: string[];
  }
) => {
  const pickString = (keys: string[] | undefined): string | undefined => {
    if (!keys) {
      return undefined;
    }
    for (const key of keys) {
      const value = stringFrom(readValue(record, key));
      if (value) {
        return value;
      }
    }
    return undefined;
  };

  const pickNumber = (keys: string[] | undefined): number | null => {
    if (!keys) {
      return null;
    }
    for (const key of keys) {
      const value = numberFrom(readValue(record, key));
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    return null;
  };

  const pickBoolean = (keys: string[] | undefined): boolean | undefined => {
    if (!keys) {
      return undefined;
    }
    for (const key of keys) {
      const value = readValue(record, key);
      if (value !== undefined) {
        return booleanFrom(value);
      }
    }
    return undefined;
  };

  const pickTags = (keys: string[] | undefined): string[] => {
    if (!keys) {
      return [];
    }
    return keys.flatMap((key) => coerceTags(readValue(record, key)));
  };

  const pickPublishedAt = (keys: string[] | undefined): string | undefined => {
    if (!keys) {
      return undefined;
    }
    for (const key of keys) {
      const raw = readValue(record, key);
      const value = publishedAtFrom(raw);
      if (value) {
        return value;
      }
    }
    return undefined;
  };

  const externalId = pickString(options.externalIdKeys);
  const title = pickString(options.titleKeys);

  if (!externalId || !title) {
    return null;
  }

  return {
    externalId,
    title,
    company: pickString(options.companyKeys) ?? "Entreprise confidentielle",
    location: pickString(options.locationKeys),
    description: pickString(options.descriptionKeys) ?? "",
    category: pickString(options.categoryKeys),
    tags: Array.from(new Set(pickTags(options.tagKeys))).slice(0, 8),
    remote: pickBoolean(options.remoteKeys),
    salaryMin: pickNumber(options.salaryMinKeys),
    salaryMax: pickNumber(options.salaryMaxKeys),
    publishedAt: pickPublishedAt(options.publishedAtKeys),
  };
};

const bearerHeaders = (tokenEnvKey: string) => {
  const token = optionalEnv(tokenEnvKey);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const frJobProviders: JobProvider[] = [
  createJsonProvider({
    id: "france-travail",
    label: "France Travail (ex Pôle emploi)",
    endpoint: optionalEnv("FRANCE_TRAVAIL_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["resultats"],
    query: { range: "0-199" },
    headers: () => bearerHeaders("FRANCE_TRAVAIL_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["id", "offerId"],
        titleKeys: ["intitule", "title"],
        companyKeys: ["entreprise.nom", "company", "organisation"],
        locationKeys: ["lieuTravail.libelle", "location", "city"],
        descriptionKeys: ["description", "descriptif", "texte"],
        categoryKeys: ["romeLibelle", "domain", "category"],
        tagKeys: ["competences", "skills", "tags"],
        remoteKeys: ["teletravail.libelle", "remote"],
        salaryMinKeys: ["salaire.min", "salaryMin"],
        salaryMaxKeys: ["salaire.max", "salaryMax"],
        publishedAtKeys: ["dateActualisation", "publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "apec",
    label: "APEC",
    endpoint: optionalEnv("APEC_API_URL"),
    defaultCategory: "operations",
    itemsPath: ["offers"],
    headers: () => bearerHeaders("APEC_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["offerId", "id"],
        titleKeys: ["title", "position"],
        companyKeys: ["companyName", "employer"],
        locationKeys: ["location", "city"],
        descriptionKeys: ["description", "body"],
        categoryKeys: ["function", "category"],
        tagKeys: ["skills", "keywords"],
        remoteKeys: ["isRemote"],
        salaryMinKeys: ["salaryMin", "minSalary"],
        salaryMaxKeys: ["salaryMax", "maxSalary"],
        publishedAtKeys: ["publicationDate"],
      }),
  }),
  createJsonProvider({
    id: "meteojob",
    label: "Meteojob",
    endpoint: optionalEnv("METEOJOB_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["data", "jobs"],
    headers: () => bearerHeaders("METEOJOB_API_KEY"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["jobId", "id"],
        titleKeys: ["title"],
        companyKeys: ["company"],
        locationKeys: ["city", "location"],
        descriptionKeys: ["description", "mission"],
        categoryKeys: ["category", "contract"],
        tagKeys: ["skills", "tags"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "hellowork",
    label: "HelloWork / RegionsJob",
    endpoint: optionalEnv("HELLOWORK_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: () => bearerHeaders("HELLOWORK_API_KEY"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["reference", "id"],
        titleKeys: ["title"],
        companyKeys: ["companyName"],
        locationKeys: ["city", "location"],
        descriptionKeys: ["description"],
        categoryKeys: ["vertical", "category"],
        tagKeys: ["skills", "technologies"],
        remoteKeys: ["isRemote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "welcometothejungle",
    label: "Welcome to the Jungle",
    endpoint: optionalEnv("WTTJ_API_URL"),
    defaultCategory: "product",
    itemsPath: ["offers"],
    headers: () => bearerHeaders("WTTJ_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["id", "slug"],
        titleKeys: ["title"],
        companyKeys: ["company", "organization"],
        locationKeys: ["office", "city"],
        descriptionKeys: ["description"],
        categoryKeys: ["team", "category"],
        tagKeys: ["skills", "tags", "stack"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "jobteaser",
    label: "JobTeaser",
    endpoint: optionalEnv("JOBTEASER_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["results"],
    headers: () => bearerHeaders("JOBTEASER_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["id", "offerId"],
        titleKeys: ["title"],
        companyKeys: ["companyName", "school"],
        locationKeys: ["city", "location"],
        descriptionKeys: ["description"],
        categoryKeys: ["category", "industry"],
        tagKeys: ["skills", "keywords"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "chooseyourboss",
    label: "ChooseYourBoss",
    endpoint: optionalEnv("CHOOSEYOURBOSS_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: () => bearerHeaders("CHOOSEYOURBOSS_API_KEY"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["id", "slug"],
        titleKeys: ["title"],
        companyKeys: ["company"],
        locationKeys: ["location", "city"],
        descriptionKeys: ["description", "missions"],
        categoryKeys: ["stack", "category"],
        tagKeys: ["stack", "skills"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin", "minSalary"],
        salaryMaxKeys: ["salaryMax", "maxSalary"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
  createJsonProvider({
    id: "monster-fr",
    label: "Monster France",
    endpoint: optionalEnv("MONSTER_FR_API_URL"),
    defaultCategory: "operations",
    itemsPath: ["jobList"],
    headers: () => bearerHeaders("MONSTER_FR_API_KEY"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["jobId", "id"],
        titleKeys: ["jobTitle", "title"],
        companyKeys: ["companyName"],
        locationKeys: ["location", "city"],
        descriptionKeys: ["jobDescription"],
        categoryKeys: ["jobCategory"],
        tagKeys: ["skills", "tags"],
        remoteKeys: ["isRemote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["datePosted"],
      }),
  }),
  createJsonProvider({
    id: "indeed-fr",
    label: "Indeed France",
    endpoint: optionalEnv("INDEED_FR_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["results"],
    headers: () => bearerHeaders("INDEED_FR_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["jobkey", "id"],
        titleKeys: ["jobtitle", "title"],
        companyKeys: ["company"],
        locationKeys: ["formattedLocation", "location"],
        descriptionKeys: ["snippet", "description"],
        categoryKeys: ["jobtype", "category"],
        tagKeys: ["skills", "tags"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin"],
        salaryMaxKeys: ["salaryMax"],
        publishedAtKeys: ["date"],
      }),
  }),
  createJsonProvider({
    id: "talent-io",
    label: "talent.io",
    endpoint: optionalEnv("TALENT_IO_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: () => bearerHeaders("TALENT_IO_API_TOKEN"),
    mapItem: (record) =>
      buildProviderJob(record, {
        externalIdKeys: ["id", "slug"],
        titleKeys: ["title"],
        companyKeys: ["company", "startup"],
        locationKeys: ["city", "location"],
        descriptionKeys: ["description"],
        categoryKeys: ["discipline", "category"],
        tagKeys: ["stack", "skills"],
        remoteKeys: ["remote"],
        salaryMinKeys: ["salaryMin", "minSalary"],
        salaryMaxKeys: ["salaryMax", "maxSalary"],
        publishedAtKeys: ["publishedAt"],
      }),
  }),
];

export { frJobProviders };
