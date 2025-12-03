import type { UserRole } from "@/types/auth";

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  jobseeker: "/dashboard/candidat",
  employer: "/dashboard/employeur",
  moderator: "/dashboard/moderation",
  admin: "/dashboard/admin",
};
