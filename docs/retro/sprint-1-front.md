# Rétrospective du sprint 1 — front

> **Brouillon.** État relevé le 16 novembre 2026 au soir, à compléter et valider en équipe le 17 novembre.
> Sources : kanban « Kamban - Val Aubrelle Front » (projet n° 2), issues et pull requests du dépôt `Kob0o/ValAubrelleFront`, branche `develop`.

| | |
|---|---|
| Sprint | Sprint 1, 16 et 17 novembre 2026 |
| Équipe | Front |
| Périmètre engagé | Lot G0 « Fondations » : issues #4 à #12 (G0.A à G0.I) |
| Charge estimée | 11 demi-journées (champ Estimate du kanban) |

## 1. Objectif du sprint

- Poser le socle technique du front (lot G0) : projet Next.js, charte graphique, types du contrat d'API, gestion des erreurs, client API et session, soumission idempotente, premiers composants (champs, tableau, carte, éditeur de sections).
- Préparer les écrans du sprint 1 du chiffrage (connexion, session, explorateur des communes, provenance des données…).

**Definition of Done du sprint 1 : « les écrans principaux affichent des données réelles ».**

## 2. Ce qui est livré

Issues en **Done** ou **Deployed** sur le kanban :

| Issue | Sujet | Statut | Estimate |
|---|---|---|---|
| #4 | G0.A Initialisation Next.js, design tokens de la charte graphique et UISetup | Deployed (fermée) | 1 |

Soit **1 demi-journée livrée sur 11**.

Autres résultats visibles dans `develop` :

