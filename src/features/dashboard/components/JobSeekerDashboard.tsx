import Link from "next/link";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

const quickActions = [
  {
    title: "Explorer les offres",
    description: "Accédez aux nouvelles offres validées par nos scrapers.",
    href: "/jobs",
  },
  {
    title: "Mettre à jour vos préférences",
    description: "Ajustez vos catégories pour recevoir de meilleures recommandations.",
    href: "/signup",
  },
  {
    title: "Suivre vos candidatures",
    description: "Bientôt disponible : centralisez vos suivis directement ici.",
    href: "/jobs",
  },
];

export const JobSeekerDashboard = () => (
  <DashboardShell
    title="Espace candidat"
    description="Retrouvez vos offres récentes, les performances de vos candidatures et vos prochaines actions."
  >
    <section className="grid gap-4 md:grid-cols-3">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-slate-900">{action.title}</p>
          <p className="text-xs text-slate-600">{action.description}</p>
        </Link>
      ))}
    </section>
  </DashboardShell>
);
