const stories = [
  {
    name: "Léa, Head of Product",
    quote:
      "Process en 12 jours avec 3 propositions fermes. Taletaff a challengé la rémunération et obtenu un package de 20 % supérieur."
  },
  {
    name: "Adam, Staff Engineer",
    quote:
      "J'ai ciblé uniquement des scale-ups série C et obtenu des entretiens directement avec les CTO."
  }
];

export const SuccessStories = () => (
  <section className="overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-brand-50/50 to-white p-6 shadow-lg">
    <header className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Confiance</p>
      <h3 className="mt-2 text-2xl font-semibold text-ink-900">Ils racontent l&apos;expérience Taletaff</h3>
      <p className="text-sm text-ink-500">Des accompagnements humains, une cadence d&apos;exécution rassurante.</p>
    </header>
    <div className="space-y-6">
      {stories.map((story) => (
        <figure key={story.name} className="rounded-3xl border border-white/60 bg-white/70 p-5">
          <blockquote className="text-base text-ink-700">“{story.quote}”</blockquote>
          <figcaption className="mt-3 text-sm font-semibold text-ink-900">{story.name}</figcaption>
        </figure>
      ))}
    </div>
  </section>
);
