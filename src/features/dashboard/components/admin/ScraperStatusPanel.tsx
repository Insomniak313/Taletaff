"use client";

import { useEffect, useState } from "react";
import type { JobProviderId } from "@/features/jobs/providers";
import type { ScraperStatusSummary } from "@/types/admin";

interface ScraperStatusPanelProps {
  items: ScraperStatusSummary[];
  onRun: (providerId: JobProviderId) => Promise<void>;
  onSaveConfig: (providerId: JobProviderId, payload: { endpoint?: string; authToken?: string }) => Promise<void>;
  isLoading: boolean;
  onRunAll: () => Promise<void>;
}

type FormState = Record<JobProviderId, { endpoint: string; authToken: string }>;

const statusClasses: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  running: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  idle: "bg-slate-100 text-slate-700",
  skipped: "bg-slate-100 text-slate-700",
  disabled: "bg-slate-100 text-slate-500",
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const ScraperStatusPanel = ({
  items,
  onRun,
  onSaveConfig,
  onRunAll,
  isLoading,
}: ScraperStatusPanelProps) => {
  const [formValues, setFormValues] = useState<FormState>({} as FormState);
  const [saving, setSaving] = useState<Record<JobProviderId, boolean>>({} as Record<JobProviderId, boolean>);
  const [running, setRunning] = useState<Record<JobProviderId, boolean>>({} as Record<JobProviderId, boolean>);
  const [feedback, setFeedback] = useState<Record<JobProviderId, string | null>>({} as Record<JobProviderId, string | null>);
  const [runningAll, setRunningAll] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  useEffect(() => {
    const next: FormState = {} as FormState;
    items.forEach((item) => {
      next[item.providerId] = {
        endpoint: item.settings.endpoint ?? "",
        authToken: "",
      };
    });
    setFormValues(next);
    setFeedback({} as Record<JobProviderId, string | null>);
  }, [items]);

  const updateField = (providerId: JobProviderId, field: keyof FormState[JobProviderId], value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (providerId: JobProviderId) => {
    const values = formValues[providerId];
    if (!values) {
      return;
    }
    setSaving((prev) => ({ ...prev, [providerId]: true }));
    setFeedback((prev) => ({ ...prev, [providerId]: null }));
    try {
      await onSaveConfig(providerId, {
        endpoint: values.endpoint?.trim() || undefined,
        authToken: values.authToken?.trim() || undefined,
      });
      setFeedback((prev) => ({ ...prev, [providerId]: "Configuration enregistrée." }));
      setFormValues((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          authToken: "",
        },
      }));
    } catch (error) {
      setFeedback((prev) => ({
        ...prev,
        [providerId]: error instanceof Error ? error.message : "Échec de l'enregistrement",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleRun = async (providerId: JobProviderId) => {
    setRunning((prev) => ({ ...prev, [providerId]: true }));
    setFeedback((prev) => ({ ...prev, [providerId]: null }));
    try {
      await onRun(providerId);
      setFeedback((prev) => ({ ...prev, [providerId]: "Scraper relancé." }));
    } catch (error) {
      setFeedback((prev) => ({
        ...prev,
        [providerId]: error instanceof Error ? error.message : "Échec du redémarrage",
      }));
    } finally {
      setRunning((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    setBulkFeedback(null);
    try {
      await onRunAll();
      setBulkFeedback("Tous les scrapers configurés ont été relancés.");
    } catch (error) {
      setBulkFeedback(error instanceof Error ? error.message : "Échec de la relance globale");
    } finally {
      setRunningAll(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">État des scrapers</p>
          <p className="text-xs text-slate-500">
            {isLoading ? "Chargement en cours..." : `${items.length} connecteurs configurés`}
          </p>
          {bulkFeedback && <p className="text-xs text-slate-500">{bulkFeedback}</p>}
        </div>
        <button
          type="button"
          onClick={() => void handleRunAll()}
          disabled={runningAll}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {runningAll ? "Relance globale..." : "Lancer tous les providers"}
        </button>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-3 pr-4">Provider</th>
              <th className="py-3 pr-4">Langue</th>
              <th className="py-3 pr-4">Statut</th>
              <th className="py-3 pr-4">Dernier run</th>
              <th className="py-3 pr-4">Dernier succès</th>
              <th className="py-3 pr-4">Dernière erreur</th>
              <th className="py-3 pr-4">Offres</th>
              <th className="py-3 pr-4">Endpoint</th>
              <th className="py-3 pr-4">Clé / token</th>
              <th className="py-3 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const statusBadge = statusClasses[item.status] ?? statusClasses.idle;
              const values = formValues[item.providerId] ?? { endpoint: "", authToken: "" };
              return (
                <tr key={item.providerId} className="align-top">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <span className="text-xs text-slate-500">{item.providerId}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                      {item.language}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-xs text-slate-600">{formatDate(item.lastRunAt)}</td>
                  <td className="py-4 pr-4 text-xs text-slate-600">{formatDate(item.lastSuccessAt)}</td>
                  <td className="py-4 pr-4 text-xs text-red-600">{item.error ?? "—"}</td>
                  <td className="py-4 pr-4 text-xs text-slate-700">{item.jobCount}</td>
                  <td className="py-4 pr-4">
                    <input
                      type="url"
                      placeholder="https://api.example.com/jobs"
                      value={values.endpoint}
                      onChange={(event) => updateField(item.providerId, "endpoint", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="py-4 pr-4">
                    <input
                      type="password"
                      placeholder={item.settings.hasAuthToken ? "••••••••" : "Saisissez votre clé"}
                      value={values.authToken}
                      onChange={(event) => updateField(item.providerId, "authToken", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleRun(item.providerId)}
                        disabled={running[item.providerId]}
                        className="w-full rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {running[item.providerId] ? "Relance..." : "Relancer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSave(item.providerId)}
                        disabled={saving[item.providerId]}
                        className="w-full rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving[item.providerId] ? "Enregistrement..." : "Sauvegarder"}
                      </button>
                      {feedback[item.providerId] && (
                        <p className="text-right text-xs text-slate-500">{feedback[item.providerId]}</p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-sm text-slate-500">
                  {isLoading ? "Chargement en cours..." : "Aucun scraper configuré pour le moment."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
