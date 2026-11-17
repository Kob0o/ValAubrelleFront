# val-d-aubrelle-frontend

## Technologies

| Technologie    | Rôle                              |
|----------------|-----------------------------------|
| Next.js        | Framework (React)                 |
| TypeScript     | Typage                            |
| Tailwind CSS   | Styles                            |
| shadcn/ui      | Composants (basés sur Radix UI)   |
| Lucide         | Icônes                            |

## Contrat UI/UX commun aux composants

**Avant de créer ou modifier un composant ou un écran**, chaque développeur et son agent IA doivent lire le [skill UI/UX du projet](.agents/skills/val-aubrelle-ui-ux/SKILL.md) et son [contrat détaillé](.agents/skills/val-aubrelle-ui-ux/references/contrat-ui-ux.md). La [charte graphique 2026](docs/Val-d-Aubrelle_Charte-graphique.pdf) est incluse dans le dépôt.

Règles à appliquer sur toutes les machines :

- Réutiliser les primitives shadcn/ui configurées dans `components.json` et les icônes Lucide ; créer un composant métier uniquement pour une règle ou un assemblage partagé.
- Appliquer les couleurs, la typographie Inter et les contrastes de la charte via `src/theme/tokens.ts`, `src/theme/themes.ts` et `src/app/globals.css`. Ne pas définir de variantes de marque propres à un écran.
- Prévoir les états, le clavier, le lecteur d'écran et le rendu mobile à 390 px décrits dans le contrat. Une donnée absente, non diffusable ou en erreur garde un rendu distinct.
- Utiliser les principes de retenue visuelle adaptés d'[Unslop](https://github.com/heydamir/unslop), sans remplacer la charte ni modifier les fonctionnalités du MVP.

En cas de contradiction entre une maquette, une primitive et la charte, suivre l'ordre de priorité du contrat et signaler la décision dans la PR. Le contrat est la référence commune à pointer aux agents IA ; il ne dépend d'aucune installation externe d'Unslop.

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
