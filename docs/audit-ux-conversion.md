# Audit Fund Road — application et vitrine (startups + financeurs)

_12 novembre 2026. Méthode : lecture complète de `app/main.tsx` (espaces connectés compris), des routes `server/index.ts`, du worker et des emails ; site en production sur desktop et mobile ; données de l'annuaire._

_Non couvert : test en conditions réelles d'un compte connecté (aucun compte créé), accessibilité fine, qualité des réponses de l'IA._

## Synthèse

| # | Criticité | Qui | Problème | Effort |
|---|-----------|-----|----------|--------|
| 1 | 🔴 Critique | Financeur → startup | L'invitation d'une startup n'aboutit pas | Moyen |
| 2 | 🔴 Critique | Startup | Le partage propose des financeurs qui renvoient une erreur | Très faible |
| 3 | 🔴 Critique | Les deux | Contexte perdu à la confirmation d'email (financeur visé, profil, code parrain) | Faible |
| 4 | 🔴 Critique | Les deux | Questions du financeur : pas de champ de réponse là où l'email envoie, et aucune alerte au retour | Faible |
| 5 | 🔴 Critique | Startup | Saisie effacée dans « Mon dossier » quand on confirme une rubrique | Faible |
| 6 | 🟠 Élevé | Financeur | La vue d'un dossier reçu est trop pauvre | Moyen |
| 7 | 🟠 Élevé | Startup | L'unique analyse gratuite part sans prévenir, puis blocage | Faible |
| 8 | 🟠 Élevé | Startup | Aucune alerte quand l'analyse (2 à 3 min) est terminée | Faible |
| 9 | 🟠 Élevé | Les deux | Même menu et mêmes écrans pour startups et financeurs | Faible |
| 10 | 🟠 Élevé | Financeur | Pipeline sans action « Inviter », sans copie du lien, sans mise en route | Moyen |
| 11 | 🟠 Élevé | Startup | Cinq étapes avant de déposer un premier document | Faible |
| 12 | 🟠 Élevé | Startup | L'offre affichée ne correspond pas à ce que l'app autorise | Décision |
| 13 | 🟠 Élevé | Startup | Ticket « À préciser » sur 116 fiches sur 119 | Moyen (données) |
| 14 | 🟠 Élevé | Les deux | Aucune preuve sociale sur la vitrine | Moyen (contenu) |
| 15 | 🟡 Moyen | Startup | Onglets du dossier absents de l'URL | Faible |
| 16 | 🟡 Moyen | Les deux | Erreurs en toast de 6,5 s, `confirm()` natifs, statuts bruts | Faible |
| 17 | 🟡 Moyen | Startup | Éligibilité : relance manuelle, liste de 51 programmes sans recherche | Moyen |
| 18 | 🟡 Moyen | Startup | Fin du partage : pas de suite, libellé faux, pièces décochées | Très faible |
| 19 | 🟡 Moyen | Les deux | Sécurité : 2FA sans QR code, pas de changement de mot de passe ni de nom | Faible |
| 20 | 🟡 Moyen | Les deux | Annuaire sans compteur ni tri ; CTA ambigu sur les fiches non inscrites | Faible |
| 21 | 🟡 Moyen | Les deux | Inscription sans SSO ni lien CGV | Moyen |
| 22 | 🟢 Faible | Tous | Poids du JS (app entière chargée sur la vitrine, FontAwesome 113 Ko) | Moyen |
| 23 | 🟢 Faible | Tous | Incohérences de liens et de libellés | Très faible |

---

## 🔴 Critique

### 1. L'invitation d'une startup par un financeur n'aboutit pas
C'est l'argument « Invitez les startups » de la page Financeurs. Trois ruptures s'enchaînent :
- La page [Invitation](app/main.tsx:4491) ne propose que « Se connecter ». Une startup invitée n'a pas de compte et aucun lien d'inscription ne lui est offert. Après connexion, [AuthPage](app/main.tsx:1263) envoie vers `/app` et le jeton d'invitation est perdu.
- Après acceptation, `navigate("/app")` : sans organisation, [Shell](app/main.tsx:1517) impose l'écran « Créez votre organisation ».
- Une fois l'organisation créée, [Dashboard](app/main.tsx:1619) filtre `d.organization_id === org.id` : le dossier auquel elle a été invitée n'apparaît dans aucune liste, alors que l'API `/api/dossiers` le renvoie bien.

