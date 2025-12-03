import Link from "next/link";

const navItems = [
  { href: "/jobs", label: "Offres" },
  { href: "/jobs/product", label: "Produit" },
  { href: "/jobs/engineering", label: "Tech" },
  { href: "/jobs/marketing", label: "Marketing" },
];

export const AppHeader = () => (
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <Link href="/" className="text-lg font-semibold text-slate-900">
        Taletaff
      </Link>
      <nav className="hidden gap-4 text-sm text-slate-600 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          aria-label="Accéder à l'espace membre"
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-500"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  </header>
);
