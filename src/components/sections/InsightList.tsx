const insights = [
  {
    title: "100 % vérifié",
    description: "Chaque offre passe par 18 points de contrôle salaire, stack et sponsor.",
  },
  {
    title: "Matching intelligent",
    description: "Les préférences candidats sont croisées avec les critères hiring managers.",
  },
  {
    title: "Coaching dédié",
    description: "Préparation aux entretiens et négociation par des experts du recrutement.",
  },
];

export const InsightList = () => (
  <section className="grid gap-4 md:grid-cols-3">
    {insights.map((insight) => (
      <article
        key={insight.title}
        className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900">{insight.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
      </article>
    ))}
  </section>
);
