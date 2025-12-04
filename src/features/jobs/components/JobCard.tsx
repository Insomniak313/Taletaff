import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Tag } from "@/components/ui/Tag";
import { formatCurrencyRange, formatRelativeDate } from "@/utils/format";
import type { JobRecord } from "@/types/job";

interface JobCardProps {
  job: JobRecord;
}

const decodeHtmlEntities = (value: string): string => {
  if (typeof window === "undefined") {
    return value;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const summarizeDescription = (value?: string): string => {
  if (!value) {
    return "";
  }

  const sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

  const withLineBreaks = sanitized
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(ul|ol)>/gi, "\n");

  const stripped = withLineBreaks.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(stripped);

  return decoded
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");
};

export const JobCard = ({ job }: JobCardProps) => {
  const descriptionSummary = useMemo(
    () => summarizeDescription(job.description),
    [job.description]
  );

  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {job.company}
        </p>
        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
      </header>
      <p className="whitespace-pre-line text-sm text-slate-600">
        {descriptionSummary || "Description en cours de rédaction."}
      </p>
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
};
