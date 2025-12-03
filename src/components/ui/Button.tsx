import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-glow hover:opacity-95 disabled:opacity-60",
  secondary:
    "border border-ink-100 bg-white/80 text-ink-800 hover:border-brand-200 hover:bg-white",
  ghost: "text-ink-500 hover:text-brand-600",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 disabled:cursor-not-allowed",
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </button>
);
