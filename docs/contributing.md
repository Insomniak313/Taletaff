# Guide de contribution

## Philosophie
Nous privilégions des changements petits, typés et documentés. Chaque PR doit pouvoir être relue en moins de 10 minutes et inclure tests + captures si UI. Les contributions externes suivent la même exigence que l'équipe cœur : zéro avertissement ESLint, 100 % de couverture et docs alignées.

## Workflow Git
1. **Synchronisez `main`**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Créez une branche descriptive**
   ```bash
   git checkout -b feature/job-card-skeleton
   ```
3. **Commits atomiques**
   - Préfixe suggéré : `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
   - Message au présent, centré sur le "pourquoi" plutôt que le comment.
   - Exemple :
     ```
     feat: expose bootstrap endpoint dans le dashboard admin
     ```
4. **Rebase** régulièrement (`git pull --rebase origin main`) pour éviter les merge commits.

## Checklist locale
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] Ajout/ajustement des tests unitaires ou d'intégration impactés.
- [ ] Documentation mise à jour (`README`, `docs/*`, commentaires significatifs si besoin).
- [ ] Nouveaux env vars documentés dans `.env.example` + `docs/development.md`.
- [ ] Capture ou GIF si la vue utilisateur change.

## Style de code
- TypeScript strict, aucune utilisation de `any` implicite.
- Exports **nommés uniquement** (pas de `export default`).
- Préférez les **interfaces** pour les structures publiques.
- Pas de classes React : uniquement des composants fonctionnels (`const Component = () => { ... }`).
- Tailwind : mobile-first (`flex-col`/`gap` par défaut) et classes utilitaires ordonnées (layout → spacing → typo → couleur → état).
- Components < 100 lignes ; factorisez les sous-parties dans des helpers/hook si nécessaire.

## Tests
- Utilisez Vitest + Testing Library.
- Ciblez les scénarios critiques : succès, erreurs, edge cases (ex : provider non configuré).
- Pour les hooks asynchrones, utilisez `await waitFor(...)` et MSW pour stubber les requêtes.
- Ajoutez des snapshots uniquement si la sortie est stable et difficile à tester autrement.

## Ouverture de Pull Request
Incluez :
- Résumé métier (ex : « permettre aux admins de relancer un provider »).
- Détails techniques (fichiers clés, migrations, nouvelles routes).
- Résultats des commandes (`lint`, `typecheck`, `test`).
- Impacts SEO/Perf/Accessibilité si concernés (ex : nouvel import dynamique, changement de structure HTML).
- Checklist PR (copiable depuis `docs/quality.md`).

## Revue
- L'équipe core répond sous 2 jours ouvrés.
- Les feedbacks doivent être considérés dans la branche initiale (pas besoin d'ouverture d'une nouvelle PR sauf cas majeur).
- Les conversations résolues nécessitent un commentaire confirmant la mise en place de la recommandation.

Merci de contribuer à faire de Taletaff une plateforme rapide, fiable et documentée ! 🙌
