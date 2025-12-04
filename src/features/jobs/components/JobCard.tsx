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
  const displayedTags = job.tags.slice(0, 4);
  const remainingTagCount = Math.max(0, job.tags.length - displayedTags.length);

  return (
    <article className="group flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm ring-1 ring-transparent transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {job.company || "Entreprise confidentielle"}
          </p>
          <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            job.remote
              ? "bg-brand-50 text-brand-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {job.remote ? "Remote friendly" : job.location || "Sur site"}
        </span>
      </header>
      <p className="whitespace-pre-line text-sm text-slate-600">
        {descriptionSummary || "Description en cours de rédaction."}
      </p>
      <dl className="grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <dt className="font-semibold uppercase tracking-wide text-slate-400">
            Localisation
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            {job.location || "À définir"}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <dt className="font-semibold uppercase tracking-wide text-slate-400">
            Rémunération
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            {formatCurrencyRange(job.salaryMin, job.salaryMax)}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <dt className="font-semibold uppercase tracking-wide text-slate-400">
            Publication
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            {formatRelativeDate(job.createdAt)}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        {displayedTags.map((tag) => (
          <Tag key={`${job.id}-${tag}`} label={tag} />
        ))}
        {remainingTagCount > 0 && (
          <span className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-xs text-slate-500">
            +{remainingTagCount} tag{remainingTagCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </article>
  );
};
