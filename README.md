# Taletaff

Plateforme Next.js hébergée sur Vercel qui connecte les talents aux meilleures opportunités tech, produit, marketing et operations. L'application s'appuie sur Supabase pour la persistance et fournit une expérience responsive propulsée par Tailwind CSS.

## Fonctionnalités clés
- Parcours complet d'authentification (inscription, connexion, reset) avec Supabase Auth.
- Recherche d'offres par catégorie avec filtres en temps réel et pages SEO statiques par métier.
- Composants React < 100 lignes, typés, organisés par domaines, avec hooks personnalisés (`useAuthForm`, `useJobSearch`).
- Chargement paresseux et `Suspense` pour les sections non critiques afin d'améliorer le chunking.
- Docker + Makefile pour un environnement de dev reproductible, CI GitHub Actions, couverture de tests à 100 % (Vitest + Testing Library).

## Stack
- Next.js 16 (App Router) + React 19
- Tailwind CSS 3.4 + composants utilitaires typés
- Supabase (auth + données)
- Vitest / Testing Library pour les tests unitaires et d'intégration

## Démarrage rapide
```bash
cp .env.example .env # renseignez vos clés Supabase
npm install
npm run dev
```

### Avec Docker
```bash
make docker-up        # build + run en mode dev (hot reload)
make docker-logs      # suivre les logs
make docker-down      # arrêter les services
```

## Scripts utiles
- `npm run dev` : serveur Next.js avec hot reload
- `npm run build` : build Vercel-ready (code splitting optimisé)
- `npm run start` : démarrer le build
- `npm run lint` : ESLint (core web vitals)
- `npm run typecheck` : vérification TS stricte
- `npm run test` / `npm run test:watch` : Vitest avec couverture 100 %

## Structure
```
src/
  app/                  # Routes Next.js (auth, jobs, API)
  components/           # Layout + sections UI
  config/               # Métadonnées site + catégories
  features/             # Composants métier (auth, jobs)
  hooks/                # Hooks personnalisés (auth/job search)
  lib/                  # Clients Supabase + env typés
  services/             # Accès Supabase côté serveur / client
  types/ & utils/       # Typages partagés + helpers
```

## Supabase
1. Créez un projet Supabase et une table `jobs` avec les colonnes : `id uuid`, `title text`, `company text`, `location text`, `category text`, `description text`, `remote boolean`, `salary_min numeric`, `salary_max numeric`, `tags text[]`, `created_at timestamptz`.
2. Activez RLS et ajoutez les policies souhaitées.
3. Renseignez les clés dans `.env` (seule la clé `SUPABASE_SERVICE_ROLE_KEY` est utilisée côté serveur).

## Tests & Qualité
- Couverture minimale forcée (100 % lignes/fonctions/branches) via Vitest.
- Tests unitaires : services, hooks, formatters, configuration.
- Tests d'intégration : composants React clés et flux des hooks.
- Surveillance CI : un cron nightly relance lint, typecheck et tests pour détecter les régressions silencieuses.
- CI (/.github/workflows/ci.yml) : lint + typecheck + tests sur Node 20.

## Déploiement Vercel
1. Poussez sur GitHub, créez un projet Vercel connecté.
2. Renseignez les variables d'environnement identiques à `.env`.
3. Ajoutez Supabase comme ressource externe.

## Makefile
Consultez `Makefile` pour automatiser les tâches (install, lint, test, docker). Les commandes s'intègrent facilement dans la CI/CD.
