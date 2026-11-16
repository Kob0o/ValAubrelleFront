# 0003. Recharts pour les graphiques

## Contexte

Les fiches communes et les rapports affichent des indicateurs d'habitat sous forme de graphiques.
Le besoin du MVP se limite à des **courbes** (évolution dans le temps) et des **barres** (comparaisons).
Les graphiques doivent suivre la charte et rester accessibles (RGAA).

## Décision

Les graphiques utilisent **Recharts**.

## Alternatives écartées

- **ECharts** : très riche, mais pensé hors React (intégration par un wrapper) et plus lourd. Ses fonctions avancées ne servent pas au MVP.
- **Nivo** : bon rendu, mais beaucoup de paquets séparés et une personnalisation du thème moins directe pour notre charte.

## Conséquences

- Recharts est une bibliothèque React : les graphiques sont des composants, faciles à tester et à typer.
- Les graphiques sont des composants client (`"use client"`).
- **Accessibilité** : chaque graphique est accompagné d'un **tableau de données** accessible (visible ou dépliable), avec les mêmes valeurs. Le graphique a un titre et un résumé textuel.
- **Palette** : les couleurs viennent des jetons de `src/theme/`. Pas d'opposition rouge/vert pour dire bon/mauvais. Le vert prairie reste décoratif. Les séries se distinguent aussi par la forme (motif, marqueur, libellé), pas seulement par la couleur.
- Si un besoin dépasse les courbes et les barres, on ouvre une nouvelle ADR avant d'ajouter une autre bibliothèque.
- Dépendance à ajouter : `recharts`.

## Statut

Acceptée

## Date

2026-11-16
