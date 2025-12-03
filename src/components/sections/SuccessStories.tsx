const stories = [
  {
    name: "Léa, Head of Product",
    quote:
      "Process en 12 jours avec 3 propositions fermes. Taletaff a challengé la rémunération et obtenu un package de 20 % supérieur.",
  },
  {
    name: "Adam, Staff Engineer",
    quote:
      "J'ai ciblé uniquement des scale-ups série C et obtenu des entretiens directement avec les CTO.",
  },
];

export const SuccessStories = () => (
  <section className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
    <div className="space-y-4">
      {stories.map((story) => (
        <figure key={story.name} className="space-y-2">
          <blockquote className="text-base text-slate-700">“{story.quote}”</blockquote>
          <figcaption className="text-sm font-semibold text-slate-900">
            {story.name}
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);
