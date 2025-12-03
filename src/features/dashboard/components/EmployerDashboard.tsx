import Link from "next/link";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

const stats = [
  { label: "Offres actives", value: "3" },
  { label: "Candidats en cours", value: "18" },
  { label: "Taux de réponse", value: "42%" },
];

export const EmployerDashboard = () => (
  <DashboardShell
    title="Espace employeur"
    description="Pilotez vos campagnes de recrutement et suivez vos indicateurs clés."
    actions={
      <Link
        href="/jobs"
        className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
      >
        Publier une offre
      </Link>
    }
  >
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
          <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </section>
    <section className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
      Connectez votre ATS pour activer les synchronisations automatiques. Cette section affichera vos prochaines
      tâches de recrutement.
    </section>
  </DashboardShell>
);
