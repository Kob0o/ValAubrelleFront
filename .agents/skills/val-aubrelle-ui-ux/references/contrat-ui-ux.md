# Contrat UI/UX des composants front

Applicable à tout composant et écran du MVP du Val d'Aubrelle. Les termes **obligatoire** et **interdit** servent de critères de revue. Une recommandation est nommée comme telle. Ce document décrit l'interface ; l'issue et le contrat API définissent le comportement métier.

## 1. Sources et résolution des écarts

1. La [charte graphique 2026](../../../../docs/Val-d-Aubrelle_Charte-graphique.pdf) fixe l'identité, la typographie et l'accessibilité. Elle prime sur toute suggestion d'Unslop, de shadcn/ui ou d'une maquette.
2. L'issue, la définition du MVP et le contrat API fixent les fonctionnalités, les rôles, les statuts et les données. Une maquette illustre ces règles sans les remplacer.
3. Ce contrat fixe les choix partagés de présentation et d'interaction. `src/theme/tokens.ts`, `src/theme/themes.ts` et `src/app/globals.css` en sont l'implémentation commune. Si le code diverge, corriger la source commune dans une PR examinant ses usages ; ne pas reproduire la divergence.
4. Les primitives shadcn/ui fournissent les comportements de base. Les conseils d'[Unslop](https://github.com/heydamir/unslop) ne servent ici qu'à éviter les effets et variations gratuits. Ils n'autorisent aucun changement de marque ou de périmètre.

En cas d'arbitrage encore ouvert (nouvelle couleur d'état, bibliothèque de carte, comportement absent du contrat), documenter la question dans l'issue ou la PR. Ne pas inventer une règle différente sur chaque poste.

## 2. Une seule bibliothèque de composants

| Besoin | Règle commune |
| --- | --- |
| Action, champ, sélection, dialogue, onglet, infobulle, tableau de base | Prendre la primitive de `src/components/ui/` ou l'ajouter selon `components.json` : style `radix-nova`, variables CSS, Radix, Lucide. Ne pas installer une seconde bibliothèque UI pour le même besoin. |
| Variante visuelle | Utiliser les variantes existantes avant d'en créer. Pour `Button`, `default` est l'action principale et `destructive` l'action dangereuse ; ne pas créer en parallèle des variantes `primary` ou `danger` synonymes. |
| Composant partagé métier | Créer dans `src/components/forms/`, `shared/`, `layout/` ou le dossier métier lorsqu'il porte une règle réutilisée : `QualityValue`, `StatusBadge`, `SourceBadge`, `DataTable`, etc. Composer les primitives, sans recopier leur logique de clavier ou de focus. |
| MultiSelect, DataTable et autres assemblages | Composer les primitives et les outils déjà retenus par l'équipe. Leur absence comme primitive shadcn/ui n'autorise pas une implémentation isolée par écran. |
| Notification | Utiliser le Sonner monté dans `UISetup` via `useFeedback` ; ne pas ajouter un deuxième système de toast. |
| Changement d'une primitive partagée | Changer son fichier ou le thème une seule fois, contrôler les consommateurs et l'expliquer dans la PR. Le code shadcn/ui est versionné dans ce dépôt : il peut être adapté pour respecter la charte, mais pas forké par chaque équipe métier. |

Une nouvelle abstraction doit répondre à au moins une de ces questions : quelle règle métier centralise-t-elle, quels usages réels partagent son API, ou quel comportement accessible supplémentaire fournit-elle ? Un wrapper qui ne renomme que `Button` n'est pas nécessaire.

## 3. Identité, couleurs et données

| Rôle | Valeur de la charte | Usage |
| --- | --- | --- |
| Vert Aubrelle | `#2E7D5B` | Action principale, lien, en-tête ; `--color-primary` / `--primary`. |
| Vert forêt | `#1F5C42` | Titres, fonds foncés, anneau de focus ; `--color-primary-strong`. |
| Vert prairie | `#8CC63F` | Accent décoratif seulement ; `--color-accent`. **Jamais** du texte, une donnée ou le seul signal d'état. |
| Brume | `#F1F6F2` | Fond de section ou d'encadré ; `--color-surface-alt`. |
| Anthracite | `#24302B` | Texte courant ; `--color-text` / `--foreground`. |
| Gris ardoise | `#5D6B64` | Texte secondaire ; `--color-text-muted`. |

