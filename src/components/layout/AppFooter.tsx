export const AppFooter = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} Taletaff · Plateforme d&apos;opportunités.</p>
      <div className="flex gap-4">
        <a
          href="https://github.com/taletaff"
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-slate-900"
        >
          GitHub
        </a>
        <a
          href="https://twitter.com/taletaff"
          target="_blank"
          rel="noreferrer"
          className="transition hover:text-slate-900"
        >
          Twitter
        </a>
      </div>
    </div>
  </footer>
);
