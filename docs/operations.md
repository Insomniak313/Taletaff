# Operations & Deployment

## Target environments
- **Local**: Next.js via `npm run dev`, Supabase local (`supabase db start`) or a remote personal project. `/api/jobs/sync` can stay open if `JOB_CRON_SECRET` is blank.
- **Preview**: Vercel automatically provisions one environment per Pull Request. Inherit env vars from the main project (Settings → Environment Variables) and point to a staging Supabase project.
- **Production**: Vercel (front + API routes) and hosted Supabase. Scrapers run through an external cron (Vercel Cron, GitHub Actions schedule, any worker hitting `POST /api/jobs/sync`).

## Vercel deployment
1. Connect the GitHub repo to Vercel and select `main` as the production branch.
2. Populate every `.env` variable in Vercel (`NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, `JOB_CRON_SECRET`, provider keys) and mark sensitive ones as *Encrypted*.
3. Secure sensitive API routes with `JOB_CRON_SECRET` plus Supabase Auth (`requireRole`) where relevant.
4. Set up scheduled jobs:
   ```
   POST https://<project>.vercel.app/api/jobs/sync
   Headers: x-cron-secret: $JOB_CRON_SECRET
   Schedule: hourly (tune to your SLA)
   ```
5. Ensure `npm run build` succeeds (Turbopack) and fix any lint/perf warning before deploying to production.

## CI/CD (GitHub Actions)
Workflow `./.github/workflows/ci.yml` runs on every push/PR:
1. Installs dependencies on Node 20.
2. Spins up a Supabase Postgres container.
3. Applies migrations (`supabase db push`).
4. Runs `npm run lint`, `npm run typecheck`, `npm run test` with coverage.

> Extend this workflow with Playwright, Lighthouse CI or bundle analysis to keep performance budgets honest.

### Supabase migrations automation
- Workflow `./.github/workflows/supabase-migrations.yml` se déclenche sur `main` (ou à la demande via `workflow_dispatch`) et applique automatiquement les migrations sur l'environnement Supabase géré.
- Ajoutez le secret `SUPABASE_DB_URL` côté GitHub (`postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require`). Optionnel : définissez aussi `PGSSLMODE=require` si votre instance l'impose.
- Les migrations sont poussées via `supabase db push --db-url "$SUPABASE_DB_URL"` pour garantir que chaque push validé synchronise la base distante sans action manuelle.

## Scheduler & scrapers
- **Secrets**: `JOB_CRON_SECRET` must be defined in production. Requests lacking the header are rejected (401).
- **Tracking tables**: `job_provider_runs` (status, timestamps, error) and `job_provider_config` (endpoints/headers) act as the single source of truth for scraper state.
- **Manual triggers**:
  - `POST /api/jobs/bootstrap` (public) imports Remotive.
  - `POST /api/admin/scrapers/run` (admin auth) runs a specific provider.
- **Refresh policy**: `JOB_REFRESH_INTERVAL_MS` (3 days) prevents over-fetching if jobs already exist. Tweak the constant inside `jobScheduler` if volume requirements change.
- **Error handling**: failures move the status to `failed` and persist the error message. The admin dashboard surfaces these signals.

## Observability & maintenance
- **Logs**: Vercel exposes API route logs. Filter by `api/jobs/*` to debug providers.
- **Metrics**: monitor job counts (`select count(*) from jobs where source = ...`) and freshness (`max(fetched_at)`). Consider a Supabase dashboard or SQL alerts.
- **Uptime**: set up a synthetic check (UptimeRobot, Cronitor) hitting `/api/jobs/bootstrap` or `/api/jobs` to ensure responses stay under 500 ms.
- **Backups**: Supabase provides automatic backups. For manual exports, run `supabase db dump --db-url ...`.
- **Secret rotation**: rotate provider keys regularly within Supabase/Vercel and sync them through `job_provider_config` to avoid redeploys.

## Security & compliance
- Restrict `SUPABASE_SERVICE_ROLE_KEY` usage to server-only API routes (`runtime = "nodejs"`).
- Update RLS policies whenever migrations introduce new columns.
- Dashboards rely on Supabase Auth only—no third-party cookies. Enable PKCE if exposing the platform externally.
- PII is minimal (emails + category preferences). Document deletion workflows inside Supabase to satisfy GDPR requests.
