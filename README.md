# val-d-aubrelle-frontend

## Technologies

| Technologie    | Rôle                              |
|----------------|-----------------------------------|
| Next.js        | Framework (React)                 |
| TypeScript     | Typage                            |
| Tailwind CSS   | Styles                            |
| shadcn/ui      | Composants (basés sur Radix UI)   |
| Lucide         | Icônes                            |

## Pages de démonstration

`/dev/forms` présente tous les états des champs de formulaire (`TextField`, `Select`).
Les pages `/dev/*` sont visibles en développement et renvoient une 404 en production.
Pour les afficher sur l'environnement intégré, construire avec `ENABLE_DEV_PAGES=true`
(la variable est lue au build, les pages étant statiques).
## Contrat d'API et types

Le contrat OpenAPI v1.0.0 se place localement dans `doc/api/openapi.yaml` (fichier listé dans `.gitignore`, non poussé).

Les types générés versionnés sont dans `src/types/api.d.ts`. Les réexports métier et les rôles sont dans `src/types/domain.ts` et `src/types/roles.ts`. Les fixtures typées sont dans `src/mocks/`.

Après une mise à jour locale du contrat :

```bash
npm run generate:api
npm run typecheck
```

Point ouvert contrat : le mapping `admin` → `AuthorRole` utilise `ops` dans `toAuthorRole` (à confirmer avec le back).

## Stratégie de gestion des branches

### Branches permanentes

| Branche   | Environnement | Créée depuis |
|-----------|---------------|--------------|
| `main`    | Test          | —            |
| `develop` | Dev           | `main`       |

### Branches de travail

Chaque modification part de `develop`, dans une branche nommée selon son type :

| Type    | Nommage             | Exemple              |
|---------|---------------------|----------------------|
| Feature | `feature/<feature>` | `feature/user-auth`  |
| Fix     | `fix/<fix>`         | `fix/login-redirect` |

Les noms sont en minuscules, séparés par des tirets (kebab-case).

### Workflow

```
main     ──●───────────────────────●──────▶  test
            \                     /
develop      ●───●───────●───────●────────▶  dev
                  \     /
feature/xxx        ●───●
```

1. Créer sa branche depuis un `develop` à jour :
   ```bash
   git switch develop
   git pull
   git switch -c feature/<feature>
   ```
2. Ouvrir la pull request **vers `develop`**, jamais vers `main`.
   `develop` est la branche par défaut du dépôt : le bouton « Compare & pull request » la propose comme cible.
   La CI (lint, tests, build) doit être verte avant la revue et le merge.
   Tout merge vers `develop` passe par une pull request : pas de push direct.
3. La mise en production vers l'environnement de **test** est un choix séparé.
   Quand on la décide, ouvrir une pull request `develop` → `main`.
   On ne merge pas une branche de travail directement dans `main`.
