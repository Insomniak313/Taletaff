# Guide de développement

Ce guide décrit le setup local recommandé, la configuration des variables d'environnement et les réflexes à adopter pour livrer des fonctionnalités en toute confiance.

## Prérequis
- Node.js 20.x et npm 10.x (`nvm install 20 && nvm use 20`).
- Supabase CLI ≥ 1.195 (`brew install supabase/tap/supabase`).
- Docker Desktop (optionnel, pour exécuter Postgres via `supabase db start` ou lancer l'app via `make docker-up`).
- Un compte Supabase (projet perso) pour disposer des clés `anon` et `service_role`.
- Outils de requêtage HTTP (Hoppscotch, cURL, Bruno) pour piloter les API `/api/jobs/*`.

## Installation initiale
1. **Cloner et installer**
   ```bash
   git clone <repo>
   cd taletaff
   npm install
   ```
2. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Renseignez au minimum les clés Supabase + NEXT_PUBLIC_SITE_URL
   ```
3. **Lancer Supabase localement** (optionnel mais recommandé)
   ```bash
   supabase db start
   supabase db reset   # applique toutes les migrations SQL dans supabase/migrations
   ```
4. **Démarrer Next.js**
   ```bash
   npm run dev
   # Accès: http://localhost:3000
   ```
5. **Générer des données**
   ```bash
   curl -X POST http://localhost:3000/api/jobs/bootstrap
   # Import Remotive (20 offres). À répéter si besoin.
   ```

## Variables d'environnement
| Variable | Description | Portée |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (copiée depuis `Project Settings > API`). | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme utilisée côté navigateur (`supabaseBrowser`). | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service pour les opérations server-side (scheduler, API admin). **Ne jamais exposer côté client.** | Server |
| `NEXT_PUBLIC_SITE_URL` | URL publique (utilisée pour SEO, sitemap, meta og). | Client |
| `NEXT_PUBLIC_DEFAULT_REDIRECT` | URL de redirection après reset/password (souvent `/dashboard`). | Client |
| `JOB_CRON_SECRET` | Secret partagé pour sécuriser `POST /api/jobs/sync`. Laisser vide pour le dev local. | Server |
| `FRANCE_TRAVAIL_API_URL`, `APEC_API_URL`, ... | Endpoints providers. Si vides, le provider est marqué « disabled ». | Server |
| `FRANCE_TRAVAIL_API_TOKEN`, `APEC_API_TOKEN`, ... | Credentials providers (Bearer token ou clé API). | Server |

> Astuce : pour éviter de multiplier les secrets en local, vous pouvez ne configurer que Remotive (aucune clé requise) et activer ponctuellement un provider supplémentaire via `job_provider_config`.

## Workflow quotidien
1. **Développement**
   - `npm run dev` : Next.js + Fast Refresh.
   - `npm run lint -- --fix` : corrige les dérives simples.
   - `npm run test:watch` : lance Vitest en mode watch (avec couverture à jour).
2. **Migrations**
   - Créez une nouvelle migration via `supabase migration new <name>` puis éditez le SQL dans `supabase/migrations`.
   - Appliquez-la en local avec `supabase db push` ou `supabase db reset` si besoin d'un reset complet.
3. **Données**
   - Utilisez `/api/jobs/bootstrap` pour obtenir un jeu d'offres.
   - Pour tester un provider cible, authentifiez-vous en tant qu'admin puis envoyez `POST /api/admin/scrapers/run` avec un corps `{ "providerId": "france-travail" }`. L'API vérifie la session Supabase via `requireRole`.
4. **Avant PR**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```
   Tous doivent passer localement avant d'ouvrir une Pull Request.

## Tips de debug
- **Supabase Studio** : inspectez `jobs`, `job_provider_runs` et `job_provider_config` pour vérifier les écritures depuis le scheduler.
- **Logs Next** : ajoutez `console.info` dans les API routes (`src/app/api/**/*/route.ts`). Elles s'exécutent côté serveur Node, donc les logs apparaissent dans le terminal.
- **Vitest** : utilisez `npm run test -- --runInBand --reporter verbose` pour suivre un test flaky, et `npx vitest related src/features/jobs/providers/providerFactory.ts` pour ne lancer que les tests pertinents.
- **Inspection réseau** : activez l'onglet Network pour confirmer que les bundles paresseux sont bien chargés (SuccessStories, Dashboard). Les routes App Router permettent de vérifier l'utilisation de `Suspense`.
- **Hot reload stable** : si Next 16/Turbopack devient instable, vous pouvez forcer le fallback webpack en définissant `TURBOPACK=0 npm run dev` (rarement nécessaire).

## Nettoyage & outils utiles
- `npm run lint -- --max-warnings=0` pour transformer les warnings en erreurs.
- `docker system prune` si les volumes créés par `make docker-up` prennent trop de place.
- `supabase functions serve` n'est pas utilisé ici ; tous les traitements server-side vivent dans les API routes Next.
- Pensez à activer le `EditorConfig`/`Prettier` de votre IDE pour respecter les conventions (pas d'export par défaut, prioriser les interfaces, etc.).
