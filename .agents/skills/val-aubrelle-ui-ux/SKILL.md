---
name: val-aubrelle-ui-ux
description: Appliquer le contrat UI/UX du Val d'Aubrelle lors de la création, modification ou revue d'un composant ou d'un écran front Next.js. Ne concerne pas les changements sans interface.
---

# UI/UX du Val d'Aubrelle

Ce skill est l'entrée des agents IA pour tout travail sur l'interface. Le [contrat UI/UX](references/contrat-ui-ux.md) est normatif et commun à tous les développeurs. La [charte graphique 2026](../../../docs/Val-d-Aubrelle_Charte-graphique.pdf) est incluse dans le dépôt pour vérifier le logo et les règles visuelles d'origine.

## Avant de coder

1. Lire le contrat entier, puis l'issue et les composants voisins. Pour une question de logo ou de mise en page institutionnelle, consulter aussi le PDF.
2. Examiner `components.json`, `src/theme/tokens.ts`, `src/theme/themes.ts`, `src/app/globals.css` et le composant shadcn/ui déjà présent. Utiliser les variables du thème ; ne pas introduire une palette locale.
3. Décider si la primitive shadcn/ui suffit. Créer un composant métier seulement s'il apporte un contrat partagé, une règle métier ou un assemblage réutilisé. Conserver l'API et les comportements accessibles de la primitive.
4. Énumérer pour le composant les états qui s'appliquent réellement, son comportement clavier et son rendu à 390 px. Ne pas ajouter un état sans rapport avec son rôle.

## Pendant et après le code

- Appliquer les règles du contrat, y compris les exceptions explicites pour la carte, les données et les couleurs d'état.
- Modifier un style commun dans les tokens, le thème ou la primitive partagée, puis vérifier ses usages. Éviter les corrections de couleur répétées dans chaque écran.
- Champs : composer `FieldWrapper` ; aide dans l'infobulle à côté du libellé, badge « Obligatoire » à droite, jamais d'astérisque ni de texte d'aide sous le champ. Badges : primitive `Badge` telle quelle (10 px, graisse 666, majuscules). Détails dans le contrat §4 et §5.
- Vérifier les états pertinents, le focus, les contrastes et les versions mobile et bureau. Exécuter les contrôles du dépôt indiqués dans le contrat.
- Si une maquette contredit la charte ou le contrat, signaler l'écart dans la PR et proposer une décision commune ; ne pas créer une variante locale silencieuse.

Les principes de retenue visuelle sont adaptés d'[Unslop](https://github.com/heydamir/unslop) de Damir Sokolovsky, CC BY 4.0. Ses palettes, polices et tailles génériques ne remplacent jamais la charte du Val d'Aubrelle.
