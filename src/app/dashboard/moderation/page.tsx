import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { ModeratorDashboard } from "@/features/dashboard/components/ModeratorDashboard";

const ModeratorDashboardPage = () => (
  <RoleGuard allowedRoles={["moderator"]}>
    <ModeratorDashboard />
  </RoleGuard>
);

export default ModeratorDashboardPage;
