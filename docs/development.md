# Development Guide

This guide covers the recommended local setup, environment configuration and habits to ship features confidently.

## Prerequisites
- Node.js 20.x and npm 10.x (`nvm install 20 && nvm use 20`).
- Supabase CLI ≥ 1.195 (`brew install supabase/tap/supabase`).
- Docker Desktop (optional) to run Postgres via `supabase db start` or to launch the app with `make docker-up`.
- A Supabase project (personal/staging) to obtain `anon` and `service_role` keys.
- An HTTP client (Hoppscotch, cURL, Bruno) to hit `/api/jobs/*` endpoints.

## Initial installation
1. **Clone & install**
   ```bash
   git clone <repo>
   cd taletaff
   npm install
   ```
2. **Configure env vars**
   ```bash
   cp .env.example .env
   # Fill at least Supabase keys + NEXT_PUBLIC_SITE_URL
   ```
3. **Start Supabase locally** (optional but recommended)
   ```bash
   supabase db start
   supabase db reset   # applies every SQL migration under supabase/migrations
   ```
4. **Run Next.js**
   ```bash
   npm run dev
   # http://localhost:3000
   ```
5. **Seed data**
   ```bash
   curl -X POST http://localhost:3000/api/jobs/bootstrap
   # Imports 20 Remotive jobs; repeat whenever needed.
   ```

## Environment variables
| Variable | Description | Scope |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`Project Settings > API`). | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key used by the browser client (`supabaseBrowser`). | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key for server-side operations (scheduler, admin APIs). **Never expose client-side.** | Server |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO, sitemap, OG tags). | Client |
| `NEXT_PUBLIC_DEFAULT_REDIRECT` | Post-reset redirect URL (usually `/dashboard`). | Client |
| `JOB_CRON_SECRET` | Shared secret securing `POST /api/jobs/sync`. Leave blank in local dev. | Server |
| `FRANCE_TRAVAIL_API_URL`, `APEC_API_URL`, … | Provider endpoints. If empty, the provider is considered disabled. | Server |
| `FRANCE_TRAVAIL_API_TOKEN`, `APEC_API_TOKEN`, … | Provider credentials (Bearer tokens/API keys). | Server |

> Tip: to avoid juggling secrets locally, configure only Remotive (no key required) and use `job_provider_config` overrides when testing other connectors.

## Daily workflow
1. **Development**
   - `npm run dev`: Next.js + Fast Refresh.
   - `npm run lint -- --fix`: auto-fix trivial issues.
   - `npm run test:watch`: Vitest in watch mode (coverage maintained).
2. **Migrations**
   - Create one via `supabase migration new <name>` and edit the SQL in `supabase/migrations`.
   - Apply locally with `supabase db push` or run `supabase db reset` for a clean slate.
3. **Data**
   - Use `/api/jobs/bootstrap` for seed jobs.
   - To test a specific provider, sign in as admin and call `POST /api/admin/scrapers/run` with `{ "providerId": "france-travail" }`. The API validates the Supabase session via `requireRole`.
4. **Pre-PR checks**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```
   All must pass locally before opening a Pull Request.

## Debug tips
- **Supabase Studio**: inspect `jobs`, `job_provider_runs`, `job_provider_config` to verify scheduler writes.
- **Next logs**: add `console.info` inside API routes (`src/app/api/**/*/route.ts`). They run in the Node runtime so logs show up in the terminal.
- **Vitest**: `npm run test -- --runInBand --reporter verbose` to chase a flaky test, or `npx vitest related src/features/jobs/providers/providerFactory.ts` to focus on specific files.
- **Network inspection**: confirm lazy chunks load as expected (SuccessStories, Dashboard) via the browser DevTools Network tab.
- **Stable HMR**: if Next 16/Turbopack is unstable, fallback to webpack with `TURBOPACK=0 npm run dev` (rare).

## Housekeeping & tooling
- `npm run lint -- --max-warnings=0` to promote warnings to errors.
- `docker system prune` if `make docker-up` volumes consume too much space.
- `supabase functions serve` is unused; all server logic runs in Next API routes.
- Enable EditorConfig/Prettier in your IDE to comply with conventions (named exports only, prefer interfaces, etc.).