- Code de #5 (G0.B DomainTypes) : types générés `src/types/api.d.ts`, `domain.ts`, `roles.ts`, fixtures `src/mocks/`, tests. Fusionné dans `develop`, mais la carte est encore « In progress ».
- CI GitHub Actions (lint, tests, build) et modèle de pull request vers `develop` (PR #16).
- Signature « Un service de la Communauté d'agglomération du Val d'Aubrelle » et tests de contraste de la charte.

## 3. Ce qui n'est pas livré

| Issue | Sujet | Statut kanban | Remarque |
|---|---|---|---|
| #5 | G0.B DomainTypes | In progress | Code dans `develop` sans pull request ; carte à mettre à jour |
| #6 | G0.C ErrorNormalizer et useFeedback | Blocked | Attend la fin de #5 (commentaire du 16/11) |
| #7 | G0.D useApi et useAuth | Ready | Non démarrée ; pas de développeur assigné |
| #8 | G0.E useIdempotentSubmit | In progress | Aucune branche poussée |
| #9 | G0.F TextField et Select | In Test | PR #15 ouverte, pas encore relue |
| #10 | G0.G DataTable | In progress | Aucune branche poussée |
| #11 | G0.H MapView | In progress | Aucune branche poussée |
| #12 | G0.I SectionEditor et SectionList | In progress | Bloquée par le contrat d'API (#17) ; la carte devrait être en « Blocked » |

Aucune user story du sprint 1 du chiffrage (US-001, US-002, US-004, US-005…) n'a été commencée : elles dépendent du socle G0.

## 4. Écart avec la Definition of Done du sprint 1

**Objectif non atteint.** Aucun écran principal n'affiche de données réelles :

- seul le socle G0 était engagé, et il n'est livré qu'en partie (#4) ;
- le client API et la session (#7) ne sont pas commencés : aucun appel au back n'est possible ;
- aucun écran (connexion, explorateur…) n'est développé ;
- les écrans ne pourraient pas être intégrés sans maquettes (voir plus bas).

La DoD du sprint 1 n'était pas atteignable avec le seul lot G0. Il faut la reformuler pour le sprint 1 ou la reporter au sprint 2.

Points de la DoD générale non vérifiables à ce jour :

- **CI** : la CI existe, mais aucun job ne s'exécute. Les runs du 16/11 échouent en 2 à 3 secondes avec le message « The job was not started because your account is locked due to a billing issue ». Lint, tests et build ne sont donc pas vérifiés sur GitHub.
- **Relecture en PR** : le code de #5 est arrivé dans `develop` par une fusion locale, sans pull request ni relecture.
- **Déploiement sur l'environnement intégré** : aucun environnement ni déploiement déclaré dans le dépôt GitHub, alors que #4 est en « Deployed ». À vérifier.

## 5. Points bloquants

### Contrat d'API : 2 routes manquantes

| Issue | Demande au back | Impact front |
|---|---|---|
| #17 | `POST /reports/drafts/{reportId}/sections` (section manuelle, type `manual`) et création d'un brouillon vide (US-026) | **Bloque** #12 |
| #18 | `GET /me` (ou `GET /auth/session`) pour retrouver la session (US-002) | #7, contourné par `sessionStorage` |

Trois confirmations sont aussi en attente : #19 (cookie de session, `SameSite`, CSRF), #20 (rôles et comptes ops), #21 (`GET /explorer`).

### Maquettes absentes

La DoR demande une « maquette disponible pour tout écran ». Aucune maquette n'est disponible. Les composants G0 avancent sur fixtures, mais aucun écran ne peut passer en Ready.

### Conflit `develop` / `main` dans la DoR

Les documents de départ n'étaient pas d'accord sur la branche de départ et la cible des pull requests. Conséquence : la PR #13 (G0.A) a été fusionnée dans `main`, puis `main` a été refusionné dans `develop` (PR #14).

**Tranché pour `develop`** : les branches `feature/xxx` partent de `develop` et les PR visent `develop` ; `main` reçoit seulement des PR `develop` → `main`. C'est écrit dans le README, dans le modèle de PR, et dans l'ADR 0004 (PR #22, en relecture).

## 6. Ce qui a bien marché

*Propositions à valider en équipe.*

- Issues G0 détaillées (user story, fichiers, critères d'acceptation, DoR, DoD) : chacun savait quoi faire.
- Points du contrat d'API repérés tôt et remontés au back dans des issues dédiées (#17 à #21).
- Décisions d'architecture écrites : Next.js, MapLibre GL, Recharts, stratégie de branches (ADR, PR #22).
- Socle Next.js et charte graphique livrés dès le premier jour, avec tests de contraste RGAA.
- Types générés depuis le contrat OpenAPI : un seul langage commun pour tout le front.

## 7. À améliorer

*Propositions à valider en équipe.*

- **Respect du flux de branches** : une fusion vers `main` (#13) et une fusion dans `develop` sans PR (G0.B). Rien n'empêche techniquement un push direct sur `develop` (pas de protection de branche).
- **CI hors service** : le compte GitHub est bloqué pour un problème de facturation ; aucune vérification automatique.
- **Kanban pas à jour** : #5 fusionnée mais « In progress », #12 bloquée mais « In progress », 5 cartes « In progress » en même temps pour 2 jours de sprint.
- **Engagement trop large** : 9 issues en 2 jours, avec des dépendances en chaîne (#5 → #6 → #7 → #8).
- **Travail non visible** : pas de branche poussée pour #8, #10, #11 et #12.
- **DoD de sprint irréaliste** : elle visait des écrans avec données réelles alors que le sprint ne contenait que du socle.

## 8. Actions pour le sprint 2

*Propositions à valider en équipe. Responsable et échéance à fixer ensemble.*

| # | Action | Responsable | Échéance |
|---|---|---|---|
| 1 | Régler le blocage de facturation GitHub pour relancer la CI | à attribuer | début du sprint 2 |
| 2 | Protéger `develop` et `main` : PR obligatoire, CI verte, une relecture | à attribuer | début du sprint 2 |
| 3 | Relire et fusionner les PR ouvertes (#15 G0.F, #22 ADR) | à attribuer | sprint 2 |
| 4 | Mettre le kanban à jour (#5, #12) et limiter le travail en cours : 1 carte « In progress » par personne | toute l'équipe | quotidien |
| 5 | Pousser sa branche dès le premier commit, PR en brouillon si besoin | toute l'équipe | quotidien |
| 6 | Attribuer #6 et #7 et finir le socle G0 en priorité (#5 → #6 → #7 → #8) | à attribuer | sprint 2 |
| 7 | Obtenir les réponses du back sur #17 et #18 ; relancer en point d'équipe | à attribuer | sprint 2 |
| 8 | Obtenir les maquettes des écrans P1 (connexion) et P4 (explorateur) | à attribuer | sprint 2 |
| 9 | Écrire une DoD de sprint atteignable : par exemple « connexion et explorateur branchés sur l'API d'intégration » | toute l'équipe | planification du sprint 2 |
