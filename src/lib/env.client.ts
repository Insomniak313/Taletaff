type ClientEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

const readClientEnv = (value: string | undefined, key: ClientEnvKey) => {
  if (!value) {
    throw new Error(`La variable d'environnement ${key} est manquante.`);
  }
  return value;
};

const normalizeUrl = (value: string) => {
  if (!value) {
    return value;
  }
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }
  return `https://${trimmed.replace(/\/$/, "")}`;
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

  if (process.env.NODE_ENV === "production") {
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
