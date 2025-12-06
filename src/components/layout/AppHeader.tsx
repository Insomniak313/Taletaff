import Link from "next/link";

const navItems = [
  { href: "/jobs", label: "Offres" },
  { href: "/jobs/product", label: "Produit" },
  { href: "/jobs/engineering", label: "Tech" },
  { href: "/jobs/design", label: "Design" },
  { href: "/jobs/data", label: "Data" },
  { href: "/jobs/marketing", label: "Marketing" },
];

export const AppHeader = () => (
  <header className="sticky top-2 z-30">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/60 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-lg">
      <Link
        href="/"
        className="text-base font-semibold tracking-tight text-ink-800 transition hover:text-brand-600"
      >
        Taletaff
      </Link>
      <nav className="hidden items-center gap-1 text-sm text-ink-500 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-1 transition hover:bg-brand-50 hover:text-ink-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-ink-500 transition hover:text-ink-900"
          aria-label="Accéder à l'espace membre"
        >
          Se connecter
        </Link>
        <Link
          href="/signup"
          className="hidden rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:shadow-lg sm:inline-flex"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  </header>
);
