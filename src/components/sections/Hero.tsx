import Link from "next/link";

export const Hero = () => (
  <section className="mx-auto max-w-4xl text-center">
    <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
      Nouvelle version · Accès early adopters
    </p>
    <h1 className="mt-4 text-4xl font-semibold text-slate-900 md:text-5xl">
      Trouvez un emploi aligné avec vos ambitions.
    </h1>
    <p className="mt-4 text-lg text-slate-600">
      Taletaff centralise les opportunités les plus qualitatives, valide les entreprises et vous connecte directement aux décideurs.
    </p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Link
        href="/login"
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500"
      >
        Me connecter
      </Link>
      <Link
        href="/signup"
        className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
      >
        Créer mon compte
      </Link>
    </div>
    <p className="mt-4 text-sm text-slate-600">
      Juste curieux ?{" "}
      <Link href="/jobs" className="font-semibold text-brand-600">
        Parcourir les offres
      </Link>
    </p>
  </section>
);
