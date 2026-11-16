# Décisions d'architecture (ADR)

Ce dossier garde la trace des décisions d'architecture du front de l'Observatoire de l'habitat.

Une ADR (Architecture Decision Record) explique **pourquoi** un choix a été fait.
Elle reste dans le dépôt, même quand la décision est remplacée plus tard.

## Index

| N°   | Décision                                                        | Statut   | Date       |
|------|-----------------------------------------------------------------|----------|------------|
| 0001 | [Next.js App Router plutôt que Nuxt](0001-nextjs-app-router.md) | Acceptée | 2026-11-16 |
| 0002 | [MapLibre GL JS pour la carte](0002-maplibre-gl.md)             | Acceptée | 2026-11-16 |
| 0003 | [Recharts pour les graphiques](0003-recharts.md)                | Acceptée | 2026-11-16 |
| 0004 | [Branches de travail depuis `develop`](0004-strategie-branches-develop.md) | Acceptée | 2026-11-16 |

## Règles

- Un fichier par décision, nommé `NNNN-titre-court.md` (numéro sur 4 chiffres, kebab-case).
- On ne réécrit pas une ADR acceptée. Pour changer d'avis, on crée une nouvelle ADR qui la **remplace**, et on passe l'ancienne au statut « Remplacée par NNNN ».
- Statuts possibles : Proposée, Acceptée, Rejetée, Remplacée par NNNN.
- Une ADR passe par une pull request vers `develop`, comme le code.

## Modèle

Copier ce bloc dans un nouveau fichier :

```markdown
# NNNN. Titre de la décision

## Contexte

Le problème à résoudre et les contraintes (charte, RGAA, contrat d'API, délais).

## Décision

Ce qu'on choisit, en une ou deux phrases.

## Alternatives écartées

- **Option A** : pourquoi on ne la retient pas.
- **Option B** : pourquoi on ne la retient pas.

## Conséquences

Ce que la décision implique pour l'équipe : à faire, à éviter, points de vigilance.

## Statut

Proposée

## Date

AAAA-MM-JJ
```
