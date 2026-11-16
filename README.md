# val-d-aubrelle-frontend

## Technologies

| Technologie    | Rôle                              |
|----------------|-----------------------------------|
| Next.js        | Framework (React)                 |
| TypeScript     | Typage                            |
| Tailwind CSS   | Styles                            |
| shadcn/ui      | Composants (basés sur Radix UI)   |
| Lucide         | Icônes                            |

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
2. Une fois le travail prêt, ouvrir une pull request vers `develop` → déploiement sur l'environnement de **dev**.
   Tout merge vers `develop` passe obligatoirement par une pull request : pas de push ni de merge direct sur `develop`.
3. Merger `develop` dans `main` pour promouvoir sur l'environnement de **test**.
