# Taletaff

![CI](https://img.shields.io/badge/CI-GitHub%20Actions-0A0)
![Tests](https://img.shields.io/badge/tests-Vitest%20100%25-success)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Node](https://img.shields.io/badge/node-20.x-43853d)
![Status](https://img.shields.io/badge/deployment-Vercel-black)

Next.js 16 (App Router) platform hosted on Vercel, powered by Supabase, Tailwind CSS and a scraper orchestrator to surface the best engineering, product, marketing and operations jobs. The experience is mobile-first, fully typed and tuned for Core Web Vitals.

## Table of contents
- [Quick tour](#quick-tour)
- [Architecture at a glance](#architecture-at-a-glance)
- [Stack & dependencies](#stack--dependencies)
- [Getting started](#getting-started)
- [Key commands](#key-commands)
- [Repository layout](#repository-layout)
- [Supabase & data](#supabase--data)
- [Testing & quality](#testing--quality)
- [Detailed documentation](#detailed-documentation)
- [How to contribute](#how-to-contribute)

## Quick tour
- Full authentication journey (sign up, sign in, password reset) via Supabase Auth and reusable form primitives (`AuthForm`, `useAuthForm`).
- SEO-first flow: static category pages (`/jobs/[category]`), generated sitemap, consolidated metadata (`siteMetadata`).
- Multi-role dashboard guarded by `RoleGuard` with dedicated admin, employer, job seeker and moderation views.
- Job aggregation through 10+ French providers plus Remotive, normalized and upserted in batches (`jobScraper`, `jobScheduler`).
- UI components under 100 lines, styled with Tailwind and rendered through RSC + Suspense for non-critical sections.
- Observability via GitHub Actions (lint, typecheck, Vitest coverage 100%) and cron scheduler endpoint (`POST /api/jobs/sync`).

## Architecture at a glance
- **App Router**: public routes (`src/app`), Next API routes (auth, jobs, cron) and role-specific dashboard pages.
- **Isolated features**: `src/features/auth`, `src/features/jobs`, `src/features/dashboard` bundle logic, hooks and UI per domain to reduce coupling.
- **Shared libs**: `src/lib/env.*` enforce typed environment variables, `supabase/browser|server` wrap the clients.
- **Job ingestion**: `providers` define each source, `jobScraper` normalizes payloads, `jobScheduler` drives execution and logs runs in Supabase.
- **Internal APIs**: `/api/jobs` exposes search, `/api/jobs/bootstrap` triggers Remotive (public), `/api/jobs/sync` is protected through `JOB_CRON_SECRET`.

## Stack & dependencies
- Next.js 16 + React 19 (Server Components, Suspense, targeted dynamic imports).
- Tailwind CSS 3.4 with utility design tokens (`src/app/globals.css`).
- Supabase (Postgres + Auth) managed through Supabase CLI and SQL migrations stored in `supabase/migrations`.
- Vitest + Testing Library + MSW for unit and integration coverage.
- ESLint 9 + TypeScript 5.6 (strict mode) + App Router configuration.
- Multi-stage Dockerfile and `docker-compose.yml` for reproducible dev environments.

## Getting started
1. **Prerequisites**: Node 20, npm 10, Supabase CLI (`brew install supabase/tap/supabase`), Docker (optional).
2. **Config**
   ```bash
   cp .env.example .env
   # Fill in your Supabase keys plus the provider endpoints/tokens you plan to use
   ```
3. **Install & run**
   ```bash
   npm install
   npm run dev
   ```
4. **Local database (recommended)**
   ```bash
   supabase db start            # spins up local Postgres
   supabase db reset            # applies all SQL migrations
   ```
5. **Seed data**: call `POST http://localhost:3000/api/jobs/bootstrap` to import Remotive sample jobs.

### With Docker
```bash
make docker-up        # build + run dev (hot reload on 0.0.0.0:3000)
make docker-logs      # tail logs
make docker-down      # stop and clean
```

## Key commands
- `npm run dev`: Next.js + HMR.
- `npm run build`: production build (analyzers + optimized code splitting).
- `npm run start`: serve the production build locally.
- `npm run lint`: ESLint (Next Core Web Vitals ruleset).
- `npm run typecheck`: `tsc --noEmit`.
- `npm run test` / `npm run test:watch`: Vitest + V8 coverage (100% enforced).

## Repository layout
```
src/
  app/                  # Next.js routes (auth, jobs, dashboard, API)
  components/           # Shared layout + sections
  config/               # Site metadata, categories, role routes
  features/             # Auth / jobs / dashboard domains
    jobs/
      providers/        # Connectors + dynamic settings
      scheduler/        # Scheduler + eligibility rules
      scraper/          # Normalization + Supabase upsert
  hooks/                # Custom hooks (auth, job search)
  lib/                  # Supabase clients + typed env helpers
  services/             # Server/client Supabase accessors
  types/ & utils/       # Shared types + helpers
supabase/migrations/    # Versioned SQL schema (jobs, runs, config)
```

## Supabase & data
1. **Migrations**: run `supabase db push` to create `jobs`, `job_provider_runs`, `job_provider_config` plus indexes and `updated_at` triggers.
2. **Security**: RLS enabled (policy `jobs public read`). Writes only go through Next server APIs or the scheduler.
3. **Providers**: configuration can come from env vars (`FRANCE_TRAVAIL_API_URL`, …) or from the `job_provider_config` table. `providerConfigStore` documents priority rules.
4. **Cron**: call `/api/jobs/sync` with header `x-cron-secret: $JOB_CRON_SECRET` (defined in `.env`). In production, hook it to Vercel Cron or GitHub Actions schedule.
5. **Bootstrap**: `/api/jobs/bootstrap` imports Remotive with no secret so product teams get instant data.

## Testing & quality
- 100% coverage enforced (`vitest run --coverage`), covering services, hooks, config and critical components in `src/__tests__`.
- ESLint + strict TypeScript block PRs through the GitHub Actions workflow (`.github/workflows/ci.yml`).
- CI replays migrations through `supabase db push` against an ephemeral Postgres instance.
- PRs must validate accessibility (Tailwind + ARIA), LCP < 2.5s (lazy loading), bundle budget < 160 kB thanks to code splitting.

## Detailed documentation
- `docs/README.md`: table of contents & conventions.
- `docs/architecture.md`: full system view (front flows, ingestion, SEO).
- `docs/development.md`: local setup, tooling, debugging tips and sample data.
- `docs/operations.md`: Vercel deployment, secrets, CI/CD, scheduler & monitoring.
- `docs/quality.md`: testing strategy, performance/accessibility budgets, PR checklist.
- `docs/contributing.md`: contribution guide (git workflow, coding standards, PR expectations).

## How to contribute
1. Create a descriptive branch (`feature/job-card-skeleton`).
2. Implement the feature following project conventions (named exports, <100-line components, TypeScript interfaces).
3. Update or add relevant tests (`npm run test`) and run `npm run lint && npm run typecheck`.
4. Update documentation when behavior changes (`docs/` or this README).
5. Open a Pull Request covering:
   - the business need
   - technical impact (routes, migrations, env vars)
   - validation evidence (screenshots, tests, performance notes).

See `docs/contributing.md` for commit examples, branching strategy and the full PR checklist.

> Need a deeper dive? Explore the `docs/` folder for detailed guides, architecture diagrams and operational checklists.
