# 0004. Branches de travail depuis `develop`

## Contexte

Deux règles se contredisaient :

- la Definition of Ready demande des branches `type/numero-description` créées depuis `main` ;
- le README du dépôt et la pratique de l'équipe partent de `develop`.

La pratique est déjà en place : la branche `feature/ci-cible-develop` (PR #16) a ajouté la CI et le modèle de pull request qui visent `develop`.

## Décision

- Chaque branche de travail part d'un `develop` à jour : `feature/<description>` ou `fix/<description>`, en kebab-case.
- La pull request vise **`develop`**. La CI (lint, tests, build) doit être verte avant la revue.
- La mise en production vers l'environnement de test se fait par une pull request séparée **`develop` → `main`**, quand elle est décidée.
- Pas de push direct sur `develop` ni sur `main`. Pas de merge d'une branche de travail dans `main`.

## Alternatives écartées

- **`type/numero-description` depuis `main`** (texte actuel de la DoR) : `main` sert à l'environnement de test. Partir de `main` mélangerait le travail en cours et la version testée.
- **Trunk-based (tout sur `main`)** : pas adapté tant que `main` représente un environnement à part.

## Conséquences

- Le PO corrige la Definition of Ready pour qu'elle dise : branche depuis `develop`, PR vers `develop`.
- Le numéro d'issue n'est pas obligatoire dans le nom de branche. On le met dans le titre ou la description de la PR (« Closes #N »).
- Le README (section « Stratégie de gestion des branches ») reste la référence détaillée.

## Statut

Acceptée

## Date

2026-11-16
