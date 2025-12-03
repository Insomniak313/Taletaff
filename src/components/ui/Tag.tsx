interface TagProps {
  label: string;
}

export const Tag = ({ label }: TagProps) => (
  <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
    {label}
  </span>
);
