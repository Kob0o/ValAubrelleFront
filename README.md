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