- Utiliser les variables du thème et les classes Tailwind qui y sont reliées, pas des hexadécimaux dispersés dans les composants. Blanc, bordure, couleurs d'état et palette de données viennent également de `src/theme/tokens.ts`.
- Attention au nom `--accent` de shadcn/ui : dans ce projet, il désigne la surface Brume utilisée au survol. Il ne correspond pas au **Vert prairie** `--color-accent`.
- Les couleurs d'information, succès, avertissement et erreur actuellement définies dans `tokens.ts` sont **provisoires**, en attente de validation par le service Communication. Les réutiliser sans créer de nouvelles nuances locales ; une modification globale demande la même validation.
- Les fonds restent calmes : blanc ou Brume selon la hiérarchie. Pas de dégradé multicolore, halo, verre dépoli, ombre colorée ou bordure néon. Une ombre neutre discrète peut utiliser `--shadow-sm`.
- Pour la carte et les graphiques, prendre les variables `--data-seq-*`, ajouter légende et libellés, et vérifier que les classes restent distinctes sans perception des couleurs. La couleur seule ne code jamais une valeur ou un statut. **Ne pas opposer rouge et vert pour « bon/mauvais » dans les données territoriales.** Les couleurs d'erreur/succès de l'interface gardent leur sens sémantique, toujours avec texte et icône si utile.
- Une valeur `null` n'est jamais affichée comme `0`. `QualityValue` distingue exactement `available`, `missing`, `insufficient_sample`, `suppressed`, `source_error`, `not_computable` avec un libellé adapté. La non-diffusion n'est pas remplacée par une valeur calculée ou extrapolée.
- Réutiliser `BrandSignature` et le pictogramme existants. Signature institutionnelle sur l'écran de connexion ou en pied de page. Logo complet d'au moins 120 px de large, zone de protection d'une demi-hauteur de pictogramme ; favicon d'au moins 24 px. Pas de déformation, recoloration ou ombre. Ni DSFR ni Marianne.

## 4. Typographie, rythme et icônes

- **Inter uniquement.** Texte courant, libellés d'action et informations nécessaires à la décision : au moins 16 px à l'écran. Regular 400 pour le corps, SemiBold 600 pour intertitres et boutons, ExtraBold 800 pour les titres, conformément à la charte. Les petites mentions accessoires ne doivent jamais remplacer une information nécessaire en 16 px. Les suggestions d'Unslop d'abandonner Inter ou l'ExtraBold ne s'appliquent pas ici.
- Garder une hiérarchie courte : titre de page, titre de section, corps, mention secondaire. Casse de phrase dans les libellés ; pas de capitales espacées, de texte en dégradé ni de multiples graisses arbitraires. Aligner les nombres tabulaires et conserver une même unité et un même format français dans une vue.
- Utiliser l'échelle de `src/theme/tokens.ts` : un pas de 4 px, des valeurs partagées de 4, 8, 12, 16, 24 et 32 px, et des rayons de 4, 8 et 12 px. Les éléments frères ont les mêmes espacements et dimensions ; l'espace entre groupes est supérieur à l'espace à l'intérieur d'un groupe. Ajouter un nouveau token partagé seulement pour un besoin récurrent expliqué.
- Utiliser Lucide pour les icônes d'interface, généralement 16 px, alignées dans une case de largeur constante et avec le même espacement au libellé. Une icône décorative ne remplace pas un texte ; un bouton icône a un nom accessible. Pas d'emoji comme icône ou badge.
- Conserver des interactions sobres. Les nouveaux styles ciblent les propriétés animées utiles (`color`, `background-color`, `border-color`, `opacity`, `transform`) ; éviter les nouvelles animations `transition-all`, les boucles décoratives, le rebond et l'agrandissement des cartes au survol. Respecter `prefers-reduced-motion`. Les styles shadcn/ui déjà versionnés ne sont pas à réécrire dans chaque issue pour cette seule préférence : une correction de primitive se fait séparément et globalement.

## 5. États obligatoires selon le type de composant

Prévoir seulement les lignes applicables au composant. Un état de chargement n'est requis que pour une action ou une donnée asynchrone ; `indeterminate` concerne une case à cocher, pas un bouton.

