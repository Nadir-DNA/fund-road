# Refonte de l'expérience — plan et suivi

Branche : `worktree-refonte-experience`. Règle de chaque étape : `npm run build` et `npm test` verts avant de passer à la suivante. Charte : `design.md` ; valeurs uniquement dans `app/tokens.css`. Aucun accès aux données de production ni aux secrets.

Base de départ (avant toute modification) : build OK, 42 tests OK.

## Étape 0 — Inventaire de l'existant

Le frontend tient dans `app/main.tsx` (4 696 lignes) et `app/style.css` (2 812 lignes). Aucune couleur hexadécimale ni police en dur dans `style.css` ; `fonts.css` ne contient que les `@font-face`.

| # | Constat | Fichiers | Gravité |
|---|---------|----------|---------|
| 1 | Sur-titre en capitales espacées (`.fund-kind` : `uppercase` + `letter-spacing: 0.06em`), interdit par `design.md` | `app/style.css` (`.fund-kind`), `app/main.tsx` (annuaire, portail) | Charte |
| 2 | Couleur en dur `#eb743c` comme valeur par défaut du sélecteur de couleur d'accent | `app/main.tsx` (`OrganizationPage`) | Charte |
| 3 | Textes écrits en capitales dans le source puis « corrigés » en CSS (`text-transform: lowercase` + `::first-letter`) : « VOTRE ESPACE », « DOSSIER PARTAGÉ · VERSION DATÉE ». Lecteurs d'écran et copier-coller voient les capitales | `app/main.tsx` (`Shell`, `SharedApplication`), `app/style.css` (`.nav-label`, `.eyebrow`, `.workspace-header > span`) | Accessibilité |
| 4 | Style inline `paddingTop: 0` sur deux sections de l'accueil, hors classes | `app/main.tsx` (`Landing`, `FinanceursPage`) | Charte |
| 5 | Appel final de l'accueil : « construire, structurer et financer votre startup ». Contredit la vision (« ne pas promettre un financement ») et le héros, qui parle de dossier prêt pour le comité | `app/main.tsx` (`Landing`, section `cta-band`) | Contenu |
| 6 | Tableau de bord d'un compte sans dossier : trois compteurs « 00 / 0 % / 00 » au-dessus de l'état vide. Du bruit à la première visite | `app/main.tsx` (`Dashboard`) | Parcours |
| 7 | Navigation de l'application : « Recommandations » alors que `fundroad-parcours.md` nomme l'entrée « Parrainage » ; « Mes dossiers » et « Vue d'ensemble » affichent la même liste | `app/main.tsx` (`links`) | Parcours |
| 8 | Intégration : l'écran « À chaque projet, son espace » demande d'emblée un type d'organisation parmi six, y compris à une startup qui a déjà choisi son profil à l'inscription | `app/main.tsx` (`Onboarding`) | Parcours |

À ne pas toucher dans cette refonte (hors périmètre ou risque) : `src/` et `supabase/` (code historique), `server/`, `shared/`, migrations, `.env*`, captures `public/screens/` (à régénérer avec le dossier de démonstration, pas à la main).

## Étapes de correction

- [x] **1. Charte** : constats 1 à 4.
- [x] **2. Accueil** : constat 5.
- [x] **3. Tableau de bord et navigation** : constats 6 et 7.
- [x] **4. Onboarding** : constat 8, corrigé à la baisse (voir journal).

## Journal

- **Étape 1 (charte)** : `.fund-kind` sans capitales ni espacement ; accent par défaut lu depuis `--color-accent` au lieu de `#eb743c` ; libellés écrits en casse normale dans le source (plus de `text-transform` + `::first-letter`), y compris « Regard investisseur », « Extrait source », « Compléments tirés des documents » ; styles inline `paddingTop` remplacés par `.section-suite`. Build OK, 42 tests OK.
- **Étape 2 (accueil)** : l'appel final ne promet plus de « financer » : « Un dossier clair et sourcé, prêt à être examiné par les financeurs. », cohérent avec le héros et la vision. Build OK, 42 tests OK.
- **Étape 3 (tableau de bord, navigation)** : compteurs masqués tant qu'aucun dossier n'existe ; « Recommandations » devient « Parrainage » ; l'entrée en doublon « Mes dossiers » est retirée (la route `/app/dossiers` reste), « Vue d'ensemble » restant active sur les pages de dossier. Build OK, 42 tests OK.
- **Étape 4 (onboarding)** : constat 8 surestimé. Le type est déjà pré-rempli depuis l'inscription, qui ne distingue que « financeur » du reste ; le sélecteur reste donc nécessaire pour choisir entre fonds, angel, réseau, subvention. Seul le titre vague « À chaque projet, son espace » est remplacé par « Créez votre espace », avec l'explication du pré-remplissage. Build OK, 42 tests OK.

## Reste à faire (hors de cette passe)

- Pas vérifié dans un navigateur : aucun test e2e lancé (`npm run test:e2e` demande l'application et sa base locale). Les changements d'écran sont validés par build et tests unitaires seulement.
- Captures `public/screens/` non régénérées : elles montrent peut-être l'ancienne navigation.
- Non traités : parcours de candidature et pages internes du dossier, pas audités en détail dans cette passe.
