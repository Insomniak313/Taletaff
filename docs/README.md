# Documentation Taletaff

Ce dossier rassemble les guides opérationnels et techniques nécessaires pour maintenir, faire évoluer et opérer Taletaff sans connaissance préalable du contexte. Chaque document va droit au but et référence les fichiers sources pertinents afin de réduire le temps de ramp-up.

## Objectifs
- Donner une vision partagée de l'architecture et des choix techniques majeurs.
- Décrire un workflow de développement reproductible (env, migrations, données seed).
- Documenter les attentes d'exploitation (déploiements, cron scrapers, observabilité).
- Capturer l'exigence qualité (tests, performance, accessibilité, checklist PR).

## Table des matières
- [Architecture](./architecture.md) · Modules front, pipeline d'ingestion, SEO, points d'extension.
- [Développement](./development.md) · Setup local, variables d'environnement, données de tests, tips de debug.
- [Opérations](./operations.md) · Déploiement Vercel, secrets, CI/CD, scheduler et surveillance.
- [Qualité](./quality.md) · Stratégie de tests, normes de code, budgets de performances et checklist de revue.
- [Contribution](./contributing.md) · Workflow git, conventions de code, checklist avant PR et attentes de revue.

## Conventions de lecture
- Les chemins sont relatifs à la racine du repo (ex : `src/features/jobs/scheduler/jobScheduler.ts`).
- Les commandes shell sont destinées à macOS/Linux (remplacez `npm` par `pnpm` si besoin).
- Les variables d'environnement sont notées `SCREAMING_SNAKE_CASE` et proviennent de `.env` ou Supabase.
- Tout code cité est en TypeScript/TSX. Aucun composant n'utilise d'export par défaut, conformément aux conventions du projet.

## Glossaire rapide
- **Provider** : connecteur REST définissant comment récupérer et normaliser les offres d'une source externe (`features/jobs/providers`).
- **Scheduler** : orchestrateur qui détermine les providers à exécuter et journalise chaque run (`jobScheduler`).
- **Run** : exécution d'un provider, historisée dans `job_provider_runs` avec statut et message d'erreur.
- **RLS** : Row Level Security côté Supabase, activée pour fournir un accès lecture public tout en protégeant les écritures.
- **RSC** : React Server Components, utilisés pour les pages du dossier `src/app` afin de limiter le JavaScript envoyé au client.
