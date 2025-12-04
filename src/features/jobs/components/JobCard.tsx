import { useMemo } from "react";
import { Tag } from "@/components/ui/Tag";
import { formatCurrencyRange, formatRelativeDate } from "@/utils/format";
import type { JobRecord } from "@/types/job";

interface JobCardProps {
  job: JobRecord;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const decodeHtmlEntities = (value: string): string =>
  value.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return String.fromCodePoint(codePoint);
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return String.fromCodePoint(codePoint);
    }

    const normalized = entity.toLowerCase();
    return HTML_ENTITIES[normalized] ?? match;
  });

const stripUnsafeBlocks = (value: string): string =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

const summarizeDescription = (value?: string): string => {
  if (!value) {
    return "";
  }

  const safeValue = stripUnsafeBlocks(value);
  const withLineBreaks = safeValue
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(ul|ol)>/gi, "\n");

  const stripped = withLineBreaks.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(stripped);

  const lines: string[] = [];

  for (const rawLine of decoded.split("\n")) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }
    lines.push(trimmed);
    if (lines.length >= 8) {
      break;
    }
  }

  return lines.join("\n");
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
