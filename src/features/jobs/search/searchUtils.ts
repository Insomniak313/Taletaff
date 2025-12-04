import type { JobRecord, JobSearchSummary } from "@/types/job";

const SYNONYM_MAP: Record<string, string[]> = {
  pm: ["product manager", "chef de produit", "product lead"],
  dev: ["developpeur", "developer", "software engineer", "ingénieur"],
  tech: ["engineering", "backend", "frontend", "fullstack"],
  marketing: ["growth", "brand", "crm", "acquisition"],
  ops: ["operations", "chief of staff", "bizops"],
  remote: ["full remote", "télétravail"],
  data: ["analytics", "data engineer", "data scientist"],
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export const buildQueryTokens = (query?: string) => {
  if (!query) {
    return [];
  }

  const baseTokens = query
    .split(/[\s,/]+/)
    .map(normalize)
    .filter(Boolean);

  const tokens = new Set<string>();

  baseTokens.forEach((token) => {
    tokens.add(token);
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      synonyms.forEach((synonym) => tokens.add(normalize(synonym)));
    }
  });

  return Array.from(tokens);
};

const computeRecencyBoost = (createdAt: string) => {
  const RECENCY_WINDOW_DAYS = 21;
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (Date.now() - new Date(createdAt).getTime()) / millisecondsPerDay;

  if (!Number.isFinite(diffDays) || diffDays <= 0) {
    return 3;
  }

  if (diffDays >= RECENCY_WINDOW_DAYS) {
    return 0;
  }

  const ratio = (RECENCY_WINDOW_DAYS - diffDays) / RECENCY_WINDOW_DAYS;
  return ratio * 3;
};

const computeSalaryBoost = (job: JobRecord) => {
  const median = (job.salaryMin + job.salaryMax) / 2;

  if (!Number.isFinite(median) || median <= 0) {
    return 0;
  }

  if (median >= 100000) return 2.5;
  if (median >= 80000) return 2;
  if (median >= 60000) return 1.5;
  if (median >= 45000) return 1;
  return 0.5;
};

const computeScore = (job: JobRecord, tokens: string[]) => {
  const normalizedTitle = normalize(job.title);
  const normalizedCompany = normalize(job.company);
  const normalizedDescription = normalize(job.description);
  const normalizedLocation = normalize(job.location);
  const normalizedTags = job.tags.map(normalize);

  return (
    tokens.reduce((score, token) => {
      let accumulator = score;

      if (normalizedTitle.includes(token)) {
        accumulator += 6;
      }
      if (normalizedCompany.includes(token)) {
        accumulator += 4;
      }
      if (normalizedDescription.includes(token)) {
        accumulator += 2.5;
      }
      if (normalizedLocation.includes(token)) {
        accumulator += 3;
      }
      if (normalizedTags.some((tag) => tag.includes(token))) {
        accumulator += 5;
      }

      return accumulator;
    }, 0) +
    computeRecencyBoost(job.createdAt) +
    computeSalaryBoost(job) +
    (job.remote ? 1 : 0)
  );
};

export const scoreByRelevance = (jobs: JobRecord[], tokens: string[]) => {
  if (!tokens.length) {
    return jobs;
  }

  return jobs
    .map((job, index) => ({
      job,
      index,
      score: computeScore(job, tokens),
    }))
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.index - b.index;
      }
      return b.score - a.score;
    })
    .map((entry) => entry.job);
};

const emptySummary: JobSearchSummary = {
  count: 0,
  remoteShare: 0,
  salaryRange: { min: 0, max: 0 },
  topLocations: [],
  topTags: [],
};

export const buildJobSearchSummary = (jobs: JobRecord[]): JobSearchSummary => {
  if (!jobs.length) {
    return emptySummary;
  }

  let minSalary = Number.POSITIVE_INFINITY;
  let maxSalary = 0;
  let remoteCount = 0;

  const locationCount = new Map<string, number>();
  const tagCount = new Map<string, number>();

  jobs.forEach((job) => {
    if (job.salaryMin < minSalary) {
      minSalary = job.salaryMin;
    }
    if (job.salaryMax > maxSalary) {
      maxSalary = job.salaryMax;
    }
    if (job.remote) {
      remoteCount += 1;
    }

    if (job.location) {
      const current = locationCount.get(job.location) ?? 0;
      locationCount.set(job.location, current + 1);
    }

    job.tags.forEach((tag) => {
      const normalizedTag = tag.trim();
      if (!normalizedTag) {
        return;
      }
      const current = tagCount.get(normalizedTag) ?? 0;
      tagCount.set(normalizedTag, current + 1);
    });
  });

  return {
    count: jobs.length,
    remoteShare: remoteCount / jobs.length,
    salaryRange: {
      min: minSalary,
      max: maxSalary,
    },
    topLocations: Array.from(locationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count })),
    topTags: Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count })),
  };
};
