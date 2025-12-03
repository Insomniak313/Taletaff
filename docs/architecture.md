# Architecture Taletaff

## Vue d'ensemble
Taletaff est une application Next.js App Router qui sert deux responsabilités majeures : une interface publique orientée SEO (landing + recherche d'offres) et un cockpit multi-rôles pour les équipes internes. L'ensemble des données provient de Supabase : Postgres stocke les offres agrégées, Supabase Auth gère les sessions, et des API routes orchestrent l'ingestion depuis des providers externes.

La philosophie architecturale repose sur :
- **Découplage par domaines** (`src/features/*`) pour isoler l'auth, les jobs et le dashboard.
- **Services typés** (`src/services/*.ts`) qui encapsulent Supabase côté server/client.
- **Hooks déclaratifs** (`src/hooks`) pour encapsuler les side-effects (auth, recherche) exploités par des composants fonctionnels.
- **Pipelines explicites** pour l'ingestion (providers → scraper → scheduler) et la historisation (tables `job_provider_runs` et `job_provider_config`).

## Modules front principaux
| Zone | Description | Fichiers clés |
| --- | --- | --- |
| Landing & SEO | Pages publiques (`/`, `/jobs`, `/jobs/[category]`) rendues via RSC avec composants `components/sections/*`. Structured data et sitemap résident dans `src/components/Seo` + `src/app/robots.ts`. | `src/app/page.tsx`, `src/app/jobs/[category]/page.tsx`, `src/components/sections/*`, `src/components/Seo/StructuredData.tsx` |
| Auth | Formulaires composables (`AuthForm`, `ForgotPasswordForm`, `CategoryPreferences`) orchestrés par Supabase Auth via `authService` et `useAuthForm`. | `src/(auth)/*`, `src/features/auth/components`, `src/services/authService.ts`, `src/hooks/useAuthForm.ts` |
| Dashboard multi-rôles | Chaque rôle possède une page dédiée dans `src/app/dashboard/*` et consomme les composants du dossier `features/dashboard/components`. L'accès est contrôlé par `RoleGuard`. | `src/app/dashboard/**/page.tsx`, `src/features/dashboard/components/*`, `src/features/auth/components/RoleGuard.tsx` |
| Recherche d'offres | Les composants `features/jobs/components/*` exposent grille, cartes et filtres. `useJobSearch` pilote la recherche côté client alors que `jobService` interroge Supabase côté server/API. | `src/features/jobs/components/*`, `src/hooks/useJobSearch.ts`, `src/services/jobService.ts`, `src/app/api/jobs/route.ts` |

## Flux d'ingestion des offres
1. **Configuration** : chaque provider est décrit dans `src/features/jobs/providers/frProviders.ts` et expose un `JobProvider` (endpoint, mapping, headers). Les valeurs par défaut proviennent des variables d'environnement (`.env.example`).
2. **Override dynamiques** : `providerConfigStore` lit/écrit dans la table `job_provider_config` pour fixer un endpoint, un token ou des headers spécifiques à l'exécution.
3. **Scraping** : `scrapeProvider` (fichier `features/jobs/scraper/jobScraper.ts`) appelle le provider, normalise les champs puis upsert par paquets de 200 dans `jobs` (clé composite `source/external_id`).
4. **Planification** : `jobScheduler` (fichier `features/jobs/scheduler/jobScheduler.ts`) calcule les providers à relancer selon `JOB_REFRESH_INTERVAL_MS` (3 jours), l'état précédent (`job_provider_runs`) et la configuration active.
5. **API d'exécution** : 
   - `POST /api/jobs/sync` (protégé par `JOB_CRON_SECRET`) déclenche la synchronisation pour tous les providers « due ».
   - `POST /api/jobs/bootstrap` exécute seulement Remotive pour disposer de données publiques.
   - `POST /api/admin/scrapers/run` (voir `src/app/api/admin/scrapers/run/route.ts`) permet à l'équipe opérateur de cibler un provider depuis l'interface admin.
6. **Observabilité** : chaque run met à jour `job_provider_runs` avec `status`, `last_run_at`, `last_success_at` et un éventuel `error`. Ces données alimentent les panneaux `ScraperStatusPanel` dans le dashboard admin.

## Authentification & gestion des rôles
- **Supabase Auth** stocke les rôles (`jobseeker`, `employer`, `admin`, `moderator`) dans `user_metadata.role`. Lors de l'inscription (`authService.signUp`), les préférences de catégories et le rôle sont persistés.
- **Sessions côté client** : `useCurrentUser` instancie un client Supabase browser-side, observe `authStateChange` et expose `{ session, role, isLoading }`.
- **Protection des routes** : `RoleGuard` redirige vers `/login` ou vers la home du rôle (`ROLE_HOME_ROUTE`) si le profil n'est pas autorisé.
- **API sensibles** : les routes dans `src/app/api/admin/*` sont exécutées côté server uniquement (`runtime = "nodejs"`) et reposent sur `supabaseAdmin()` pour accéder aux tables restreintes.

## SEO, rendu et performance
- **Métadonnées** : `src/config/siteMetadata.ts` centralise titre, description, mots-clés, liens sociaux et logique d'URL absolue; utilisé dans `layout.tsx` et `sitemap.ts`.
- **Structured Data** : `StructuredData` génère des JSON-LD pour le Hero et les offres afin d'améliorer la découvrabilité.
- **Pages statiques par catégorie** : Next génère `/jobs/[category]` grâce aux catégories définies dans `config/jobCategories.ts` pour offrir une page optimisée SEO par spécialité.
- **Rendering strategy** : composants critiques sont livrés via RSC, tandis que les sections volumineuses (`SuccessStoriesLoader`) sont chargées paresseusement avec `Suspense` + fallback léger pour respecter les budgets LCP.
- **Optimisation bundle** : `npm run build` s'appuie sur la configuration Next 16 (Turbopack) et privilégie les imports ciblés (`clsx`, supabase) pour éviter les chunks monolithiques.

## Points d'extension
- **Ajouter un provider** : implémentez `createJsonProvider` dans `frProviders.ts`, ajoutez les clés env correspondantes dans `.env.example` et, si besoin, créez une migration pour enrichir `job_provider_config`.
- **Étendre le dashboard** : placez les nouveaux panneaux dans `features/dashboard/components` et ajoutez-les dans la page correspondante (`src/app/dashboard/<role>/page.tsx`).
- **Nouvelles pages SEO** : enrichissez `config/jobCategories.ts` pour générer automatiquement le routing et la navigation filtrée.
- **Automations** : branchez vos scripts sur `providerConfigStore.upsertSettings` (ex : interface interne) pour mettre à jour les endpoints sans redéployer.

Pour des workflows concrets (setup local, déploiement, qualité), référez-vous aux autres guides du dossier `docs/`.
