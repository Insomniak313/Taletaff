# Taletaff Architecture

## Overview
Taletaff is a Next.js App Router application serving two primary surfaces: a public SEO-driven interface (landing + job search) and a multi-role cockpit for internal teams. Supabase provides the single source of truth: Postgres stores aggregated offers, Supabase Auth manages sessions, and API routes orchestrate ingestion from external providers.

Core principles:
- **Domain boundaries** (`src/features/*`) isolate auth, jobs and dashboard logic.
- **Typed services** (`src/services/*.ts`) encapsulate Supabase usage on both server and browser clients.
- **Declarative hooks** (`src/hooks`) wrap side effects (auth, search) consumed by lightweight functional components.
- **Explicit pipelines** move through providers → scraper → scheduler while persisting state in `job_provider_runs` and `job_provider_config`.

## Frontend modules
| Area | Description | Key files |
| --- | --- | --- |
| Landing & SEO | Public pages (`/`, `/jobs`, `/jobs/[category]`) rendered via RSC with `components/sections/*`. Structured data and sitemap live in `src/components/Seo` + `src/app/robots.ts`. | `src/app/page.tsx`, `src/app/jobs/[category]/page.tsx`, `src/components/sections/*`, `src/components/Seo/StructuredData.tsx` |
| Auth | Composable forms (`AuthForm`, `ForgotPasswordForm`, `CategoryPreferences`) backed by Supabase Auth via `authService` and `useAuthForm`. | `src/(auth)/*`, `src/features/auth/components`, `src/services/authService.ts`, `src/hooks/useAuthForm.ts` |
| Multi-role dashboard | Each role has its own page in `src/app/dashboard/*` powered by `features/dashboard/components`. Access control is enforced by `RoleGuard`. | `src/app/dashboard/**/page.tsx`, `src/features/dashboard/components/*`, `src/features/auth/components/RoleGuard.tsx` |
| Job search | `features/jobs/components/*` expose grid, cards and filters. `useJobSearch` drives client-side UX while `jobService` queries Supabase through API routes. | `src/features/jobs/components/*`, `src/hooks/useJobSearch.ts`, `src/services/jobService.ts`, `src/app/api/jobs/route.ts` |

## Job ingestion pipeline
1. **Configuration**: each provider lives in `src/features/jobs/providers/frProviders.ts` and exports a `JobProvider` (endpoint, mapping, headers). Defaults rely on environment variables declared in `.env.example`.
2. **Dynamic overrides**: `providerConfigStore` reads/writes the `job_provider_config` table to override endpoint, token or headers at runtime.
3. **Scraping**: `scrapeProvider` (`features/jobs/scraper/jobScraper.ts`) calls the provider, normalizes records, then upserts batches of 200 rows into `jobs` (composite key `source/external_id`).
4. **Scheduling**: `jobScheduler` (`features/jobs/scheduler/jobScheduler.ts`) computes due providers based on `JOB_REFRESH_INTERVAL_MS` (3 days), last run state (`job_provider_runs`) and active settings.
5. **Execution APIs**:
   - `POST /api/jobs/sync` (protected by `JOB_CRON_SECRET`) synchronizes all due providers.
   - `POST /api/jobs/bootstrap` runs Remotive only to provide sample data.
   - `POST /api/admin/scrapers/run` (server-side, admin-only) allows operators to trigger a provider from the dashboard UI.
6. **Observability**: each run updates `job_provider_runs` with `status`, `last_run_at`, `last_success_at` and optional `error`. These feed the admin `ScraperStatusPanel` components.

## Authentication & roles
- **Supabase Auth** stores roles (`jobseeker`, `employer`, `admin`, `moderator`) inside `user_metadata.role`. During sign up (`authService.signUp`) category preferences and role are persisted.
- **Client sessions**: `useCurrentUser` instantiates a Supabase browser client, listens to `authStateChange` and exposes `{ session, role, isLoading }`.
- **Route protection**: `RoleGuard` redirects to `/login` or the role-specific home route (`ROLE_HOME_ROUTE`) when access is denied.
- **Sensitive APIs**: routes in `src/app/api/admin/*` run on the server (`runtime = "nodejs"`) and leverage `supabaseAdmin()` to access restricted tables.

## SEO, rendering & performance
- **Metadata**: `src/config/siteMetadata.ts` centralizes title, description, keywords, social links and absolute URL logic used by `layout.tsx` and `sitemap.ts`.
- **Structured data**: `StructuredData` outputs JSON-LD for the hero & job listings to improve discoverability.
- **Category pages**: Next generates `/jobs/[category]` from `config/jobCategories.ts`, ensuring every discipline has an optimized SEO page.
- **Rendering strategy**: critical components ship through RSC, whereas heavy sections (`SuccessStoriesLoader`) rely on `Suspense` + lightweight fallbacks to respect LCP budgets.
- **Bundle health**: `npm run build` uses Next 16 (Turbopack) and targeted imports (`clsx`, supabase) to prevent oversized chunks.

## Extension points
- **Add a provider**: implement `createJsonProvider` in `frProviders.ts`, declare env keys in `.env.example`, and migrate `job_provider_config` if new metadata is required.
- **Extend the dashboard**: create panels within `features/dashboard/components` and wire them in the matching page `src/app/dashboard/<role>/page.tsx`.
- **New SEO pages**: update `config/jobCategories.ts` to autogenerate routing and navigation.
- **Automations**: build scripts/UI on top of `providerConfigStore.upsertSettings` to update endpoints without redeploying.

For concrete workflows (local setup, deployment, quality gates), refer to the other guides in the `docs/` folder.
