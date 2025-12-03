import type {
  JobProvider,
  JobProviderContext,
  JobProviderId,
  JobProviderSettings,
  ProviderJob,
} from "@/features/jobs/providers/types";

const DEFAULT_TIMEOUT_MS = 12000;

type JsonItemsPath = string[];

type JsonProviderDefinition = {
  id: JobProviderId;
  label: string;
  endpoint?: string;
  defaultCategory: string;
  method?: "GET" | "POST";
  query?: Record<string, string | number | undefined>;
  buildQuery?: (context: JobProviderContext) => Record<string, string | number | undefined>;
  headers?: (settings?: JobProviderSettings) => Record<string, string | undefined> | undefined;
  body?: Record<string, unknown> | ((context: JobProviderContext) => Record<string, unknown>);
  itemsPath?: JsonItemsPath;
  maxBatchSize?: number;
  mapItem: (record: Record<string, unknown>) => ProviderJob | null;
};

const extractFromPath = (payload: unknown, path: JsonItemsPath = []): unknown => {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
};

const resolveItems = (payload: unknown, path?: JsonItemsPath): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }
  const value = path ? extractFromPath(payload, path) : payload;
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
};

const fetchJsonWithTimeout = async (url: string, init: RequestInit): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(`Requête ${url} échouée (${response.status}): ${message}`);
    }
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timeout);
  }
};

export const optionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createJsonProvider = (definition: JsonProviderDefinition): JobProvider => {
  const normalizeHeaders = (
    value?: Record<string, string | undefined> | undefined
  ): Record<string, string> | undefined => {
    if (!value) {
      return undefined;
    }
    const entries = Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    );
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  };

  const resolveEndpoint = (settings?: JobProviderSettings): string | undefined => {
    return settings?.endpoint ?? definition.endpoint;
  };

  return {
    id: definition.id,
    label: definition.label,
    defaultCategory: definition.defaultCategory,
    maxBatchSize: definition.maxBatchSize ?? 200,
    isConfigured: (settings) => Boolean(resolveEndpoint(settings)),
    async fetchJobs(context, settings) {
      const endpoint = resolveEndpoint(settings);
      if (!endpoint) {
        return [];
      }

      const url = new URL(endpoint);
      const finalQuery = {
        ...(definition.query ?? {}),
        ...(definition.buildQuery ? definition.buildQuery(context) : {}),
      };

      Object.entries(finalQuery).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        url.searchParams.set(key, String(value));
      });

      const method = definition.method ?? "GET";
      const baseHeaders = definition.headers ? definition.headers(settings) : undefined;
      const authHeaders = settings?.authToken ? { Authorization: `Bearer ${settings.authToken}` } : undefined;
      const mergedHeaders = {
        ...(baseHeaders ?? {}),
        ...(authHeaders ?? {}),
        ...(settings?.headers ?? {}),
      };
      const headers: HeadersInit | undefined = normalizeHeaders(mergedHeaders);
      const bodyPayload =
        typeof definition.body === "function" ? definition.body(context) : definition.body;

      const init: RequestInit = {
        method,
        headers: bodyPayload && method !== "GET"
          ? { "content-type": "application/json", ...(headers ?? {}) }
          : headers,
        body: bodyPayload && method !== "GET" ? JSON.stringify(bodyPayload) : undefined,
      };

      const payload = await fetchJsonWithTimeout(url.toString(), init);
      const items = resolveItems(payload, definition.itemsPath);
      return items
        .map((record) => definition.mapItem(record))
        .filter((job): job is ProviderJob => Boolean(job));
    },
  };
};

export const stringFrom = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

export const numberFrom = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const booleanFrom = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "oui", "yes"].includes(value.toLowerCase());
  }
  return value === 1;
};

export const coerceTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => stringFrom(entry))
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === "string") {
    return value
      .split(/[,;/]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

export const publishedAtFrom = (value: unknown): string | undefined => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }
  return undefined;
};
