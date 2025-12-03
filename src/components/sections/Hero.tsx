import Link from "next/link";

const trustSignals = [
  { label: "Process moyen", value: "12 jours" },
  { label: "Offres validées", value: "100 %" },
  { label: "Satisfaction candidats", value: "4.9 / 5" }
];

export const Hero = () => (
  <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 px-6 py-12 text-center shadow-glow">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent" />
    <div className="relative space-y-6">
      <span className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
        Nouvelle version
        <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-0.5 text-[11px] font-medium text-ink-600">
          Accès early adopters
        </span>
      </span>
      <h1 className="text-4xl font-semibold leading-tight text-ink-900 md:text-5xl">
        Trouvez un emploi aligné avec vos ambitions.
      </h1>
      <p className="mx-auto max-w-3xl text-lg text-ink-600">
        Taletaff combine expertise humaine et matching intelligent pour vous ouvrir les portes des entreprises
        qui vous ressemblent. Transparence, rythme d&apos;exécution et coaching premium, réunis dans une expérience
        fluide.
      </p>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-0.5"
        >
          Me connecter
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full border border-ink-100 bg-white/70 px-6 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
        >
          Créer mon compte
        </Link>
      </div>
      <p className="text-sm text-ink-500">
        Juste curieux ?{" "}
        <Link href="/jobs" className="font-semibold text-brand-600 underline-offset-4 transition hover:underline">
          Parcourir les offres
        </Link>
      </p>
      <ul className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        {trustSignals.map((signal) => (
          <li
            key={signal.label}
            className="rounded-3xl border border-white/80 bg-gradient-to-br from-white to-brand-50/40 px-5 py-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-ink-500">{signal.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{signal.value}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
