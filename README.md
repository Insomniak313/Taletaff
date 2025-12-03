# Taletaff

![CI](https://img.shields.io/badge/CI-GitHub%20Actions-0A0)
![Tests](https://img.shields.io/badge/tests-Vitest%20100%25-success)
![Coverage](https://img.shields.io/badge/couverture-100%25-brightgreen)
![Node](https://img.shields.io/badge/node-20.x-43853d)
![Status](https://img.shields.io/badge/deployment-Vercel-black)

Plateforme Next.js 16 (App Router) hébergée sur Vercel qui aligne Supabase, Tailwind CSS et un orchestrateur de scrapers pour mettre en avant les meilleures offres tech, produit, marketing et operations. L'expérience est pensée mobile-first, typée de bout en bout et optimisée pour Core Web Vitals.

## Sommaire
- [Vue rapide](#vue-rapide)
- [Architecture en bref](#architecture-en-bref)
- [Stack & dépendances](#stack--dépendances)
- [Démarrage rapide](#démarrage-rapide)
- [Commandes principales](#commandes-principales)
- [Structure du repo](#structure-du-repo)
- [Supabase & données](#supabase--données)
- [Tests & qualité](#tests--qualité)
- [Documentation détaillée](#documentation-détaillée)

## Vue rapide
- Authentification complète (inscription, connexion, reset) via Supabase Auth et formulaires réutilisables (`AuthForm`, `useAuthForm`).
- Parcours SEO-first : pages statiques par catégorie (`/jobs/[category]`), sitemap généré, métadonnées consolidées dans `siteMetadata`.
- Dashboard multi-rôles protégé par `RoleGuard` avec vues admin, employeur, candidat et modération.
- Agrégation d'offres via 10+ providers français + Remotive, normalisation et upsert de masse (`jobScraper`, `jobScheduler`).
- Composants UI < 100 lignes, stylés avec Tailwind et rendus en mode RSC + Suspense pour les sections non critiques.
- Observabilité par CI GitHub Actions (lint, typecheck, Vitest coverage 100 %) et cron scheduler (`POST /api/jobs/sync`).

## Architecture en bref
- **App Router** : routes publiques (`src/app`), API Next (auth, jobs, cron) et pages spécialisées (dashboard par rôle).
- **Features isolées** : `src/features/auth`, `src/features/jobs`, `src/features/dashboard` regroupent composants, hooks et services dédiés pour limiter les couplages.
- **Libs partagées** : `src/lib/env.*` impose des variables typées, `supabase/browser|server` encapsulent les clients.
- **Ingestion d'offres** : `providers` définit chaque source, `jobScraper` normalise puis `jobScheduler` pilote l'exécution et loggue les runs dans Supabase.
- **API internes** : `/api/jobs` expose la recherche, `/api/jobs/bootstrap` déclenche Remotive (public), `/api/jobs/sync` est protégé par `JOB_CRON_SECRET`.

## Stack & dépendances
- Next.js 16 + React 19 (Server Components, Suspense, dynamic imports ciblés).
- Tailwind CSS 3.4 avec design tokens utilitaires (voir `src/app/globals.css`).
- Supabase (Postgres + Auth) géré via Supabase CLI et migrations versionnées dans `supabase/migrations`.
- Vitest + Testing Library + MSW pour la simulation côté réseau.
- ESLint 9 + TypeScript 5.6 (mode strict) + configuration App Router.
- Dockerfile multi-étapes et `docker-compose.yml` pour un environnement de dev hermétique.

## Démarrage rapide
1. **Pré-requis** : Node 20, npm 10, Supabase CLI (`brew install supabase/tap/supabase`), Docker (optionnel).
2. **Config**  
   ```bash
   cp .env.example .env
   # Renseignez les clés Supabase + endpoints providers requis
   ```
3. **Installer & lancer**  
   ```bash
   npm install
   npm run dev
   ```
4. **Base locale (optionnel mais conseillé)**  
   ```bash
   supabase db start            # démarre Postgres local
   supabase db reset            # applique toutes les migrations SQL
   ```
5. **Injecter des offres démo** : exécutez `POST http://localhost:3000/api/jobs/bootstrap` pour importer Remotive.

### Avec Docker
```bash
make docker-up        # build + run dev (hot reload 0.0.0.0:3000)
make docker-logs      # suivre les logs
make docker-down      # arrêter et nettoyer
```

## Commandes principales
- `npm run dev` : Next.js + HMR.
- `npm run build` : build production (analyzers + code splitting optimisé).
- `npm run start` : lance le build localement (simulateur Vercel).
- `npm run lint` : ESLint (config Next Core Web Vitals).
- `npm run typecheck` : `tsc --noEmit`.
- `npm run test` / `npm run test:watch` : Vitest + couverture V8 100 %.

## Structure du repo
```
src/
  app/                  # Routes Next.js (auth, jobs, dashboard, API)
  components/           # Layout + sections UI partagées
  config/               # Métadonnées site, catégories, routes par rôle
  features/             # Domaines auth / jobs / dashboard
    jobs/
      providers/        # Connecteurs + configuration dynamique
      scheduler/        # Orchestrateur + règles d'éligibilité
      scraper/          # Normalisation + upsert Supabase
  hooks/                # Hooks personnalisés (auth, recherche)
  lib/                  # Clients Supabase + env typés (client/server)
  services/             # Accès Supabase côté serveur/client
  types/ & utils/       # Typages partagés + helpers format
supabase/migrations/    # Schéma Postgres versionné (jobs, runs, config)
```

## Supabase & données
1. **Migrations** : exécutez `supabase db push` pour créer `jobs`, `job_provider_runs`, `job_provider_config` ainsi que les index et triggers `updated_at`.
2. **Sécurité** : RLS activée (policy `jobs public read`). Les écritures passent exclusivement par les API Next côté serveur ou par le scheduler.
3. **Providers** : chaque source peut être pilotée par env (`FRANCE_TRAVAIL_API_URL`, …) ou via la table `job_provider_config`. Voir `providerConfigStore` pour l'ordre de priorité.
4. **Cron** : appelez `/api/jobs/sync` avec l'en-tête `x-cron-secret: $JOB_CRON_SECRET` (configurable dans `.env`). En production, brancher un cron Vercel ou GitHub Actions schedule.
5. **Bootstrap** : l'endpoint `/api/jobs/bootstrap` importe Remotive sans secret pour disposer de données dès l'onboarding produit.

## Tests & qualité
- Couverture 100 % exigée (`vitest run --coverage`) : tests unitaires (`src/__tests__`) couvrent services, hooks, config et composants critiques.
- ESLint + TypeScript strict bloquent les PR via la CI GitHub Actions (`.github/workflows/ci.yml`).
- Les migrations sont rejouées dans la CI via `supabase db push` contre un Postgres éphémère.
- Les PR doivent vérifier accessibilité (Tailwind + ARIA), LCP < 2,5 s (Lazy load sections non critiques), budget bundle < 160 kB grâce au code splitting.

## Documentation détaillée
- `docs/README.md` : table des matières & conventions.
- `docs/architecture.md` : schéma complet (flux front, ingestion, SEO).
- `docs/development.md` : setup local, outils, debug et données seed.
- `docs/operations.md` : déploiement Vercel, secrets, scheduler & monitoring.
- `docs/quality.md` : stratégie de tests, obligations perf/accessibilité, checklist PR.
- `docs/contributing.md` : guide contribution (workflow git, normes, checklist PR).

## Comment contribuer
1. Créez une branche descriptive (`feature/job-card-skeleton`).
2. Implémentez la fonctionnalité en respectant les conventions (exports nommés, composants < 100 lignes, interfaces TS).
3. Ajoutez/actualisez les tests pertinents (`npm run test`) et exécutez `npm run lint && npm run typecheck`.
4. Mettez à jour la documentation si le comportement évolue (`docs/` ou ce README).
5. Ouvrez une Pull Request détaillant :
   - le besoin business
   - les impacts techniques (routes, migrations, env vars)
   - la validation (captures, tests, métriques perf).

Voir `docs/contributing.md` pour les exemples de messages de commit, la stratégie de branchement et la checklist complète PR.

> Besoin d'un panorama plus approfondi ? Consultez le dossier `docs/` pour les guides détaillés, schémas d'architecture et checklists opérationnelles.
