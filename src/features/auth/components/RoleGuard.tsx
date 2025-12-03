"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_HOME_ROUTE } from "@/config/roleRoutes";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
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
    if (!allowedRoles.includes(role)) {
      router.replace(ROLE_HOME_ROUTE[role]);
    }
  }, [allowedRoles, isLoading, role, router, session]);

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Chargement de votre session...</p>;
  }

  if (!session || !allowedRoles.includes(role)) {
    return <p className="p-6 text-sm text-slate-500">Redirection en cours...</p>;
  }

  return <>{children}</>;
};
