const insights = [
  {
    title: "100 % vérifié",
    description: "Chaque offre passe par 18 points de contrôle salaire, stack et sponsor.",
    icon: "✨"
  },
  {
    title: "Matching intelligent",
    description: "Les préférences candidats sont croisées avec les critères hiring managers.",
    icon: "🤝"
  },
  {
    title: "Coaching dédié",
    description: "Préparation aux entretiens et négociation par des experts du recrutement.",
    icon: "🎯"
  }
];

export const InsightList = () => (
  <section className="grid gap-4 md:grid-cols-3">
    {insights.map((insight) => (
      <article
        key={insight.title}
        className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-md transition hover:-translate-y-1 hover:border-brand-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative space-y-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-xl">
            {insight.icon}
          </span>
          <h3 className="text-base font-semibold text-ink-900">{insight.title}</h3>
          <p className="text-sm text-ink-600">{insight.description}</p>
        </div>
      </article>
    ))}
  </section>
);
