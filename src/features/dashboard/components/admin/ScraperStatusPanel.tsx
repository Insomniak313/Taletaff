"use client";

import { useEffect, useState } from "react";
import type { JobProviderId } from "@/features/jobs/providers";
import type { ScraperStatusSummary } from "@/types/admin";

interface ScraperStatusPanelProps {
  items: ScraperStatusSummary[];
  onRun: (providerId: JobProviderId) => Promise<void>;
  onSaveConfig: (providerId: JobProviderId, payload: { endpoint?: string; authToken?: string }) => Promise<void>;
  isLoading: boolean;
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

export const ScraperStatusPanel = ({ items, onRun, onSaveConfig, isLoading }: ScraperStatusPanelProps) => {
  const [formValues, setFormValues] = useState<FormState>({} as FormState);
  const [saving, setSaving] = useState<Record<JobProviderId, boolean>>({} as Record<JobProviderId, boolean>);
  const [running, setRunning] = useState<Record<JobProviderId, boolean>>({} as Record<JobProviderId, boolean>);
  const [feedback, setFeedback] = useState<Record<JobProviderId, string | null>>({} as Record<JobProviderId, string | null>);

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

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">État des scrapers</p>
          <p className="text-xs text-slate-500">
            {isLoading ? "Chargement en cours..." : `${items.length} connecteurs configurés`}
          </p>
        </div>
      </header>
      <div className="grid gap-4">
        {items.map((item) => {
          const statusBadge = statusClasses[item.status] ?? statusClasses.idle;
          const values = formValues[item.providerId] ?? { endpoint: "", authToken: "" };
          return (
            <article key={item.providerId} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.providerId}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                    {item.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {item.jobCount} offres
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRun(item.providerId)}
                    disabled={running[item.providerId]}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {running[item.providerId] ? "Relance..." : "Relancer"}
                  </button>
                </div>
              </div>
              <dl className="mt-3 grid gap-3 text-xs text-slate-600 md:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-900">Dernier run</dt>
                  <dd>{formatDate(item.lastRunAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Dernier succès</dt>
                  <dd>{formatDate(item.lastSuccessAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Erreur</dt>
                  <dd className="text-red-600">{item.error ?? "—"}</dd>
                </div>
              </dl>
              <form
                className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSave(item.providerId);
                }}
              >
                <label className="text-xs font-semibold text-slate-900">
                  Endpoint
                  <input
                    type="url"
                    placeholder="https://api.example.com/jobs"
                    value={values.endpoint}
                    onChange={(event) => updateField(item.providerId, "endpoint", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-900">
                  Clé / token
                  <input
                    type="password"
                    placeholder={item.settings.hasAuthToken ? "••••••••" : "Saisissez votre clé"}
                    value={values.authToken}
                    onChange={(event) => updateField(item.providerId, "authToken", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving[item.providerId]}
                  className="mt-auto rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving[item.providerId] ? "Enregistrement..." : "Sauvegarder"}
                </button>
              </form>
              {feedback[item.providerId] && (
                <p className="mt-2 text-xs text-slate-500">{feedback[item.providerId]}</p>
              )}
            </article>
          );
        })}
        {!items.length && !isLoading && (
          <p className="text-sm text-slate-500">Aucun scraper configuré pour le moment.</p>
        )}
      </div>
    </section>
  );
};
