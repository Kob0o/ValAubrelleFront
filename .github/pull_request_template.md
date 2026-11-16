## Résumé

## Cible

Cette pull request vise `develop`.

La promotion vers `main` (environnement de test) se fait dans une pull request séparée, `develop` → `main`, seulement quand la mise en production est décidée.

## Vérification

La CI lance `npm run lint`, `npm test` et `npm run build`. Elle doit être verte avant la revue.
