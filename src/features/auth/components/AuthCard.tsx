interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <header className="mb-6 space-y-1">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </header>
    {children}
  </section>
);
