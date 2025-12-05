import type { JobProvider, JobProviderSettings } from "@/features/jobs/providers/types";
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

const isNumericString = (value: string): boolean => /^-?\d+(\.\d+)?$/.test(value);

const publishedAtFromEpoch = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  if (typeof value === "string" && isNumericString(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return publishedAtFromEpoch(parsed);
    }
  }
  return publishedAtFrom(value);
};

const joinStrings = (parts: Array<string | undefined | null>): string | undefined => {
  const filtered = parts
    .map((part) => (typeof part === "string" ? part.trim() : undefined))
    .filter((part): part is string => Boolean(part));
  return filtered.length > 0 ? filtered.join(", ") : undefined;
};

const clampLimit = (value: number | undefined, max: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return max;
  }
  const normalized = Math.floor(value);
  if (normalized <= 0) {
    return 1;
  }
  return Math.min(normalized, max);
};

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stringFrom(entry))
      .filter((entry): entry is string => Boolean(entry));
  }
  const asStringValue = stringFrom(value);
  return asStringValue ? [asStringValue] : [];
};

const parseWeWorkRemotelyTitle = (value?: string): { company?: string; role?: string } => {
  if (!value) {
    return {};
  }
  const [maybeCompany, ...rest] = value.split(":");
  if (rest.length === 0) {
    return { role: value.trim() };
  }
  return {
    company: maybeCompany.trim(),
    role: rest.join(":").trim(),
  };
};

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

