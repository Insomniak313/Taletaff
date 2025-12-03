import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  helperText?: string;
  error?: string;
}

export const InputField = ({
  label,
  icon,
  helperText,
  error,
  className,
  ...props
}: InputFieldProps) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-ink-600">
    {label}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">{icon}</span>}
      <input
        className={clsx(
          "w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-md transition focus:border-brand-300 focus:ring-2 focus:ring-brand-50 focus:outline-none",
          icon && "pl-11",
          error && "border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
    </div>
    {(helperText || error) && (
      <span className={clsx("text-xs", error ? "text-red-500" : "text-ink-500")}>
        {error ?? helperText}
      </span>
    )}
  </label>
);
