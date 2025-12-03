import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { optionalEnv } from "@/features/jobs/providers/providerFactory";
import type { JobProviderId, JobProviderSettings } from "@/features/jobs/providers/types";

const TABLE_NAME = "job_provider_config";
type ConfigClient = SupabaseClient<Record<string, unknown>, "public">;

type ProviderConfigRow = {
  provider: JobProviderId;
  endpoint: string | null;
  auth_token: string | null;
  headers: Record<string, string> | null;
};

type ProviderEnvKeys = {
  endpoint?: string;
  token?: string;
};

const PROVIDER_ENV_KEYS: Record<JobProviderId, ProviderEnvKeys> = {
  "france-travail": { endpoint: "FRANCE_TRAVAIL_API_URL", token: "FRANCE_TRAVAIL_API_TOKEN" },
  apec: { endpoint: "APEC_API_URL", token: "APEC_API_TOKEN" },
  meteojob: { endpoint: "METEOJOB_API_URL", token: "METEOJOB_API_KEY" },
  hellowork: { endpoint: "HELLOWORK_API_URL", token: "HELLOWORK_API_KEY" },
  welcometothejungle: { endpoint: "WTTJ_API_URL", token: "WTTJ_API_TOKEN" },
  jobteaser: { endpoint: "JOBTEASER_API_URL", token: "JOBTEASER_API_TOKEN" },
  chooseyourboss: { endpoint: "CHOOSEYOURBOSS_API_URL", token: "CHOOSEYOURBOSS_API_KEY" },
  "monster-fr": { endpoint: "MONSTER_FR_API_URL", token: "MONSTER_FR_API_KEY" },
  "indeed-fr": { endpoint: "INDEED_FR_API_URL", token: "INDEED_FR_API_TOKEN" },
  "talent-io": { endpoint: "TALENT_IO_API_URL", token: "TALENT_IO_API_TOKEN" },
};

const readEnvDefaults = (provider: JobProviderId): JobProviderSettings => {
  const keys = PROVIDER_ENV_KEYS[provider];
  return {
    endpoint: keys?.endpoint ? optionalEnv(keys.endpoint) : undefined,
    authToken: keys?.token ? optionalEnv(keys.token) : undefined,
  };
};

const mergeSettings = (
  defaults: JobProviderSettings,
  overrides?: JobProviderSettings
): JobProviderSettings => {
  if (!overrides) {
    return defaults;
  }
  return {
    endpoint: overrides.endpoint ?? defaults.endpoint,
    authToken: overrides.authToken ?? defaults.authToken,
    headers: {
      ...(defaults.headers ?? {}),
      ...(overrides.headers ?? {}),
    },
    metadata: {
      ...(defaults.metadata ?? {}),
      ...(overrides.metadata ?? {}),
    },
  };
};

const rowToSettings = (row?: ProviderConfigRow | null): JobProviderSettings | undefined => {
  if (!row) {
    return undefined;
  }
  return {
    endpoint: row.endpoint ?? undefined,
    authToken: row.auth_token ?? undefined,
    headers: row.headers ?? undefined,
  };
};

const fetchRows = async (client: ConfigClient) => {
  const { data, error } = await client.from(TABLE_NAME).select("provider,endpoint,auth_token,headers");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as ProviderConfigRow[];
};

export const providerConfigStore = {
  PROVIDER_ENV_KEYS,
  async fetchSettingsMap(client: ConfigClient = supabaseAdmin()) {
    const [rows] = await Promise.all([fetchRows(client)]);
    const entries = rows.map((row) => {
      const defaults = readEnvDefaults(row.provider);
      const overrides = rowToSettings(row);
      return [row.provider, mergeSettings(defaults, overrides)] as const;
    });
    const defaultsOnly = Object.entries(PROVIDER_ENV_KEYS).map(([providerId]) => {
      const typedId = providerId as JobProviderId;
      if (entries.find(([id]) => id === typedId)) {
        return null;
      }
      return [typedId, readEnvDefaults(typedId)] as const;
    });
    const filteredDefaults = defaultsOnly.filter((entry): entry is [JobProviderId, JobProviderSettings] => Boolean(entry));
    return Object.fromEntries([...entries, ...filteredDefaults]) as Record<JobProviderId, JobProviderSettings>;
  },
  async fetchSettings(providerId: JobProviderId, client: ConfigClient = supabaseAdmin()) {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select("provider,endpoint,auth_token,headers")
      .eq("provider", providerId)
      .single();
    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }
    return mergeSettings(readEnvDefaults(providerId), rowToSettings(data));
  },
  async upsertSettings(
    providerId: JobProviderId,
    patch: Partial<Pick<ProviderConfigRow, "endpoint" | "auth_token" | "headers">>,
    client: ConfigClient = supabaseAdmin()
  ) {
    const payload = {
      provider: providerId,
      ...patch,
    };
    const { error } = await client.from(TABLE_NAME).upsert(payload as never, { onConflict: "provider" });
    if (error) {
      throw new Error(error.message);
    }
    return this.fetchSettings(providerId, client);
  },
};
