import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

const flaggedItems = [
  {
    source: "hellowork",
    title: "Product Manager F/H",
    reason: "Description dupliquée",
  },
  {
    source: "indeed-fr",
    title: "DevOps Engineer",
    reason: "Salaire manquant",
  },
];

export const ModeratorDashboard = () => (
  <DashboardShell
    title="Espace modération"
    description="Vérifiez les offres signalées et assurez la qualité du catalogue."
  >
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <header className="flex items-center justify-between border-b border-slate-100 pb-3">
        <p className="text-sm font-semibold text-slate-900">Offres à vérifier</p>
        <span className="text-xs text-slate-500">{flaggedItems.length} en attente</span>
      </header>
      <ul className="divide-y divide-slate-100">
        {flaggedItems.map((item) => (
          <li key={item.title} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">
                {item.source} · {item.reason}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              Marquer comme ok
            </button>
          </li>
        ))}
      </ul>
    </section>
  </DashboardShell>
);
