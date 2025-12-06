type ClientEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

const readClientEnv = (value: string | undefined, key: ClientEnvKey) => {
  if (!value) {
    throw new Error(`La variable d'environnement ${key} est manquante.`);
  }
  return value;
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  const withoutTrailingSlash = trimmed.replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return withoutTrailingSlash;
  }
  return `https://${withoutTrailingSlash}`;
};

const resolveSiteUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.trim()) {
    return normalizeUrl(explicit);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl?.trim()) {
    return normalizeUrl(vercelUrl);
  }

  const runtimeEnv = process.env.NEXT_RUNTIME_ENV ?? process.env.NODE_ENV;
  if (runtimeEnv === "production") {
    return "https://taletaff.vercel.app";
  }

  return "http://localhost:3000";
};

const resolveDefaultRedirect = (siteUrl: string) => {
  const explicit = process.env.NEXT_PUBLIC_DEFAULT_REDIRECT;
  if (explicit?.trim()) {
    return normalizeUrl(explicit);
  }
  return `${siteUrl.replace(/\/$/, "")}/auth/callback`;
};

const siteUrl = resolveSiteUrl();

export const clientEnv = {
  supabaseUrl: readClientEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readClientEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),
  siteUrl,
  defaultRedirect: resolveDefaultRedirect(siteUrl),
};
