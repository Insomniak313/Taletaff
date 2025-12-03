# Quality & Standards

## Pillars
- **Reliability**: every critical module is covered by unit and integration tests (Vitest + Testing Library).
- **Performance**: Core Web Vitals targets (LCP < 2.5 s, CLS < 0.1, INP < 100 ms) achieved via RSC rendering, lazy loading and lean bundles.
- **Accessibility**: Tailwind components respect contrast, focus rings and ARIA roles (`Button`, `InputField`, `Tag`).
- **Maintainability**: strict TypeScript, named exports only, components under 100 lines and grouped by domain.

## Tests
| Type | Scope | Files/Commands |
| --- | --- | --- |
| Unit | Supabase services (`authService`, `jobService`), helpers (`format`), config (`siteMetadata`). | `npm run test src/__tests__/authService.test.ts` |
| Light integration | RSC components (`Hero`, `JobSearchSection`) via Testing Library + MSW. | `npm run test src/__tests__/jobSection.test.tsx` |
| Scheduler & providers | Dedicated specs (`jobScheduler.test.ts`, `jobScraper.test.ts`) mocking Supabase. | `npm run test src/__tests__/jobScheduler.test.ts` |
| Hooks | `useAuthForm`, `useJobSearch`, `useCurrentUser`. | `npm run test src/__tests__/useJobSearch.test.tsx` |

> Coverage must stay at 100% (branches, functions, lines). Vitest enforces the threshold through V8 coverage.

## Linting & typing
- `npm run lint` uses ESLint 9 with Next Core Web Vitals config; errors block CI.
- `npm run typecheck` executes `tsc --noEmit` with `strict: true`, `noUncheckedIndexedAccess`, `moduleResolution: bundler`.
- No implicit `any` or `// @ts-ignore` without documented justification.
- Prefer **interfaces** over type aliases for public structures.

## Performance & accessibility
- **Lazy loading**: dynamical imports for heavy components (`SuccessStoriesLoader`, non-critical dashboard panels).
- **Suspense**: wrap every async section with `Suspense` + lightweight fallback to avoid layout shifts.
- **Tailwind**: mobile-first classes (`flex-col` baseline) and ordered utility groups (layout → spacing → typography → color → state).
- **Images**: use Next `<Image />` when possible; keep SVG assets in `public/`.
- **Audits**: run Lighthouse mobile before each major release and document regressions in the PR.

## Pull Request checklist
1. [ ] Screenshots or GIFs provided for UI changes.
2. [ ] `npm run lint`, `npm run typecheck`, `npm run test` pass locally.
3. [ ] Supabase migrations added and documented if applicable.
4. [ ] New environment variables added to `.env.example` + `docs/development.md`.
5. [ ] Impacted endpoints described (update `docs/operations.md` if needed).
6. [ ] Performance/SEO implications mentioned (bundle size, LCP, etc.).
7. [ ] User-facing strings translated to French and accessible (ARIA, focus states).

## Future improvements
- Add Playwright E2E tests for auth and job search journeys.
- Integrate Vercel bundle analyzer + Lighthouse CI into GitHub Actions.
- Plug automated alerts on `job_provider_runs.status = 'failed'` (Supabase Edge Functions, Zapier, etc.).
