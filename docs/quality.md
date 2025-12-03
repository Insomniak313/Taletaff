# Qualité & exigences

## Piliers
- **Fiabilité** : chaque module clé est couvert par des tests unitaires et intégration (Vitest + Testing Library).
- **Performance** : objectifs Core Web Vitals (LCP < 2,5 s, CLS < 0,1, FID/INP < 100 ms) grâce au rendu RSC, au lazy loading des sections non critiques et à la réduction des bundles.
- **Accessibilité** : composants Tailwind vérifient contraste, focus visible et rôle ARIA explicite (`Button`, `InputField`, `Tag`).
- **Maintenabilité** : code TypeScript strict, exports nommés uniquement, composants < 100 lignes et organisés par domaine.

## Tests
| Type | Cible | Fichiers/Commandes |
| --- | --- | --- |
| Unitaires | Services Supabase (`authService`, `jobService`), helpers (`format`), config (`siteMetadata`). | `npm run test src/__tests__/authService.test.ts` |
| Intégration légère | Composants RSC (`Hero`, `JobSearchSection`) via Testing Library + MSW. | `npm run test src/__tests__/jobSection.test.tsx` |
| Scheduler & providers | Tests dédiés (`jobScheduler.test.ts`, `jobScraper.test.ts`) simulant Supabase in-memory. | `npm run test src/__tests__/jobScheduler.test.ts` |
| Hooks | `useAuthForm`, `useJobSearch`, `useCurrentUser`. | `npm run test src/__tests__/useJobSearch.test.tsx` |

> Tous les tests doivent garder une couverture 100 % (branches, fonctions, lignes). Le seuil est enforce par Vitest (`coverage.v8`).

## Lint & typage
- `npm run lint` utilise ESLint 9 avec la config Next Core Web Vitals. Les erreurs bloquent la CI.
- `npm run typecheck` exécute `tsc --noEmit` avec `strict: true`, `noUncheckedIndexedAccess`, `moduleResolution: bundler`.
- Aucun `any` implicite ni `// @ts-ignore` n'est toléré sans justification documentée.
- Préférez les **interfaces** aux types alias pour permettre l'extension par augmentation déclarative.

## Performance & accessibilité
- **Lazy loading** : import dynamique des composants lourds (`SuccessStoriesLoader`, dashboard panels non critiques).
- **Suspense** : toutes les sections asynchrones sont emballées dans `Suspense` avec un fallback léger afin d'éviter les flashes de contenu.
- **Tailwind** : respect de la grille responsive mobile-first (`max-w`, `flex-col` par défaut) et tokens couleur compatibles dark mode si besoin.
- **Images** : privilégiez `<Image />` (Next) et les SVG inline du dossier `public/`.
- **Audit** : lancez Lighthouse en mode mobile avant chaque release majeure. Documentez les régressions dans la PR.

## Checklist Pull Request
1. [ ] Les captures d'écran ou GIF sont fournis pour les changements UI.
2. [ ] `npm run lint`, `npm run typecheck`, `npm run test` passent localement.
3. [ ] Les migrations Supabase sont incluses et documentées (si pertinentes).
4. [ ] Les nouvelles variables d'environnement sont ajoutées à `.env.example` + `docs/development.md`.
5. [ ] Les endpoints impactés sont décrits (docs/operations.md si nécessaire).
6. [ ] Les charges perf/SEO sont vérifiées (bundle, LCP) et mentionnées si elles bougent.
7. [ ] Les strings user-facing sont en français et accessibles (ARIA, focus visible).

## Améliorations possibles
- Ajouter des tests E2E Playwright sur les parcours auth/job search.
- Intégrer un bundle analyzer Vercel + Lighthouse CI dans Github Actions.
- Brancher des alertes automatiques sur `job_provider_runs.status = 'failed'` (Supabase Edge Functions ou Zapier).
