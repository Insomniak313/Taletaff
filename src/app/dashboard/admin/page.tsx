import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { AdminDashboard } from "@/features/dashboard/components/admin/AdminDashboard";

const AdminDashboardPage = () => (
  <RoleGuard allowedRoles={["admin"]}>
    <AdminDashboard />
  </RoleGuard>
);

export default AdminDashboardPage;
