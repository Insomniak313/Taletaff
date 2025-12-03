interface TagProps {
  label: string;
}

export const Tag = ({ label }: TagProps) => (
  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
    {label}
  </span>
);
