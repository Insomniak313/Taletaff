"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { UserRole } from "@/types/auth";

const client = supabaseBrowser();

export const useCurrentUser = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await client.auth.getSession();
      if (!isMounted) {
        return;
      }
      setSession(data.session ?? null);
      setIsLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const role = (session?.user.user_metadata?.role ?? "jobseeker") as UserRole;

  return { session, role, isLoading };
};
