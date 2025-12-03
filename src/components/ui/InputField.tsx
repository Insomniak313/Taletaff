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
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input
        className={clsx(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:outline-none",
          icon && "pl-10",
          error && "border-red-400",
          className
        )}
        {...props}
      />
    </div>
    {(helperText || error) && (
      <span className={clsx("text-xs", error ? "text-red-500" : "text-slate-500")}> 
        {error ?? helperText}
      </span>
    )}
  </label>
);
