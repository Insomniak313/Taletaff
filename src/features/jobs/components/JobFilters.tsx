import type { ChangeEvent } from "react";
import type { JobCategory } from "@/types/job";

interface JobFiltersProps {
  categories: JobCategory[];
  activeCategory?: string;
  onCategoryChange: (slug: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  summary: { count: number; hasError: boolean };
}

export const JobFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  summary,
}: JobFiltersProps) => {
  const handleQuery = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          placeholder="Rechercher par titre ou entreprise"
          value={query}
          onChange={handleQuery}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none md:max-w-sm"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {summary.hasError
            ? "Erreur lors du chargement"
            : `${summary.count} opportunité(s)`}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = category.slug === activeCategory;
          return (
            <button
              type="button"
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`rounded-full border px-4 py-1 text-sm transition ${
                isActive
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {category.title}
            </button>
          );
        })}
      </div>
    </section>
  );
};