**Correctif.**
- Sur `/invitation/:token` : garder le jeton (`localStorage`), proposer « Créer mon compte » et « Se connecter », puis accepter automatiquement au retour.
- Faire renvoyer `dossierId` par `POST /api/invitations/:token/accept` ([server/index.ts:1141](server/index.ts:1141)) et naviguer vers `/app/dossiers/<id>`.
- Dans `Shell`, ne pas imposer l'onboarding à un utilisateur qui a des dossiers en contribution.
- Dans `Dashboard`, ajouter une section « Dossiers partagés avec moi » pour les lignes dont l'organisation n'est pas la sienne.

### 2. Le formulaire de partage liste des financeurs qui renvoient une erreur
[ShareForm](app/main.tsx:3052) remplit le menu « Choisir un financeur inscrit » avec tout `/api/directory`, soit les 119 fiches, dont les fiches d'annuaire non inscrites. Leur identifiant est celui de la table `investors`, que le serveur refuse : « Organisation destinataire invalide » ([server/index.ts:872](server/index.ts:872)). La startup échoue à la dernière étape de son parcours avec un message incompréhensible.

**Correctif.** `financers?.filter((o) => o.claimed)` dans le menu. Pour une fiche non inscrite, afficher son canal officiel et le bouton d'export PDF à la place.

### 3. Le contexte se perd à la confirmation de l'adresse email
Le financeur visé (`fundroad-recipient`), le profil choisi (`fundroad-profil`) et le code de parrainage (`fundroad-code`) sont en `sessionStorage`, donc propres à l'onglet. En production l'inscription passe par un lien reçu par email, qui s'ouvre dans un nouvel onglet. Conséquences :
- la startup venue du portail d'un financeur crée un dossier qui n'est plus rattaché à ce financeur ;
- le financeur venu de `/inscription?profil=financeur` retombe sur « Une startup / entreprise » dans [Onboarding](app/main.tsx:1586) ;
- le code de parrainage n'est plus prérempli dans Facturation.

En plus, le bouton « Préparer ma candidature » d'un [portail](app/main.tsx:4416) envoie un visiteur non connecté sur `/app/dossiers`, qui affiche un message d'erreur et un lien « Se connecter » au lieu d'une inscription.

**Correctif.** Passer ces trois clés en `localStorage` (lecture et écriture, une dizaine de lignes). Sur le portail, envoyer un visiteur non connecté vers `/inscription`.

### 4. Les questions du financeur ne font pas l'aller-retour
- L'email reçu par la startup dit « Répondre : /partages/<id> » ([server/index.ts:1257](server/index.ts:1257)), mais [SharedApplication](app/main.tsx:4563) affiche la question en lecture seule. Le champ de réponse est ailleurs, dans l'onglet « À compléter » du dossier.
- Quand la startup répond, `PUT /api/questions/:id` ([server/index.ts:1261](server/index.ts:1261)) n'envoie rien : le financeur doit rouvrir chaque dossier pour voir s'il a une réponse.

