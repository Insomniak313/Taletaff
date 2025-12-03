# Contribution Guide

## Philosophy
We value small, typed and well-documented changes. Every PR should be reviewable in under 10 minutes and include tests plus screenshots/GIFs for UI work. External contributors follow the same bar as the core team: zero ESLint warnings, 100% coverage, documentation aligned.

## Git workflow
1. **Sync `main`**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create a descriptive branch**
   ```bash
   git checkout -b feature/job-card-skeleton
   ```
3. **Atomic commits**
   - Suggested prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
   - Present tense, focused on the *why* rather than the *how*.
   - Example:
     ```
     feat: expose bootstrap endpoint inside admin dashboard
     ```
4. **Rebase often** (`git pull --rebase origin main`) to avoid merge commits.

## Local checklist
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] Add/update affected unit or integration tests.
- [ ] Update documentation (`README`, `docs/*`, meaningful code comments if needed`).
- [ ] Document new env vars in `.env.example` + `docs/development.md`.
- [ ] Provide a screenshot/GIF if the UI changes.

## Code style
- Strict TypeScript, no implicit `any`.
- **Named exports only** (no `export default`).
- Prefer **interfaces** for public structures.
- React components must be functional (`const Component = () => { ... }`).
- Tailwind: mobile-first (`flex-col`/`gap` baseline) and ordered utilities (layout → spacing → typography → color → state).
- Components stay under 100 lines; extract helpers/hooks when needed.

## Tests
- Use Vitest + Testing Library.
- Cover success, failure and edge cases (e.g. provider not configured).
- For async hooks, rely on `await waitFor(...)` and MSW to stub network calls.
- Snapshots only when the output is stable and hard to assert otherwise.

## Pull Request expectations
Include:
- Business summary (e.g. "allow admins to rerun a provider").
- Technical details (key files, migrations, new routes).
- Command results (`lint`, `typecheck`, `test`).
- SEO/Performance/Accessibility impacts (dynamic imports, DOM structure, etc.).
- PR checklist (copy from `docs/quality.md`).

## Review process
- Core team replies within two business days.
- Address feedback on the same branch (no need for a follow-up PR unless the scope changes drastically).
- Resolve conversations with a note confirming the applied change.

Thanks for helping keep Taletaff fast, reliable and well-documented! 🙌
