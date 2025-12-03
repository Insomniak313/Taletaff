import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 disabled:bg-brand-300",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:text-slate-900",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed",
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </button>
);
