# 0001. Next.js App Router plutôt que Nuxt

## Contexte

Certains documents de cadrage parlaient de Nuxt (Vue) pour le front.
Le dépôt, lui, est déjà initialisé en Next.js : le README le dit et le socle (lot G0.A) est en place.
Il fallait trancher pour que les issues, les documents du Drive et le code disent la même chose.

Contraintes à respecter :

- composants accessibles (RGAA) sans tout recoder ;
- charte graphique du Val d'Aubrelle appliquée par des jetons de thème ;
- types générés depuis le contrat OpenAPI v1.0.0 ;
- développement assisté par IA, donc un écosystème très documenté.

## Décision

Le front est développé avec **Next.js (App Router)**, React et TypeScript.

La pile associée est :

- Tailwind CSS et shadcn/ui (basé sur Radix UI) pour les composants ;
- Lucide pour les icônes, sonner pour les notifications ;
- openapi-typescript et openapi-fetch pour le client d'API typé ;
- Vitest et Testing Library pour les tests.

Organisation de `src/` : `app/` (routes), `components/` (ui, forms, shared, layout, auth, explorer, municipality, requests, reports, admin), `hooks/`, `lib/api/`, `lib/auth/`, `theme/`, `types/`, `mocks/`.

## Alternatives écartées

- **Nuxt (Vue)** : cité dans des documents anciens. Le socle Next.js existe déjà ; changer coûterait le lot G0.A sans gain réel. L'écosystème Radix / shadcn/ui, utile pour l'accessibilité, est natif React.
- **React avec Vite, sans framework** : il faudrait choisir et assembler soi-même le routage, le rendu serveur et la structure. Next.js fournit ces briques.

## Conséquences

- Les routes sont des dossiers sous `src/app/` (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Il n'y a pas de dossier `pages/`.
- Les composants sont serveur par défaut. Tout composant qui utilise l'état, les effets ou le navigateur commence par `"use client"`.
- La logique réutilisable passe par des hooks React dans `src/hooks/` (`useApi`, `useAuth`, `useFeedback`, `useIdempotentSubmit`), pas par des composables.
- La configuration est dans `next.config.ts`.
- Les documents qui parlent encore de Nuxt (par exemple `MVP_Composants.md` sur le Drive) sont mis à jour.
- La version de Next.js utilisée apporte des changements récents : lire la documentation embarquée (`node_modules/next/dist/docs/`) avant d'écrire du code, comme l'indique `AGENTS.md`.

## Statut

Acceptée

## Date

2026-11-16
