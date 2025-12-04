"use client";

import { useMemo, useState } from "react";

interface MetricSet {
  id: "talents" | "employeurs" | "ops";
  label: string;
  description: string;
  monthly: number[];
  colors: { from: string; to: string; point: string };
  delta: string;
  meta: string;
  kpis: { label: string; value: string; hint: string }[];
}

interface ChartGeometry {
  pathD: string;
  areaD: string;
  points: { x: number; y: number; value: number; label: string }[];
}

const monthLabels = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév"];
const chartWidth = 320;
const chartHeight = 160;
const verticalPadding = 16;

const metricSets: MetricSet[] = [
  {
    id: "talents",
    label: "Talents actifs",
    description:
      "Couvre les flux candidats qui parcourent la grille de catégories et les offres vérifiées chaque semaine.",
    monthly: [48, 62, 74, 81, 95, 102],
    colors: { from: "#f36d3f", to: "#ffb083", point: "#f36d3f" },
    delta: "+18 % vs mois dernier",
    meta: "Basé sur les inscriptions / (auth) + vues jobs.",
    kpis: [
      { label: "Temps de placement", value: "11 j", hint: "-2 j" },
      { label: "Score matching", value: "92 %", hint: "+5 pts" },
      { label: "Completion onboarding", value: "84 %", hint: "+9 pts" }
    ]
  },
  {
    id: "employeurs",
    label: "Demandes employeurs",
    description:
      "Suit les briefs transmis via les routes admin, la modération et les parcours dashboard/employeur.",
    monthly: [22, 30, 28, 34, 41, 46],
    colors: { from: "#6366f1", to: "#38bdf8", point: "#4f46e5" },
    delta: "+12 % vs mois dernier",
    meta: "Routes /api/admin et dashboard/*.",
    kpis: [
      { label: "Briefs validés", value: "36", hint: "+6" },
      { label: "SLA réponse", value: "4 h", hint: "-1 h" },
      { label: "Taux closing", value: "58 %", hint: "+4 pts" }
    ]
  },
  {
    id: "ops",
    label: "Runs automatisés",
    description:
      "Synthèse des cron /api/run, scrapers et jobs bootstrap pour suivre la qualité des flux entrants.",
    monthly: [12, 18, 24, 37, 42, 55],
    colors: { from: "#10b981", to: "#84cc16", point: "#059669" },
    delta: "+26 % vs mois dernier",
    meta: "Sources scrapers + migrations Supabase.",
    kpis: [
      { label: "Temps run moyen", value: "2m30", hint: "-35 s" },
      { label: "Alertes critiques", value: "1", hint: "-3" },
      { label: "Providers actifs", value: "9", hint: "+2" }
    ]
  }
];

export const buildGeometry = (values: number[]): ChartGeometry => {
  if (values.length === 0) {
    return { pathD: "", areaD: "", points: [] };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const usableHeight = chartHeight - verticalPadding * 2;

  const points = values.map((value, index) => {
    const x =
      values.length === 1 ? chartWidth / 2 : (index / (values.length - 1)) * chartWidth;
    const normalized = (value - minValue) / range;
    const y = chartHeight - verticalPadding - normalized * usableHeight;

    return { x, y, value, label: monthLabels[index] ?? `M${index + 1}` };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaD = `${pathD} L ${chartWidth} ${chartHeight - verticalPadding} L 0 ${chartHeight - verticalPadding} Z`;

  return { pathD, areaD, points };
};

export const DataPulse = () => {
  const [activeMetric, setActiveMetric] = useState<MetricSet>(metricSets[0]);

  const geometry = useMemo(() => buildGeometry(activeMetric.monthly), [activeMetric]);

  return (
    <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-lg">
      <header className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Data pulse</p>
          <h2 className="text-3xl font-semibold text-ink-900">Visualisez les signaux du projet.</h2>
          <p className="text-sm text-ink-600">{activeMetric.description}</p>
        </div>
        <p className="text-sm font-semibold text-emerald-600">{activeMetric.delta}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-ink-100/80 bg-ink-50/30 p-2">
            <div className="grid gap-2 sm:grid-cols-3">
              {metricSets.map((metric) => {
                const isActive = metric.id === activeMetric.id;
                return (
                  <button
                    type="button"
                    key={metric.id}
                    onClick={() => setActiveMetric(metric)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-ink-900 text-white shadow-lg"
                        : "bg-white/80 text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {metric.label}
                    <p
                      className={`text-xs font-normal ${
                        isActive ? "text-white/70" : "text-ink-400"
                      }`}
                    >
                      {isActive ? metric.meta : "Sélectionner"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-ink-500">
            Données issues de{" "}
            <code className="rounded-md bg-ink-100/80 px-1 py-0.5 text-[11px]">/api/jobs</code>,{" "}
            <code className="rounded-md bg-ink-100/80 px-1 py-0.5 text-[11px]">/api/scrapers</code>,{" "}
            <code className="rounded-md bg-ink-100/80 px-1 py-0.5 text-[11px]">/api/run</code> et des vues
            dashboard. Mise à jour toutes les 24 h.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-gradient-to-br from-white to-brand-50/60 p-6 shadow-inner">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-56 w-full"
            role="img"
            aria-label={`Courbe ${activeMetric.label}`}
          >
            <defs>
              <linearGradient id={`${activeMetric.id}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={activeMetric.colors.from} />
                <stop offset="100%" stopColor={activeMetric.colors.to} />
              </linearGradient>
              <linearGradient id={`${activeMetric.id}-area`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={activeMetric.colors.from} stopOpacity="0.35" />
                <stop offset="100%" stopColor={activeMetric.colors.to} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={geometry.areaD}
              fill={`url(#${activeMetric.id}-area)`}
              stroke="none"
            />
            <path
              d={geometry.pathD}
              fill="none"
              strokeWidth={4}
              stroke={`url(#${activeMetric.id}-line)`}
              strokeLinecap="round"
            />
            {geometry.points.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r={6} className="fill-white" />
                <circle cx={point.x} cy={point.y} r={4} fill={activeMetric.colors.point} />
                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  className="fill-ink-600 text-[10px]"
                >
                  {point.value}
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs font-medium text-ink-500">
            {geometry.points.map((point) => (
              <div key={point.label}>
                <p className="font-semibold text-ink-900">{point.value}</p>
                <p>{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {activeMetric.kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-4 text-sm text-ink-600"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink-900">{kpi.value}</p>
            <p className="text-xs text-emerald-600">{kpi.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
