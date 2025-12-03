# Opérations & déploiement

## Environnements cibles
- **Local** : Next.js via `npm run dev`, Supabase local (`supabase db start`) ou projet distant gratuit. Aucune authentification stricte sur `/api/jobs/sync` si `JOB_CRON_SECRET` est vide.
- **Preview** : Vercel crée automatiquement un environnement par Pull Request. Les variables d'environnement sont héritées depuis le projet principal (onglet *Environment Variables*). Utilisez un projet Supabase de staging pour éviter d'altérer la prod.
- **Production** : Vercel (hébergement front + API routes) + Supabase hébergé. Les scrapers tournent via un cron externe (Vercel Cron, GitHub Actions schedule ou toute infra capable d'appeler `POST /api/jobs/sync`).

## Déploiement Vercel
1. Connectez le repo GitHub depuis Vercel et choisissez `main` comme branche de production.
2. Renseignez toutes les variables `.env` dans Vercel (`NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, `JOB_CRON_SECRET`, clés providers). Marquez les secrets sensibles comme *Encrypted*.
3. Activez la protection des routes API sensibles en limitant l'accès via `JOB_CRON_SECRET` et l'authentification Supabase (`requireRole`).
4. Configurez les tâches planifiées :
   ```
   POST https://<project>.vercel.app/api/jobs/sync
   Headers: x-cron-secret: $JOB_CRON_SECRET
   Schedule: toutes les heures (ou selon le SLA souhaité)
   ```
5. Vérifiez que la commande `npm run build` passe sur Vercel (Turbopack). Les warnings perf/lint doivent être corrigés avant la mise en prod.

## CI/CD (GitHub Actions)
Le workflow `./.github/workflows/ci.yml` s'exécute sur chaque push/PR :
1. Installe les dépendances sur Node 20.
2. Provisionne un Postgres Supabase (via docker `supabase/postgres`).
3. Applique les migrations (`supabase db push`).
4. Lance `npm run lint`, `npm run typecheck`, `npm run test` avec couverture.

> Ajoutez vos checks (Playwright, Lighthouse CI, analyse bundle) dans ce workflow pour garantir l'alignement avec les budgets Web Vitals.

## Scheduler & scrapers
- **Secrets** : `JOB_CRON_SECRET` doit être défini en production. Toute requête à `/api/jobs/sync` sans ce header est rejetée (401).
- **Tables de suivi** : `job_provider_runs` (statuts, dates, erreur) et `job_provider_config` (endpoints/headers). Elles servent d'unique source de vérité pour l'état des scrapers.
- **Déclenchements manuels** :
  - `POST /api/jobs/bootstrap` (public) importe Remotive.
  - `POST /api/admin/scrapers/run` (auth admin) cible un provider spécifique.
- **Stratégie de rafraîchissement** : `JOB_REFRESH_INTERVAL_MS` (3 jours) empêche les runs trop fréquents si des offres existent déjà. Ajustez la constante dans `jobScheduler` en fonction du volume.
- **Gestion des erreurs** : En cas d'exception, le statut passe à `failed` et `error` est stocké. Le dashboard admin lit ces informations et peut alerter.

## Observabilité & maintenance
- **Logs** : Vercel fournit les logs des API routes. Filtrez `api/jobs/*` pour diagnostiquer un provider.
- **Metrics** : Surveillez le nombre d'offres (`select count(*) from jobs where source = ...`) et la fraîcheur (`max(fetched_at)`). Ajoutez idéalement un dashboard Supabase ou un alerting SQL.
- **Alerting** : configurez un check (ex : UptimeRobot) qui appelle `/api/jobs/bootstrap` ou `/api/jobs` pour vérifier que l'API répond < 500 ms.
- **Backups** : Supabase fournit des backups automatiques. Pour un export manuel, utilisez `supabase db dump --db-url ...`.
- **Rotation de secrets** : changez régulièrement les clés providers dans Supabase/Vercel et synchronisez-les via `job_provider_config` pour éviter un redéploiement.

## Sécurité & conformité
- Limitez l'accès à `SUPABASE_SERVICE_ROLE_KEY` aux seules API routes executées côté serveur (`runtime = "nodejs"`).
- Vérifiez que les policies RLS couvrent bien les nouvelles colonnes ajoutées dans les migrations.
- Les dashboards internes reposent sur Supabase Auth, aucun cookie tiers n'est nécessaire. Pensez à activer l'Auth PKCE côté Supabase si vous ouvrez la plateforme à l'externe.
- Les données personnelles sont limitées (emails + préférences). Documentez les procédures de purge dans Supabase si un utilisateur demande la suppression (GDPR).
