import type { JobProviderId } from "@/features/jobs/providers";
import type { UserRole } from "@/types/auth";

export interface ScraperStatusSummary {
  providerId: JobProviderId;
  label: string;
  status: string;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  error: string | null;
  jobCount: number;
  settings: {
    endpoint?: string;
    hasAuthToken: boolean;
  };
}

export interface AdminUserSummary {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminJobSummary {
  id: string;
  title: string;
  company: string;
  source: JobProviderId;
  createdAt: string;
}
