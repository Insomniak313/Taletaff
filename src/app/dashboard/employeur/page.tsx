import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { EmployerDashboard } from "@/features/dashboard/components/EmployerDashboard";

const EmployerDashboardPage = () => (
  <RoleGuard allowedRoles={["employer"]}>
    <EmployerDashboard />
  </RoleGuard>
);

export default EmployerDashboardPage;