| Type | États et comportement attendus |
| --- | --- |
| Bouton / lien | Repos, survol, focus clavier visible, pressé, désactivé si pertinent. Action asynchrone : chargement explicite, clic répété bloqué, succès ou erreur. Une action destructive demande confirmation si son effet le justifie. |
| Champ texte / zone de texte | Vide, saisi, focus, erreur avec message relié au champ, désactivé et lecture seule distincts. Requête asynchrone : conserver la saisie en cas d'erreur. Compteur et limite si le contrat le demande. |
| Select / MultiSelect | Fermé, ouvert, option active au clavier, choix présent ou absent, recherche sans résultat si elle existe, erreur et désactivé. |
| Checkbox / Radio / Switch | Coché/non coché ou on/off, focus et désactivé. `indeterminate` seulement pour Checkbox. Si la mutation est asynchrone : enregistrement et échec sans annoncer un succès prématuré. |
| Modal / Drawer / confirmation | Fermé, ouvert, validation en cours, erreur si la validation échoue. Piéger le focus, permettre Échap si la fermeture est autorisée, restaurer le focus au déclencheur et rendre l'arrière-plan non interactif. |
| Liste / DataTable / carte / graphique | Chargement, données, vide et erreur distincts. Tri, filtres, sélection et pagination seulement quand la vue les prévoit. Une panne de tuiles ou de service n'est pas une carte « vide ». |
| Badge / valeur | Libellé lisible en plus de la couleur. Partager le mapping de statuts depuis `src/types/domain.ts` ; ne pas traduire ou recolorer le même code différemment selon l'écran. |
| Toast / Banner / erreur API | Information, succès, avertissement ou erreur selon le contexte. Message français exploitable, action de reprise si elle existe, `correlationId` copiable pour les 5xx. Aucun message serveur brut ou détail technique affiché. |

Les erreurs suivent la règle commune : `INVALID_CREDENTIALS` reste dans le formulaire de connexion ; session expirée redirige selon `SessionExpiredHandler` ; 403 hors périmètre ne révèle pas la ressource ; 409 propose la résolution de conflit ; 422 se rattache aux champs ; 429 et 503 indiquent un réessai utile ; 5xx affiche un message générique et le `correlationId`. Ne pas transformer un échec en état vide.

## 6. Accessibilité et adaptation

- Contraste minimal de **4,5:1 pour le texte** et **3:1 pour les grands textes et les éléments d'interface**, sur leur fond réel, y compris survol, désactivé et erreur lorsqu'un contenu reste à lire. Utiliser `src/theme/contrast.ts` ou un contrôle équivalent pour les nouveaux couples.
- Tout parcours est possible au clavier et au lecteur d'écran. Utiliser les éléments HTML natifs, un libellé programmatique, `aria-invalid`/description pour les erreurs, un focus visible et un ordre de tabulation logique. Ne pas ajouter un `role` ARIA qui contredit l'élément natif.
- Sur mobile à **390 px**, les cibles interactives mesurent au moins **44 × 44 px**. Vérifier absence de débordement horizontal de page ; un tableau peut défiler dans son conteneur identifié. Ne pas réduire le texte courant pour faire rentrer le contenu.
- Les tableaux ont un `<caption>` utile, des en-têtes identifiés et `aria-sort` si triables. Les graphiques ont une version tableau. La carte a une liste ou un autre accès clavier équivalent aux communes ; une sélection est annoncée autrement que par un contour coloré.
- Les messages dynamiques sont annoncés de façon adaptée (`aria-live` sans répétition excessive). Un dialogue restitue le focus après fermeture. Les états désactivé et lecture seule sont aussi distinguables par leur explication lorsque nécessaire.

## 7. Texte et contrôle visuel

- Interface en français, vocabulaire de l'observatoire : communes, indicateurs, sources, demandes et rapports. Les libellés disent l'action ou la donnée réelle. Pas de promesse inventée, formule publicitaire, salutation générique, emoji ou point d'exclamation décoratif.
- Les états vides et les erreurs disent ce qui manque et l'action possible ; les données de démonstration restent plausibles et clairement identifiées comme fictives. Une statistique annonce son unité, sa période et sa source lorsque nécessaire.
- Avant revue, ouvrir l'écran sur bureau et à 390 px. Comparer au même composant ailleurs, vérifier les états applicables du tableau ci-dessus, la navigation clavier, le focus, les contrastes et la charte. Faire passer `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` quand le changement touche le code. Noter dans la PR ce qui a été vérifié et tout écart restant.

## Provenance des règles de retenue visuelle

Rythme régulier, surfaces calmes, icônes cohérentes, texte précis et suppression des effets décoratifs sont adaptés d'[Unslop](https://github.com/heydamir/unslop) par Damir Sokolovsky, sous licence [CC BY 4.0](https://github.com/heydamir/unslop/blob/main/LICENSE). La charte du Val d'Aubrelle prévaut : ne pas importer les polices, palettes, tailles de texte ou mises en page proposées par défaut dans Unslop.
