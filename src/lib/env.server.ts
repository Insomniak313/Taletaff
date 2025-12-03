import { clientEnv } from "@/lib/env.client";

const readServerEnv = (key: "SUPABASE_SERVICE_ROLE_KEY") => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`La variable d'environnement ${key} est manquante.`);
  }
  return value;
};

export const serverEnv = {
  ...clientEnv,
  supabaseServiceRoleKey: readServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