**Correctif.** Dans `SharedApplication`, afficher le formulaire de réponse quand `a.canRevoke` est vrai (c'est la startup). Dans la route `PUT`, ajouter `notifyOrg(q.organization_id, …)` avec le lien du partage.

### 5. Saisie effacée dans « Mon dossier »
Chaque [FactEditor](app/main.tsx:2357) a pour clé `r.id + ":" + d.revision` et un `textarea` non contrôlé. Confirmer une rubrique incrémente la révision : les huit autres cartes sont recréées et tout texte tapé mais pas encore confirmé disparaît. Même effet si une analyse se termine pendant la saisie (rafraîchissement toutes les 2,5 s).

**Correctif.** Clé `r.id` seule, valeur tenue dans un `useState` qui ne se resynchronise sur `fact.value` que si le champ n'a pas été modifié. Ajouter un bouton « Confirmer toutes les propositions relues » : aujourd'hui il faut neuf clics.

---

## 🟠 Élevé

### 6. La vue d'un dossier reçu est trop pauvre pour un financeur
[SharedApplication](app/main.tsx:4522) est l'écran que le financeur consulte le plus. Il s'affiche dans la mise en page de la vitrine, sans retour vers le pipeline, et ne montre que le texte des neuf rubriques. Il manque :
- le score de complétude et l'adéquation critère par critère (calculés pour le pipeline, pas renvoyés ici) ;
- les citations sources, pourtant présentes dans `snapshot.state.facts[…].quote` — c'est la promesse centrale du produit ;
- le changement d'étape, l'export PDF, l'auteur et la date des notes privées.

**Correctif.** Rendre la page dans `Shell` pour un membre connecté, avec un lien « ← Pipeline ». Renvoyer `score` et `fit` depuis `GET /api/applications/:id` ([server/index.ts:1004](server/index.ts:1004)) en réutilisant `evaluate()` du pipeline. Afficher `quote` sous chaque rubrique, le sélecteur d'étape, et `author`/`created_at` sur les notes.

### 7. L'unique analyse gratuite part sans prévenir
L'offre Découverte donne une analyse par mois (`FREE_ANALYSES`, [server/config.ts](server/config.ts)). [DepotAnalyse](app/main.tsx:1830) la lance automatiquement dès le premier dépôt, même si la startup n'a déposé qu'un fichier sur cinq. Ensuite chaque réponse à un critère d'éligibilité affiche « Relancez la vérification », qui renvoie une erreur 402 dans un toast de 6,5 s. Le solde n'est visible que dans Facturation.

**Correctif.** Afficher « 1 analyse restante ce mois-ci » dans la zone de dépôt (ajouter `usage` et `quota` à `/api/dossiers/:id`). En offre gratuite, remplacer le lancement automatique par un bouton « Lancer l'analyse sur ces N documents ». Sur une 402, afficher un encart permanent avec le bouton vers Facturation.

### 8. Aucune alerte quand l'analyse est terminée
L'analyse dure 2 à 3 minutes et [server/worker.ts](server/worker.ts) n'envoie aucun email. La startup qui change d'onglet ne revient pas forcément.

**Correctif.** `notifyOrg(organization_id, "Votre dossier est analysé", lien)` à la fin du job, et le titre de l'onglet mis à jour (« ✓ Analyse terminée »).

### 9. Même menu et mêmes écrans pour tous les profils
- Le menu [links](app/main.tsx:1393) est fixe : un fonds voit « Mes dossiers », « Candidatures », « Annuaire » (des financeurs) et « Facturation » alors que tout est gratuit pour lui.
- [OrganizationPage](app/main.tsx:3722) montre à une startup « Identité du portail », « Thèse et critères », « Pièces demandées », qui ne la concernent pas.

**Correctif.** Deux listes de liens selon `org.kind` (financeur : Pipeline, Dossiers invités, Mes critères, Équipe, Sécurité). Dans `OrganizationPage`, n'afficher critères, questions, pièces et couleur que si `org.kind !== "startup"`.

### 10. Pipeline financeur : il manque les actions de base
- L'état vide de [Pipeline](app/main.tsx:3399) dit « invitez une startup », sans bouton. Le chemin réel est caché : Mes dossiers → Nouveau dossier → onglet Partager → formulaire d'invitation.
- « Mon lien de candidature » ouvre le portail au lieu de copier le lien.
- Pas de recherche, pas de tri par adéquation ou par date, pas d'export.
- Aucune mise en route : un nouveau financeur arrive sur un tableau vide.

**Correctif.** Bouton « Inviter une startup » (nom + email, crée le dossier et envoie l'invitation en une fois). Bouton « Copier mon lien » avec `navigator.clipboard`, déjà utilisé dans [Partners](app/main.tsx:3933). Tri sur les colonnes. Encart de trois étapes tant qu'elles ne sont pas faites : critères, logo, lien partagé.

### 11. Cinq étapes avant de déposer un premier document
Inscription → email → organisation → « Nouveau dossier » (nom, objectif) → dépôt. Le nom de la startup est demandé deux fois.

**Correctif.** Pour une startup, [Onboarding](app/main.tsx:1548) crée l'organisation et un premier dossier du même nom (ajouter le champ Objectif au formulaire), puis ouvre directement `/app/dossiers/<id>` sur la zone de dépôt.

### 12. L'offre affichée ne correspond pas à ce que l'app autorise
- [Tarifs](app/main.tsx:1134) : l'offre gratuite promet « Dossier de financement, même incomplet » et « envoi aux financeurs ». Le partage est pourtant refusé tant que les neuf rubriques ne sont pas confirmées ([server/index.ts:881](server/index.ts:881)).
- Les exports PDF et Word figurent dans l'offre payante, mais la route d'export ne vérifie aucun droit ([server/index.ts:733](server/index.ts:733)).
- Le bouton de partage désactivé ne dit pas quelles rubriques manquent ([ShareForm](app/main.tsx:3090)).

**Correctif.** À vous de trancher : soit autoriser le partage d'un dossier incomplet avec son pourcentage affiché, soit corriger le texte des tarifs. Idem pour les exports : les restreindre ou les annoncer gratuits. Dans tous les cas, lister les rubriques manquantes avec un lien vers chacune.

### 13. Ticket « À préciser » sur 116 fiches sur 119
Seules 3 fiches de `.local/financeurs/financeurs.json` ont un `ticketMin`. C'est le premier critère qu'une startup regarde.

**Correctif.** Repasser l'extraction, qui demande déjà `ticketMin` et `ticketMax` ([server/financeurs.ts:235](server/financeurs.ts:235)), sur les fiches sans ticket, puis relire les valeurs. À défaut de source, masquer la ligne.

### 14. Aucune preuve sociale sur la vitrine
Ni [l'accueil](app/main.tsx:623) ni [la page Financeurs](app/main.tsx:968) ne portent de témoignage, de chiffre ou de logo.

**Correctif.** Une bande sous le hero : « 119 financeurs référencés », le nombre d'aides couvertes, deux ou trois témoignages nommés dès que vous en avez.

---

## 🟡 Moyen

### 15. Onglets du dossier absents de l'URL
[DossierPage](app/main.tsx:2000) garde l'onglet dans un `useState`. Un rechargement revient sur « Vue d'ensemble » et aucun email ne peut pointer vers « À compléter » ou « Partager ».
**Correctif.** `useSearchParams` (`?onglet=questions`).

### 16. Retours d'erreur et confirmations
- Toutes les erreurs passent par un toast de 6,5 s ([useAction](app/main.tsx:172)), y compris les messages longs.
- Le chargement d'un dossier s'affiche dans la boîte d'erreur ([ligne 2017](app/main.tsx:2017)).
- Suppressions par `confirm()` natif ; retrait d'un membre sans aucune confirmation ([ligne 3800](app/main.tsx:3800)).
- Statuts bruts affichés : `r.status` dans Recommandations, `j.error` dans le journal en bas du dossier.

**Correctif.** Afficher l'erreur près du formulaire (le composant `ErrorBox` existe), ajouter un `confirm` au retrait de membre, traduire les statuts.

### 17. Éligibilité
- Après chaque réponse il faut relancer la vérification à la main, ce qui consomme une analyse (voir 7).
- Le choix d'un programme est un menu natif de 51 programmes plus les financeurs, sans recherche.

**Correctif.** Regrouper les réponses puis proposer une seule relance. Champ de recherche, et suggestions selon l'objectif et le stade du dossier.

### 18. Fin du partage
- Après l'envoi, le formulaire reste affiché, sans lien vers Candidatures.
- Les pièces sont toutes décochées par défaut alors que le financeur en demande.
- Le titre « Inviter la startup à compléter ce dossier » ([ligne 2980](app/main.tsx:2980)) s'affiche aussi pour la startup propriétaire.
- Un destinataire par email doit créer un compte pour lire le dossier.

**Correctif.** Rediriger vers `/app/candidatures`, précocher les pièces, titre « Inviter un associé » quand `org.kind === "startup"`.

### 19. Sécurité et compte
[Security](app/main.tsx:4130) affiche l'URI TOTP en texte, sans QR code. Aucun écran pour changer son mot de passe, son nom ou son email une fois connecté.
**Correctif.** QR code de l'URI ; formulaire de changement de mot de passe (`better-auth` l'expose).

### 20. Annuaire
[Directory](app/main.tsx:3102) n'affiche ni nombre de résultats ni tri. Sur une fiche non inscrite, « Préparer mon dossier » laisse croire à un envoi par la plateforme.
**Correctif.** `{rows.length} financeurs` et un tri ; sous le bouton, une phrase qui dit que l'envoi se fait par le canal officiel.

### 21. Inscription
[AuthPage](app/main.tsx:1225) : pas de connexion Google, pas de rappel du profil choisi, pas de lien vers les CGV alors qu'elles disent que créer un compte vaut acceptation.
**Correctif.** `socialProviders.google` de `better-auth`, une ligne de consentement sous le bouton.

---

## 🟢 Faible

### 22. Poids du JavaScript
`index` 330 Ko (98 Ko gzip) contient tout l'espace connecté, chargé dès l'accueil ; FontAwesome pèse 113 Ko pour une vingtaine d'icônes.
**Correctif.** `React.lazy` sur `Shell` ; imports d'icônes unitaires ou SVG en ligne dans [app/icons.tsx](app/icons.tsx).

### 23. Incohérences
- Carte Financeurs des tarifs : lien `/inscription` sans `?profil=financeur` ([ligne 1205](app/main.tsx:1205)).
- « Gérer ma facturation » (portail Stripe) reste affiché pour un financeur ou une offre gratuite ; le résultat du clic n'a pas été testé.
- Champ « Code de recommandation » placé dans le bloc d'état, loin du bouton d'achat.

---

## Ordre conseillé
1. **Corrections courtes à fort effet** : 2, 3, 4, 5, 18, 23.
2. **Boucle financeur** : 1, 6, 10, 9.
3. **Activation startup** : 11, 7, 8, 12.
4. **Contenu et données** : 13, 14.
5. **Le reste** : 15 à 22.
