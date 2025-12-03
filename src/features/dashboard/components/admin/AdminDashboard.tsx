"use client";

import { useCallback, useEffect, useState } from "react";
import type { JobProviderId } from "@/features/jobs/providers";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ScraperStatusPanel } from "@/features/dashboard/components/admin/ScraperStatusPanel";
import { UsersPanel } from "@/features/dashboard/components/admin/UsersPanel";
import { JobsPanel } from "@/features/dashboard/components/admin/JobsPanel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { AdminJobSummary, AdminUserSummary, ScraperStatusSummary } from "@/types/admin";

export const AdminDashboard = () => {
  const { session } = useCurrentUser();
  const [scrapers, setScrapers] = useState<ScraperStatusSummary[]>([]);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [jobs, setJobs] = useState<AdminJobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authorizedFetch = useCallback(
    async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
      if (!session) {
        throw new Error("Session manquante");
      }
      const response = await fetch(input, {
        ...(init ?? {}),
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Requête administrateur échouée");
      }
      return response.json() as Promise<T>;
    },
    [session]
  );

  const loadData = useCallback(async () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [scrapersData, usersData, jobsData] = await Promise.all([
        authorizedFetch<ScraperStatusSummary[]>("/api/admin/scrapers"),
        authorizedFetch<AdminUserSummary[]>("/api/admin/users"),
        authorizedFetch<AdminJobSummary[]>("/api/admin/jobs"),
      ]);
      setScrapers(scrapersData);
      setUsers(usersData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le tableau de bord admin");
    } finally {
      setIsLoading(false);
    }
  }, [authorizedFetch, session]);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [loadData, session]);

  const handleRunScraper = useCallback(
    async (providerId: JobProviderId) => {
      await authorizedFetch(`/api/admin/scrapers/run`, {
        method: "POST",
        body: JSON.stringify({ providerId }),
      });
      await loadData();
    },
    [authorizedFetch, loadData]
  );

  const handleSaveConfig = useCallback(
    async (providerId: JobProviderId, payload: { endpoint?: string; authToken?: string }) => {
      await authorizedFetch(`/api/admin/scrapers`, {
        method: "PATCH",
        body: JSON.stringify({ providerId, ...payload }),
      });
      await loadData();
    },
    [authorizedFetch, loadData]
  );

  return (
    <DashboardShell
      title="Console administrateur"
      description="Visualisez l'état des scrapers, surveillez les utilisateurs et contrôlez les offres."
    >
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <ScraperStatusPanel
        items={scrapers}
        isLoading={isLoading}
        onRun={handleRunScraper}
        onSaveConfig={handleSaveConfig}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <UsersPanel users={users} isLoading={isLoading} />
        <JobsPanel jobs={jobs} isLoading={isLoading} />
      </div>
    </DashboardShell>
  );
};
