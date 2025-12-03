type ClientEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SITE_URL"
  | "NEXT_PUBLIC_DEFAULT_REDIRECT";

const readClientEnv = (value: string | undefined, key: ClientEnvKey) => {
  if (!value) {
    throw new Error(`La variable d'environnement ${key} est manquante.`);
  }
  return value;
};

export const clientEnv = {
  supabaseUrl: readClientEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readClientEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),
  siteUrl: readClientEnv(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL"),
  defaultRedirect: readClientEnv(
    process.env.NEXT_PUBLIC_DEFAULT_REDIRECT,
    "NEXT_PUBLIC_DEFAULT_REDIRECT"
  ),
};
