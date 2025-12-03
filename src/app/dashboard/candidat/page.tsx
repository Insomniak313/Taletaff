import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { JobSeekerDashboard } from "@/features/dashboard/components/JobSeekerDashboard";

const CandidateDashboardPage = () => (
  <RoleGuard allowedRoles={["jobseeker"]}>
    <JobSeekerDashboard />
  </RoleGuard>
);

export default CandidateDashboardPage;
