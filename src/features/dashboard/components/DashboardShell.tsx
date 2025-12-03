import type { PropsWithChildren } from "react";

interface DashboardShellProps extends PropsWithChildren {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const DashboardShell = ({ title, description, actions, children }: DashboardShellProps) => (
  <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12">
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Tableau de bord</p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {actions}
    </header>
    {children}
  </div>
);
