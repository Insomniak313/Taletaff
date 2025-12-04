interface ModuleCard {
  id: string;
  title: string;
  description: string;
  indicatorLabel: string;
  indicatorValue: string;
  highlight: string;
  stack: string[];
}

const moduleCards: ModuleCard[] = [
  {
    id: "jobs",
    title: "Orchestrateur d'offres",
    description:
      "Centralise l'import temps réel des offres (providers, scrapers et bootstrap manuel) avant de nourrir la recherche et les alertes candidats.",
    indicatorLabel: "Jobs synchronisés / run",
    indicatorValue: "180+",
    highlight: "Piloté par Supabase + /api/jobs/bootstrap",
    stack: [
      "supabase/migrations/20251203100000_add_job_provider_runs.sql",
      "src/app/api/jobs/bootstrap/route.ts",
      "src/app/jobs/[category]/page.tsx"
    ]
  },
  {
    id: "talents",
    title: "Expérience candidat guidée",
    description:
      "Onboarding auth, recommandations et catégories illustrées pour visualiser immédiatement les univers métier disponibles.",
    indicatorLabel: "Talents actifs / semaine",
    indicatorValue: "320",
    highlight: "Flows auth + CategoryGrid réutilisable",
    stack: [
      "src/app/(auth)/signup/page.tsx",
      "src/app/(auth)/login/page.tsx",
      "src/features/jobs/components/CategoryGrid.tsx"
    ]
  },
  {
    id: "ops",
    title: "Pilotage employeur & modération",
    description:
      "Les équipes admin naviguent entre les dashboards Next.js, l'API Admin et les routes de sync pour activer ou corriger les runs fournisseurs.",
    indicatorLabel: "Dossiers modérés / jour",
    indicatorValue: "68",
    highlight: "Routes /api/admin + dashboard/*",
    stack: [
      "src/app/dashboard/admin/page.tsx",
      "src/app/api/admin/jobs/route.ts",
      "src/app/api/run/route.ts"
    ]
  }
];

export const ProjectModules = () => {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-lg">
      <header className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Architecture produit</p>
        <h2 className="text-3xl font-semibold text-ink-900">Ce que Taletaff embarque aujourd&apos;hui.</h2>
        <p className="text-sm text-ink-600">
          Une même expérience relie flux Supabase, APIs Next.js et interfaces React pour offrir un pilote projet unique.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleCards.map((module) => (
          <article
            key={module.id}
            className="group relative flex flex-col gap-5 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">{module.id}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink-900">{module.title}</h3>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-2 text-right text-xs text-brand-600">
                <p className="font-semibold text-ink-900">{module.indicatorValue}</p>
                <p>{module.indicatorLabel}</p>
              </div>
            </div>
            <p className="text-sm text-ink-600">{module.description}</p>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {module.highlight}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-400">Stack reliée</p>
              <ul className="mt-3 space-y-1.5">
                {module.stack.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-ink-100/60 bg-ink-50/30 px-3 py-2 text-[12px] font-mono text-ink-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
