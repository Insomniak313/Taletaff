import { supabaseBrowser } from "@/lib/supabase/browser";
import { clientEnv } from "@/lib/env.client";
import type {
  AuthCredentials,
  ForgotPasswordPayload,
  SignUpPayload,
} from "@/types/auth";

const client = supabaseBrowser();

export const authService = {
  async signIn(credentials: AuthCredentials) {
    const { error } = await client.auth.signInWithPassword(credentials);

    if (error) {
      throw new Error(error.message);
    }
  },
  async signUp(payload: SignUpPayload) {
    const { error } = await client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          category_preferences: payload.categoryPreferences,
          role: payload.role,
        },
        emailRedirectTo: clientEnv.defaultRedirect,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },
  async resetPassword({ email, redirectTo }: ForgotPasswordPayload) {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? clientEnv.defaultRedirect,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
