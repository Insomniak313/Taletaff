import Link from "next/link";
import type { JobCategory } from "@/types/job";

interface CategoryCardProps {
  category: JobCategory;
  isActive?: boolean;
}

export const CategoryCard = ({ category, isActive }: CategoryCardProps) => (
  <article
    className={`flex flex-col justify-between rounded-3xl border p-4 shadow-sm transition ${
      isActive ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
    }`}
  >
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
      <p className="text-sm text-slate-500">{category.description}</p>
    </div>
    <Link
      href={`/jobs/${category.slug}`}
      className="mt-4 text-sm font-semibold text-brand-600"
    >
      Voir les offres
    </Link>
  </article>
);
