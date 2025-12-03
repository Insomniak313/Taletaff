import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env.client";

export const supabaseBrowser = () =>
  createClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