const bearerHeaders =
  (tokenEnvKey: string) =>
  (settings?: JobProviderSettings): Record<string, string> | undefined => {
    const token = settings?.authToken ?? optionalEnv(tokenEnvKey);
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

const frJobProviders: JobProvider[] = [
  createJsonProvider({
    id: "france-travail",
    label: "France Travail (ex Pôle emploi)",
    language: "fr",
    endpoint: optionalEnv("FRANCE_TRAVAIL_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["resultats"],
    maxBatchSize: 200,
    pagination: { mode: "page", maxPages: 10 },
    buildQuery: (context) => {
      const limit = clampLimit(context.limit, 200);
      const page = context.page ?? 1;
      const normalizedPage = page < 1 ? 1 : Math.floor(page);
      const start = (normalizedPage - 1) * limit;
      const end = start + limit - 1;
      return { range: `${start}-${end}` };
    },
    headers: bearerHeaders("FRANCE_TRAVAIL_API_TOKEN"),
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
    language: "fr",
    endpoint: optionalEnv("APEC_API_URL"),
    defaultCategory: "operations",
    itemsPath: ["offers"],
    headers: bearerHeaders("APEC_API_TOKEN"),
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
    language: "fr",
    endpoint: optionalEnv("METEOJOB_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["data", "jobs"],
    headers: bearerHeaders("METEOJOB_API_KEY"),
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
    language: "fr",
    endpoint: optionalEnv("HELLOWORK_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: bearerHeaders("HELLOWORK_API_KEY"),
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
    language: "fr",
    endpoint: optionalEnv("WTTJ_API_URL"),
    defaultCategory: "product",
    itemsPath: ["offers"],
    headers: bearerHeaders("WTTJ_API_TOKEN"),
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
    language: "fr",
    endpoint: optionalEnv("JOBTEASER_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["results"],
    headers: bearerHeaders("JOBTEASER_API_TOKEN"),
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
    language: "fr",
    endpoint: optionalEnv("CHOOSEYOURBOSS_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: bearerHeaders("CHOOSEYOURBOSS_API_KEY"),
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
    language: "fr",
    endpoint: optionalEnv("MONSTER_FR_API_URL"),
    defaultCategory: "operations",
    itemsPath: ["jobList"],
    headers: bearerHeaders("MONSTER_FR_API_KEY"),
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
    language: "fr",
    endpoint: optionalEnv("INDEED_FR_API_URL"),
    defaultCategory: "marketing",
    itemsPath: ["results"],
    headers: bearerHeaders("INDEED_FR_API_TOKEN"),
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
    language: "fr",
    endpoint: optionalEnv("TALENT_IO_API_URL"),
    defaultCategory: "engineering",
    itemsPath: ["jobs"],
    headers: bearerHeaders("TALENT_IO_API_TOKEN"),
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
  createJsonProvider({
    id: "arbeitnow",
    label: "Arbeitnow",
    language: "de",
    endpoint: optionalEnv("ARBEITNOW_API_URL") ?? "https://www.arbeitnow.com/api/job-board-api",
    defaultCategory: "engineering",
    itemsPath: ["data", "jobs"],
    maxBatchSize: 100,
    pagination: { mode: "page", maxPages: 10 },
    buildQuery: (context) => {
      const limit = clampLimit(context.limit, 100);
      const page = context.page ?? 1;
      const normalizedPage = page < 1 ? 1 : Math.floor(page);
      return {
        page: normalizedPage,
        per_page: limit,
      };
    },
    mapItem: (record) => {
      const externalId = stringFrom(record.slug);
      const title = stringFrom(record.title);
      if (!externalId || !title) {
        return null;
      }
      const jobTypes = asStringArray(record.job_types ?? record.types);
      const tags = Array.from(new Set([...coerceTags(record.tags), ...jobTypes])).slice(0, 8);
      return {
        externalId,
        title,
        company: stringFrom(record.company_name) ?? "Entreprise confidentielle",
        location: stringFrom(record.location),
        description: stringFrom(record.description) ?? "",
        category: jobTypes[0],
        tags,
        remote: record.remote !== undefined ? booleanFrom(record.remote) : undefined,
        salaryMin: numberFrom(record.salary_min) ?? null,
        salaryMax: numberFrom(record.salary_max) ?? null,
        publishedAt: publishedAtFromEpoch(record.created_at) ?? publishedAtFrom(record.updated_at),
      };
    },
  }),
  createJsonProvider({
    id: "jobicy",
    label: "Jobicy",
    language: "en",
    endpoint: optionalEnv("JOBICY_API_URL") ?? "https://jobicy.com/api/v2/remote-jobs",
    defaultCategory: "operations",
    itemsPath: ["jobs"],
    mapItem: (record) => {
      const externalId = stringFrom(record.jobSlug) ?? stringFrom(record.id);
      const title = stringFrom(record.jobTitle);
      if (!externalId || !title) {
        return null;
      }
      const industryTags = asStringArray(record.jobIndustry);
      const jobTypes = asStringArray(record.jobType);
      const levels = asStringArray(record.jobLevel);
      const tags = Array.from(new Set([...industryTags, ...jobTypes, ...levels])).slice(0, 8);
      return {
        externalId,
        title,
        company: stringFrom(record.companyName) ?? "Entreprise confidentielle",
        location: stringFrom(record.jobGeo),
        description: stringFrom(record.jobDescription) ?? "",
        category: industryTags[0],
        tags,
        remote: true,
        salaryMin: numberFrom(record.salaryMin) ?? null,
        salaryMax: numberFrom(record.salaryMax) ?? null,
        publishedAt: publishedAtFrom(record.pubDate ?? record.postedDate ?? record.createdAt),
      };
    },
  }),
  createJsonProvider({
    id: "remoteok",
    label: "RemoteOK",
    language: "en",
    endpoint: optionalEnv("REMOTEOK_API_URL") ?? "https://remoteok.com/api",
    defaultCategory: "engineering",
    mapItem: (record) => {
      const externalId = stringFrom(record.id) ?? stringFrom(record.slug);
      const title = stringFrom(record.position) ?? stringFrom(record.title);
      if (!externalId || !title || typeof record !== "object") {
        return null;
      }
      const company = stringFrom((record as RecordValue).company);
      if (!company) {
        return null;
      }
      return {
        externalId,
        title,
        company,
        location: stringFrom((record as RecordValue).location),
        description: stringFrom((record as RecordValue).description) ?? "",
        category: stringFrom((record as RecordValue).category),
        tags: coerceTags((record as RecordValue).tags),
        remote: true,
        salaryMin: numberFrom((record as RecordValue).salary_min) ?? null,
        salaryMax: numberFrom((record as RecordValue).salary_max) ?? null,
        publishedAt: publishedAtFrom((record as RecordValue).date),
      };
    },
  }),
  createJsonProvider({
    id: "thehub",
    label: "The Hub",
    language: "en",
    endpoint: optionalEnv("THEHUB_API_URL") ?? "https://thehub.io/api/jobs",
    defaultCategory: "product",
    itemsPath: ["docs"],
    mapItem: (record) => {
      const externalId = stringFrom(record.id);
      const title = stringFrom(record.title);
      if (!externalId || !title) {
        return null;
      }
      const industries = asStringArray(record.industries);
      const company = record.company as RecordValue | undefined;
      const perks = Array.isArray(record.perks)
        ? (record.perks as RecordValue[]).map((perk) => stringFrom(perk.name)).filter((perk): perk is string => Boolean(perk))
        : [];
      const tags = Array.from(new Set([...industries, ...perks])).slice(0, 8);
      const location = record.location as RecordValue | undefined;
      return {
        externalId,
        title,
        company: stringFrom(company?.name) ?? "Entreprise confidentielle",
        location: joinStrings([
          stringFrom(location?.address),
          stringFrom(location?.locality),
          stringFrom(location?.country),
        ]),
        description: stringFrom(record.description) ?? "",
        category: industries[0],
        tags,
        remote: record.isRemote !== undefined ? booleanFrom(record.isRemote) : undefined,
        publishedAt: publishedAtFrom(record.publishedAt ?? record.createdAt),
      };
    },
  }),
  createJsonProvider({
    id: "weworkremotely",
    label: "We Work Remotely (RSS)",
    language: "en",
    endpoint: optionalEnv("WEWORKREMOTELY_API_URL") ?? "https://api.rss2json.com/v1/api.json",
    defaultCategory: "engineering",
    itemsPath: ["items"],
    query: {
      rss_url: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    },
    mapItem: (record) => {
      const { company, role } = parseWeWorkRemotelyTitle(stringFrom(record.title));
      const externalId = stringFrom(record.guid) ?? stringFrom(record.link);
      const title = role ?? stringFrom(record.title);
      if (!externalId || !title) {
        return null;
      }
      const description = stringFrom(record.content) ?? stringFrom(record.description) ?? "";
      const categories = coerceTags(record.categories);
      return {
        externalId,
        title,
        company: company ?? "Entreprise confidentielle",
        location: "Remote",
        description,
        category: categories[0],
        tags: categories,
        remote: true,
        publishedAt: publishedAtFrom(record.pubDate),
      };
    },
  }),
  createJsonProvider({
    id: "hackernews-jobs",
    label: "Hacker News Jobs",
    language: "en",
    endpoint:
      optionalEnv("HACKERNEWS_JOBS_API_URL") ??
      "https://hn.algolia.com/api/v1/search_by_date",
    defaultCategory: "engineering",
    query: {
      tags: "story,job",
    },
    itemsPath: ["hits"],
    mapItem: (record) => {
      const externalId = stringFrom(record.objectID);
      const title = stringFrom(record.title);
      if (!externalId || !title) {
        return null;
      }
      const tags = asStringArray(record._tags);
      const description =
        stringFrom(record.story_text) ??
        stringFrom(record.comment_text) ??
        stringFrom(record.url) ??
        "";
      return {
        externalId,
        title,
        company: stringFrom(record.author) ?? "Entreprise confidentielle",
        description,
        category: tags[0],
        tags,
        remote: title.toLowerCase().includes("remote") ? true : undefined,
        publishedAt: publishedAtFrom(record.created_at),
      };
    },
  }),
  createJsonProvider({
    id: "headhunter",
    label: "HeadHunter",
    language: "ru",
    endpoint: optionalEnv("HEADHUNTER_API_URL") ?? "https://api.hh.ru/vacancies",
    defaultCategory: "operations",
    maxBatchSize: 100,
    pagination: { mode: "page", startPage: 0, maxPages: 10 },
    query: {
      order_by: "publication_time",
    },
    buildQuery: (context) => {
      const limit = clampLimit(context.limit, 100);
      const page = context.page ?? 0;
      const normalizedPage = page < 0 ? 0 : Math.floor(page);
      return {
        per_page: limit,
        page: normalizedPage,
      };
    },
    itemsPath: ["items"],
    mapItem: (record) => {
      const externalId = stringFrom(record.id);
      const title = stringFrom(record.name);
      if (!externalId || !title) {
        return null;
      }
      const salary = record.salary as RecordValue | undefined;
      const employer = record.employer as RecordValue | undefined;
      const address = record.address as RecordValue | undefined;
      const area = record.area as RecordValue | undefined;
      const parentArea = area?.parent as RecordValue | undefined;
      const snippet = record.snippet as RecordValue | undefined;
      const professionalRoles = Array.isArray(record.professional_roles)
        ? (record.professional_roles as RecordValue[]).map((role) => stringFrom(role.name)).filter((role): role is string => Boolean(role))
        : [];
      const schedules = Array.isArray(record.work_schedule_by_days)
        ? (record.work_schedule_by_days as RecordValue[]).map((entry) => stringFrom(entry.name)).filter((entry): entry is string => Boolean(entry))
        : [];
      const workFormats = Array.isArray(record.work_format) ? (record.work_format as RecordValue[]) : [];
      const remote = workFormats.some((format) => stringFrom(format.id)?.toLowerCase().includes("remote"));
      const requirement = stringFrom(snippet?.requirement);
      const responsibility = stringFrom(snippet?.responsibility);
      return {
        externalId,
        title,
        company: stringFrom(employer?.name) ?? "Entreprise confidentielle",
        location:
          stringFrom(address?.city) ??
          stringFrom(area?.name) ??
          stringFrom(parentArea?.name),
        description: [requirement, responsibility].filter(Boolean).join("\n\n"),
        category: professionalRoles[0],
        tags: Array.from(new Set([...professionalRoles, ...schedules])).slice(0, 8),
        remote: remote ? true : undefined,
        salaryMin: salary ? numberFrom(salary.from) ?? null : null,
        salaryMax: salary ? numberFrom(salary.to) ?? null : null,
        publishedAt: publishedAtFrom(record.published_at),
      };
    },
  }),
  createJsonProvider({
    id: "torre",
    label: "Torre",
    language: "es",
    endpoint: optionalEnv("TORRE_API_URL") ?? "https://search.torre.co/opportunities/_search/",
    defaultCategory: "product",
    method: "POST",
    maxBatchSize: 50,
    pagination: { mode: "page", startPage: 0, maxPages: 10 },
    body: (context) => {
      const size = clampLimit(context.limit, 50);
      const page = context.page ?? 0;
      const normalizedPage = page < 0 ? 0 : Math.floor(page);
      return {
        size,
        offset: normalizedPage * size,
        aggregate: false,
        "skill/role": {
          text: "developer",
          experience: "potential-to-develop",
        },
      };
    },
    itemsPath: ["results"],
    mapItem: (record) => {
      const externalId = stringFrom(record.id);
      const title = stringFrom(record.objective) ?? stringFrom(record.tagline);
      if (!externalId || !title) {
        return null;
      }
      const organizations = Array.isArray(record.organizations) ? (record.organizations as RecordValue[]) : [];
      const place = record.place as RecordValue | undefined;
      const skills = Array.isArray(record.skills)
        ? (record.skills as RecordValue[]).map((skill) => stringFrom(skill.name)).filter((skill): skill is string => Boolean(skill))
        : [];
      const serviceTypes = asStringArray(record.serviceTypes);
      const compensation = (record.compensation as RecordValue | undefined)?.data as RecordValue | undefined;
      const rawLocations = Array.isArray(place?.location) ? (place?.location as unknown[]) : [];
      const locations = rawLocations
        .map((entry) => stringFrom(entry))
        .filter((entry): entry is string => Boolean(entry));
      return {
        externalId,
        title,
        company: stringFrom(organizations[0]?.name) ?? "Entreprise confidentielle",
        location: joinStrings(locations),
        description: stringFrom(record.tagline) ?? "",
        category: stringFrom(record.commitment),
        tags: Array.from(new Set([...skills, ...serviceTypes])).slice(0, 8),
        remote: place?.remote === true || place?.locationType === "remote_anywhere",
        salaryMin: compensation ? numberFrom(compensation.minAmount) ?? null : null,
        salaryMax: compensation ? numberFrom(compensation.maxAmount) ?? null : null,
        publishedAt: publishedAtFrom(record.created),
      };
    },
  }),
  createJsonProvider({
    id: "zippia",
    label: "Zippia",
    language: "en",
    endpoint: optionalEnv("ZIPPIA_API_URL") ?? "https://www.zippia.com/api/jobs/",
    defaultCategory: "engineering",
    method: "POST",
    headers: () => ({
      "user-agent": "Mozilla/5.0",
    }),
    body: (context) => ({
      companySkills: false,
      dismissedListingHashes: [],
      fetchJobDesc: true,
      jobTitle: "Software Engineer",
      locations: [],
      numJobs: Math.min(Math.max(context.limit ?? 20, 1), 50),
      previousListingHashes: [],
    }),
    itemsPath: ["jobs"],
    mapItem: (record) => {
      const externalId = stringFrom(record.jobId) ?? stringFrom(record.listingHash);
      const title = stringFrom(record.jobTitle);
      if (!externalId || !title) {
        return null;
      }
      const tags = coerceTags(record.jobTags ?? record.jobLevels ?? []);
      const unifiedSalary = numberFrom(record.unifiedZippiaSalary);
      const remote =
        tags.some((tag) => tag.toLowerCase().includes("remote")) ||
        stringFrom(record.location)?.toLowerCase().includes("remote");
      return {
        externalId,
        title,
        company: stringFrom(record.companyName) ?? "Entreprise confidentielle",
        location: stringFrom(record.location) ?? stringFrom(record.OBJcity),
        description: stringFrom(record.jobDescription) ?? "",
        category: stringFrom(record.OBJindustry) ?? tags[0],
        tags,
        remote: remote ? true : undefined,
        salaryMin: unifiedSalary ?? null,
        salaryMax: unifiedSalary ?? null,
        publishedAt:
          publishedAtFrom(record.postingDate) ??
          publishedAtFrom(record.OBJpostingDate) ??
          publishedAtFrom(record.postedDate),
      };
    },
  }),
  createJsonProvider({
    id: "themuse",
    label: "The Muse",
    language: "en",
    endpoint: optionalEnv("THEMUSE_API_URL") ?? "https://www.themuse.com/api/public/jobs",
    defaultCategory: "operations",
    maxBatchSize: 20,
    pagination: { mode: "page", maxPages: 10 },
    buildQuery: (context) => {
      const page = context.page ?? 1;
      const normalizedPage = page < 1 ? 1 : Math.floor(page);
      return { page: normalizedPage };
    },
    itemsPath: ["results"],
    mapItem: (record) => {
      const externalId = stringFrom(record.id);
      const title = stringFrom(record.name);
      if (!externalId || !title) {
        return null;
      }
      const categories = Array.isArray(record.categories)
        ? (record.categories as RecordValue[]).map((category) => stringFrom(category.name)).filter((category): category is string => Boolean(category))
        : [];
      const levels = Array.isArray(record.levels)
        ? (record.levels as RecordValue[]).map((level) => stringFrom(level.name)).filter((level): level is string => Boolean(level))
        : [];
      const locations = Array.isArray(record.locations)
        ? (record.locations as RecordValue[]).map((location) => stringFrom(location.name)).filter((location): location is string => Boolean(location))
        : [];
      const tags = Array.from(new Set([...categories, ...levels])).slice(0, 8);
      const locationLabel = locations.length > 0 ? locations.join(" · ") : undefined;
      const remote = locations.some((location) => location.toLowerCase().includes("remote"));
      const company = record.company as RecordValue | undefined;
      return {
        externalId,
        title,
        company: stringFrom(company?.name) ?? "Entreprise confidentielle",
        location: locationLabel,
        description: stringFrom(record.contents) ?? "",
        category: categories[0],
        tags,
        remote: remote ? true : undefined,
        publishedAt: publishedAtFrom(record.publication_date),
      };
    },
  }),
];

export { frJobProviders };
