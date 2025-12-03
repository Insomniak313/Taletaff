import { CategoryCard } from "@/features/jobs/components/CategoryCard";
import type { JobCategory } from "@/types/job";

interface CategoryGridProps {
  categories: JobCategory[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => (
  <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {categories.map((category) => (
      <CategoryCard key={category.slug} category={category} />
    ))}
  </section>
);
