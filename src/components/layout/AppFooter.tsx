export const AppFooter = () => (
  <footer className="mt-8">
    <div className="mx-auto max-w-6xl rounded-3xl border border-white/70 bg-white/80 px-6 py-8 text-sm text-ink-500 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-ink-800">Taletaff</p>
          <p className="mt-2 max-w-md text-sm text-ink-500">
            Matching humain + technologie pour des carrières sereines et ambitieuses.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="https://github.com/taletaff"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink-100 px-3 py-1 text-sm font-medium text-ink-600 transition hover:border-brand-200 hover:text-brand-600"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/taletaff"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink-100 px-3 py-1 text-sm font-medium text-ink-600 transition hover:border-brand-200 hover:text-brand-600"
          >
            Twitter
          </a>
        </div>
      </div>
      <p className="mt-6 text-xs text-ink-400">
        © {new Date().getFullYear()} Taletaff · Plateforme d&apos;opportunités sélectionnées.
      </p>
    </div>
  </footer>
);
