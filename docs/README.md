# Taletaff Documentation

This folder hosts all technical and operational guides required to maintain, evolve and operate Taletaff without prior context. Each document is concise and references the relevant source files to reduce ramp-up time.

## Goals
- Share a common understanding of the architecture and major technical choices.
- Describe a reproducible development workflow (environment, migrations, seed data).
- Document operational expectations (deployments, scraper cron jobs, observability).
- Capture the quality bar (tests, performance, accessibility, PR checklist).

## Table of contents
- [Architecture](./architecture.md) · Front modules, ingestion pipeline, SEO, extension points.
- [Development](./development.md) · Local setup, environment variables, test data, debugging tips.
- [Operations](./operations.md) · Vercel deployment, secrets, CI/CD, scheduler & monitoring.
- [Quality](./quality.md) · Testing strategy, coding standards, performance budgets and review checklist.
- [Contribution](./contributing.md) · Git workflow, coding conventions, pre-PR checklist and review expectations.

## Reading conventions
- Paths are relative to the repo root (e.g. `src/features/jobs/scheduler/jobScheduler.ts`).
- Shell commands target macOS/Linux (replace `npm` with `pnpm` if needed).
- Environment variables are written in `SCREAMING_SNAKE_CASE` and come from `.env` or Supabase.
- All code snippets use TypeScript/TSX. Components never use default exports per project conventions.

## Glossary
- **Provider**: REST connector that explains how to fetch and normalize external job offers (`features/jobs/providers`).
- **Scheduler**: orchestrator deciding which providers to run and logging each execution (`jobScheduler`).
- **Run**: execution of a provider, persisted in `job_provider_runs` with status and optional error.
- **RLS**: Row Level Security in Supabase, enabled to allow public read access while protecting writes.
- **RSC**: React Server Components used in `src/app` to minimize the JavaScript shipped to the client.
