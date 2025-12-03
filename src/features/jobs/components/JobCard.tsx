import { Tag } from "@/components/ui/Tag";
import { formatCurrencyRange, formatRelativeDate } from "@/utils/format";
import type { JobRecord } from "@/types/job";

interface JobCardProps {
  job: JobRecord;
}

export const JobCard = ({ job }: JobCardProps) => (
  <article className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <header className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {job.company}
      </p>
      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
    </header>
    <p className="text-sm text-slate-600">{job.description}</p>
    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
      <span>{job.location}</span>
      <span>•</span>
      <span>{job.remote ? "Remote friendly" : "Sur site"}</span>
      <span>•</span>
      <span>{formatCurrencyRange(job.salaryMin, job.salaryMax)}</span>
      <span>•</span>
      <span>Publiée {formatRelativeDate(job.createdAt)}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {job.tags.map((tag) => (
        <Tag key={tag} label={tag} />
      ))}
    </div>
  </article>
);
