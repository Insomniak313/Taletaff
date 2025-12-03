type ClientEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SITE_URL"
  | "NEXT_PUBLIC_DEFAULT_REDIRECT";

const readClientEnv = (key: ClientEnvKey) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`La variable d'environnement ${key} est manquante.`);
  }
  return value;
};

export const clientEnv = {
  supabaseUrl: readClientEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readClientEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  siteUrl: readClientEnv("NEXT_PUBLIC_SITE_URL"),
  defaultRedirect: readClientEnv("NEXT_PUBLIC_DEFAULT_REDIRECT"),
};
