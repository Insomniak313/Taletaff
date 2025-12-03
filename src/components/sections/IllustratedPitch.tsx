import Image from "next/image";

const highlights = [
  {
    title: "Coaching onboarding",
    description: "Sessions live pour clarifier objectifs, motivations et freins opérationnels."
  },
  {
    title: "Playbooks secteur",
    description: "Guides Tailwind pour naviguer dans les filières agro, food & tech."
  },
  {
    title: "Suivi mesure",
    description: "Tableaux d'impact actualisés pour ajuster sourcing et entretiens."
  }
];

export const IllustratedPitch = () => (
  <section className="grid items-center gap-10 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">Accompagnement</p>
        <h2 className="text-3xl font-semibold text-ink-900">Des rituels visuels qui rassurent.</h2>
        <p className="text-sm text-ink-600">
          Nous articulons les rencontres candidates, managers et coachs autour de rituels illustrés pour rendre chaque
          étape lisible : priorisation, feedback, projection poste et montée en compétences.
        </p>
      </div>
      <ul className="space-y-3">
        {highlights.map((highlight) => (
          <li
            key={highlight.title}
            className="flex gap-4 rounded-3xl border border-brand-50/60 bg-brand-50/30 p-4 text-sm text-ink-700"
          >
            <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-base text-brand-600 shadow-sm">
              •
            </span>
            <div>
              <p className="font-semibold text-ink-900">{highlight.title}</p>
              <p>{highlight.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
    <div className="relative flex justify-center">
      <div className="absolute -inset-8 rounded-[48px] bg-gradient-to-br from-brand-100/40 to-brand-200/40 blur-3xl" />
      <div className="relative w-full max-w-sm rounded-[40px] border border-white/60 bg-white/90 p-6 shadow-xl">
        <div className="relative mx-auto w-full">
          <Image
            src="/illustrations/growth.svg"
            width={480}
            height={480}
            alt="Parcours illustré de progression Taletaff"
            className="h-auto w-full"
          />
        </div>
        <p className="mt-4 rounded-2xl bg-brand-50/60 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.3em] text-brand-600">
          Open source — illustrations Popsy
        </p>
      </div>
    </div>
  </section>
);
