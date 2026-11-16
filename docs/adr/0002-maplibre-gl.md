# 0002. MapLibre GL JS pour la carte

## Contexte

L'Observatoire de l'habitat affiche une carte des communes du Val d'Aubrelle (composant `MapView`, lot G0.H).
La carte doit :

- afficher de nombreux polygones communaux, colorés selon un indicateur ;
- rester fluide au zoom et au survol ;
- suivre la charte (couleurs, police Inter, pas d'opposition rouge/vert bon/mauvais) ;
- rester utilisable au clavier et avec un lecteur d'écran (RGAA).

Les issues laissaient encore le choix ouvert entre MapLibre et Leaflet.

## Décision

La carte utilise **MapLibre GL JS**.

## Alternatives écartées

- **Leaflet** : rendu en SVG ou Canvas 2D. Il devient lent avec beaucoup de polygones et se prête moins bien à un style vectoriel complet aux couleurs de la charte.
- **Mapbox GL JS** : même moteur d'origine, mais licence propriétaire et compte payant au-delà d'un quota. MapLibre en est le fork libre.
- **OpenLayers** : très complet, mais plus lourd à prendre en main pour notre besoin.

## Conséquences

- **Rendu vectoriel GPU (WebGL)** : les polygones et leurs couleurs se règlent dans le style de la carte. Les couleurs viennent des jetons de `src/theme/`.
- **Accessibilité** : un canvas WebGL n'est pas lisible par un lecteur d'écran. Il faut donc :
  - une alternative **liste ou tableau** des communes, synchronisée avec la carte (même filtre, même sélection) ;
  - une navigation au clavier (focus visible, sélection d'une commune sans souris) ;
  - une légende textuelle : l'information ne passe jamais que par la couleur.
- **Rendu côté client uniquement** : MapLibre a besoin de `window`. Le composant est chargé par import dynamique avec `next/dynamic` et `ssr: false`, dans un composant client (`"use client"`).
- **Données** : GeoJSON en **WGS84**, coordonnées dans l'ordre **[longitude, latitude]**. Toute donnée reçue dans un autre ordre ou une autre projection est convertie avant affichage.
- Dépendance à ajouter : `maplibre-gl` (et sa feuille de style).

## Statut

Acceptée

## Date

2026-11-16
