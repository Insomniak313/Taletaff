"use client";

import { useMemo, useState } from "react";

interface FlowStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  endpoint: string;
  status: string;
  impact: string;
  progress: number;
  actions: string[];
  dependencies: string[];
}

const flowSteps: FlowStep[] = [
  {
    id: "sync",
    title: "Collecte & normalisation des offres",
    description:
      "Exécute les scrapers et providers déclarés dans Supabase avant d'alimenter les tables jobs. On contrôle les doublons, les plages salariales et l'origine de chaque flux.",
    duration: "2m30",
    endpoint: "/api/run",
    status: "8 providers actifs",
    impact: "+250 offres / run",
    progress: 76,
    actions: [
      "Déclenche les routes /api/scrapers et /api/jobs/bootstrap",
      "Journalise les statuts dans supabase.job_provider_runs",
      "Normalise les champs stack, localisation et rythme"
    ],
    dependencies: ["supabase/migrations", "src/app/api/run/route.ts"]
  },
  {
    id: "moderation",
    title: "Qualification & modération opérée",
    description:
      "Les équipes admin valident les offres, priorisent les briefs employeurs et publient les alertes candidats directement depuis le dashboard.",
    duration: "45 min",
    endpoint: "/dashboard/admin",
    status: "3 modérateurs connectés",
    impact: "100 % offres notées",
    progress: 54,
    actions: [
      "Checklists salaire/stack côté admin",
      "Taggage métier + catégorie pour CategoryGrid",
      "Retour API employeurs pour corrections"
    ],
    dependencies: ["src/app/dashboard/admin/page.tsx", "src/app/api/admin/jobs/route.ts"]
  },
  {
    id: "distribution",
    title: "Diffusion & feedback candidat",
    description:
      "Push ciblé vers les candidats actifs avec suivi en temps réel (insights, stories, emails transactionnels). Les stats remontent dans Data Pulse.",
    duration: "8 min",
    endpoint: "/jobs & /features",
    status: "92 % ouverture notif",
    impact: "Score matching 92 %",
    progress: 88,
    actions: [
      "Alimentation du composant CategoryGrid + pages /jobs/[category]",
      "Alertes emails + notifications in-app (Next + Supabase)",
      "Consolidation des retours pour SuccessStories"
    ],
    dependencies: ["src/app/jobs/[category]/page.tsx", "src/components/sections/SuccessStories.tsx"]
  }
];

export const formatProgress = (value: number) => `${Math.min(Math.max(value, 0), 100)}%`;

export const resolveActiveStep = (stepId: string): FlowStep =>
  flowSteps.find((step) => step.id === stepId) ?? flowSteps[0];

export const AutomationPlayground = () => {
  const [activeStepId, setActiveStepId] = useState(flowSteps[0].id);
  const activeStep = useMemo(() => resolveActiveStep(activeStepId), [activeStepId]);

  return (
    <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-lg">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Playground automatisation</p>
        <h2 className="text-3xl font-semibold text-ink-900">Suivez le circuit complet d&apos;une offre.</h2>
        <p className="text-sm text-ink-600">
          Trois étapes couvrent la collecte, la validation et la diffusion. Sélectionnez un bloc pour explorer les
          interactions concrètes entre APIs, migrations Supabase et interfaces React.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {flowSteps.map((step, index) => {
            const isActive = step.id === activeStep.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                aria-pressed={isActive}
                className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${
                  isActive
                    ? "border-brand-200 bg-brand-50/60 shadow-md"
                    : "border-white/70 bg-white/60 hover:border-brand-100"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-brand-600 shadow-sm">
                  0{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-400">{step.endpoint}</p>
                  <p className="text-base font-semibold text-ink-900">{step.title}</p>
                  <p className="text-xs text-ink-500">{step.status}</p>
                </div>
                <div className="flex flex-col items-end text-xs text-ink-500">
                  <span className="font-semibold text-ink-900">{step.duration}</span>
                  <span>{step.impact}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-white/80 bg-gradient-to-br from-white via-brand-50/40 to-white p-6 shadow-inner">
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-700">
              Santé run : {activeStep.status}
            </span>
            <span className="text-xs text-ink-500">Étape alimentée par {activeStep.dependencies.join(" + ")}</span>
          </div>

          <p className="mt-5 text-lg font-semibold text-ink-900">{activeStep.title}</p>
          <p className="mt-2 text-sm text-ink-600">{activeStep.description}</p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>Progression opérationnelle</span>
                <span className="font-semibold text-ink-900">{formatProgress(activeStep.progress)}</span>
              </div>
              <div className="mt-2 h-3 w-full rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300 transition-[width]"
                  style={{ width: formatProgress(activeStep.progress) }}
                />
              </div>
            </div>
            <ul className="space-y-3">
              {activeStep.actions.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-ink-600"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-400" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
