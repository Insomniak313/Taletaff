"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_HOME_ROUTE } from "@/config/roleRoutes";

const DashboardIndex = () => {
  const { session, role, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!session) {
      router.replace("/login");
      return;
    }
    router.replace(ROLE_HOME_ROUTE[role]);
  }, [isLoading, role, router, session]);

  return <p className="p-6 text-sm text-slate-500">Préparation de votre espace personnalisé...</p>;
};

export default DashboardIndex;
