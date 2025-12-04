import { formatCurrencyRange } from "@/utils/format";
import type { JobCategory, JobSearchSummary } from "@/types/job";
import type { JobProviderFilterOption } from "@/config/jobProviders";

const SALARY_PRESETS = [40000, 60000, 80000, 100000];
const FALLBACK_LOCATIONS = [
  { label: "Paris", count: 0 },
  { label: "Lyon", count: 0 },
  { label: "Remote", count: 0 },
];

interface JobFiltersProps {
  categories: JobCategory[];
  activeCategory?: string;
  onCategoryChange: (slug?: string) => void;
  providers: JobProviderFilterOption[];
  activeProvider?: JobProviderFilterOption["id"];
  onProviderChange: (value?: JobProviderFilterOption["id"]) => void;
  query: string;
  onQueryChange: (value: string) => void;
  summary: JobSearchSummary;
  errorMessage?: string | null;
  location: string;
  onLocationChange: (value: string) => void;
  remoteOnly: boolean;
  onRemoteToggle: () => void;
  salaryFloor: number | null;
  onSalaryFloorChange: (value: number | null) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onResetFilters: () => void;
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const JobFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
  providers,
  activeProvider,
  onProviderChange,
  query,
  onQueryChange,
  summary,
  errorMessage,
  location,
  onLocationChange,
  remoteOnly,
  onRemoteToggle,
  salaryFloor,
  onSalaryFloorChange,
  selectedTags,
  onTagToggle,
  onResetFilters,
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: JobFiltersProps) => {
  const hasActiveFilters =
    Boolean(query) ||
    Boolean(location) ||
    remoteOnly ||
    salaryFloor !== null ||
    Boolean(activeProvider) ||
    selectedTags.length > 0;

  const handleCategoryClick = (slug: string) => {
    if (slug === activeCategory) {
      onCategoryChange(undefined);
      return;
    }
    onCategoryChange(slug);
  };

  const handleProviderChange = (value: string) => {
    if (!value) {
      onProviderChange(undefined);
      return;
    }
    onProviderChange(value as JobProviderFilterOption["id"]);
  };

  const locationOptions = (() => {
    const base = summary.topLocations.length ? summary.topLocations : FALLBACK_LOCATIONS;
    if (
      location &&
      !base.some((option) => option.label.toLowerCase() === location.toLowerCase())
    ) {
      return [{ label: location, count: 0 }, ...base];
    }
    return base;
  })();

  const tagSuggestions = (() => {
    const baseTags = summary.topTags.map((tag) => tag.label);
    const extras = selectedTags.filter(
      (tag) => !baseTags.some((label) => label.toLowerCase() === tag.toLowerCase())
    );
    return [...baseTags, ...extras];
  })();

  const remotePercent = Math.min(100, Math.round(summary.remoteShare * 100));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const hasResults = summary.count > 0;
  const visibleStart = hasResults ? (safePage - 1) * pageSize + 1 : 0;
  const visibleEnd = hasResults ? Math.min(safePage * pageSize, summary.count) : 0;
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < pageCount;

  const salaryLabel =
    summary.salaryRange.min > 0 && summary.salaryRange.max > 0
      ? formatCurrencyRange(summary.salaryRange.min, summary.salaryRange.max)
      : "Fourchette en cours de collecte";

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="job-search-input"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Recherche intelligente
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-inner">
              <input
                id="job-search-input"
                type="search"
                placeholder="Poste, stack, soft skills…"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                className="flex-1 border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-600"
                  onClick={() => onQueryChange("")}
                >
                  Effacer
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {errorMessage
                ? errorMessage
                : `${summary.count} opportunité(s) triées par pertinence`}
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
            <div>
              <label
                htmlFor="job-location-select"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Localisation rapide
              </label>
              <select
                id="job-location-select"
                value={location}
                onChange={(event) => onLocationChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Partout</option>
                {locationOptions.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label} {option.count ? `(${option.count})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="job-provider-select"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Source partenaire
              </label>
              <select
                id="job-provider-select"
                value={activeProvider ?? ""}
                onChange={(event) => handleProviderChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Tous les partenaires</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onRemoteToggle}
            className={`rounded-full border px-4 py-2 font-medium transition ${
              remoteOnly
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            Remote friendly
          </button>
          <select
            value={salaryFloor ?? ""}
            onChange={(event) =>
              onSalaryFloorChange(event.target.value ? Number(event.target.value) : null)
            }
            aria-label="Salaire minimum"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="">Salaire minimum</option>
            {SALARY_PRESETS.map((value) => (
              <option key={value} value={value}>
                {`${value / 1000}k€+`}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              hasActiveFilters
                ? "border-slate-300 text-slate-600 hover:border-slate-400"
                : "border-slate-200 text-slate-400"
            }`}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange(undefined)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            !activeCategory
              ? "border-brand-500 bg-brand-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          Toutes les offres
        </button>
        {categories.map((category) => {
          const isActive = category.slug === activeCategory;
          return (
            <button
              type="button"
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-brand-500 bg-brand-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {category.title}
            </button>
          );
        })}
      </div>

      {!!tagSuggestions.length && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tags populaires
          </p>
          <div className="flex flex-wrap gap-2">
            {tagSuggestions.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    isActive
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Résultats actifs
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.count}</p>
          <p className="text-xs text-slate-500">Offres qualifiées mises à jour en continu</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Remote friendly
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-white">
            <span
              className="block h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${remotePercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{remotePercent}% des offres</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fourchette salariale
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{salaryLabel}</p>
          <p className="text-xs text-slate-500">Estimée sur les offres visibles</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-600">
          {hasResults
            ? `Résultats ${visibleStart}–${visibleEnd} sur ${summary.count}`
            : "Aucune offre ne correspond à vos filtres"}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label
            htmlFor="page-size-select"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Par page
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => canGoPrev && onPageChange(safePage - 1)}
              disabled={!canGoPrev}
              className={`rounded-full px-2 py-1 ${
                canGoPrev
                  ? "text-slate-600 hover:bg-slate-100"
                  : "text-slate-300"
              }`}
            >
              Précédent
            </button>
            <span className="px-2">
              Page {safePage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => canGoNext && onPageChange(safePage + 1)}
              disabled={!canGoNext}
              className={`rounded-full px-2 py-1 ${
                canGoNext
                  ? "text-slate-600 hover:bg-slate-100"
                  : "text-slate-300"
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
