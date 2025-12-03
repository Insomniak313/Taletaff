import type { AdminJobSummary } from "@/types/admin";

interface JobsPanelProps {
  jobs: AdminJobSummary[];
  isLoading: boolean;
}

export const JobsPanel = ({ jobs, isLoading }: JobsPanelProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <header className="mb-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">Dernières offres synchronisées</p>
        <p className="text-xs text-slate-500">
          {isLoading ? "Chargement..." : `${jobs.length} lignes affichées`}
        </p>
      </div>
    </header>
    <div className="space-y-3">
      {jobs.map((job) => (
        <article key={job.id} className="rounded-2xl border border-slate-100 p-3">
          <p className="text-sm font-semibold text-slate-900">{job.title}</p>
          <p className="text-xs text-slate-500">{job.company} · {job.source}</p>
          <p className="text-xs text-slate-400">
            Synchronisé le {new Date(job.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </p>
        </article>
      ))}
      {!jobs.length && !isLoading && (
        <p className="text-sm text-slate-500">Aucune offre disponible.</p>
      )}
    </div>
  </section>
);
