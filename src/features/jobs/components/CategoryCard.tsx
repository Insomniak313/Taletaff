import Link from "next/link";
import type { JobCategory } from "@/types/job";

interface CategoryCardProps {
  category: JobCategory;
  isActive?: boolean;
}

export const CategoryCard = ({ category, isActive }: CategoryCardProps) => (
  <article
    className={`group flex flex-col justify-between rounded-[28px] border border-white/70 p-5 shadow-md transition hover:-translate-y-1 hover:border-brand-200 ${
      isActive ? "bg-brand-50/80" : "bg-white/80"
    }`}
  >
    <div className="space-y-3">
      <span className="inline-flex rounded-full border border-ink-100 bg-white/70 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {category.slug}
      </span>
      <h3 className="text-lg font-semibold text-ink-900">{category.title}</h3>
      <p className="text-sm text-ink-600">{category.description}</p>
    </div>
    <Link
      href={`/jobs/${category.slug}`}
      className={`mt-4 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-brand-500 text-white shadow-glow"
          : "border border-ink-100 text-ink-700 hover:border-brand-200 hover:text-brand-600"
      }`}
    >
      Voir les offres
    </Link>
  </article>
);
