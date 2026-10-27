# val-d-aubrelle-frontend

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
3. Merger `develop` dans `main` pour promouvoir sur l'environnement de **test**.
