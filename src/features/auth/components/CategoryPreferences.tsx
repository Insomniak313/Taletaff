import { jobCategories } from "@/config/jobCategories";

interface CategoryPreferencesProps {
  selected: string[];
  onToggle: (slug: string) => void;
}

export const CategoryPreferences = ({ selected, onToggle }: CategoryPreferencesProps) => (
  <fieldset className="rounded-2xl border border-slate-100 p-3">
    <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      Préférences métier
    </legend>
    <div className="mt-2 flex flex-wrap gap-2">
      {jobCategories.map((category) => {
        const isChecked = selected.includes(category.slug);
        return (
          <button
            type="button"
            key={category.slug}
            onClick={() => onToggle(category.slug)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              isChecked
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            {category.title}
          </button>
        );
      })}
    </div>
  </fieldset>
);
