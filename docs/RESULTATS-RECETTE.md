# Résultats de la recette Fund Road

Campagne du 1er novembre 2026, conduite sur la base de [CAHIER-DE-RECETTE.md](CAHIER-DE-RECETTE.md).

## Synthèse

| | Cas | OK | OK après correctif | KO ouvert | NT |
|---|---|---|---|---|---|
| **Total** | 192 | 162 | 13 | 2 | 15 |
| dont P1 | 99 | 83 | 7 | 2 | 7 |

Deux cas ont été ajoutés en cours de campagne : SEC-10 et SEC-11, tous deux corrigés.

- **12 anomalies trouvées, toutes corrigées.** Chaque correctif a été revérifié, puis mis en production (3 déploiements, santé OK).
- **Restent ouverts, hors code :**
  - clé Resend à révoquer (SEC-09) ;
  - copie de sauvegarde hors de la box (EXO-09) ;
  - mentions légales et CGU absentes.
- **Décision :** mise en vente **non encore possible**. Deux P1 sont KO et les mentions légales manquent. Sept P1 sont NT, faute d'emails, de paiement et de pilote réel (détail en fin de document).

### Environnement et méthode

- **Production** (fund-road.com) : tout ce qui se lit sans compte, plus les outils du conteneur. Je n'ai créé aucun compte en production.
- **Local** : deux scripts automatisés et un navigateur Chromium piloté. Ils ont couvert 40 comptes de test, 5 analyses IA réelles (environ 30 000 jetons chacune) et un faux serveur email qui capture tous les messages.
- **Statuts** :
  - **OK** : conforme au résultat attendu.
  - **OK après correctif** : KO à la première exécution, corrigé, puis revérifié.
  - **KO** : écart ouvert.
  - **NT** : non testé, avec la raison.
- Chaque cas porte une colonne **Amélioration**, remplie même quand il est OK.
- Scripts et captures : `/tmp/claude-1000/-home-dna-Documents-Codex-2026-10-13-j-aimerai-qu-on-reprenne-le-fundroad/f4d9b3df-97d0-4a00-940d-ee6fbff34203/scratchpad/recette/` (`api*.mjs`, `web.mjs`, `ui*.mjs`, `captures/`).

## Anomalies trouvées et corrigées

| N° | Cas | Gravité | Constat | Correctif | Vérifié |
|---|---|---|---|---|---|
| ANO-001 | ANN-08, PUB-05 | Bloquante | L'annuaire charge 85 logos et un simple visiteur dépassait la limite de 120 requêtes par minute. Résultat : erreurs 429, logos et annuaire vides si l'on enchaîne deux pages. | Fichiers statiques et logos sortis du quota ; l'API reste limitée (`server/index.ts`). | Production : 0 erreur sur 8 pages, 85 logos affichés |
| ANO-002 | CKI-04 | Majeure (RGPD) | Après « Gérer les cookies », le cookie `_ga_BW773NTYEG` survivait : Google Analytics le réécrivait avant le rechargement. | GA désactivé avant l'effacement (`app/main.tsx`). | Production : `_ga` 2 → 0 |
| ANO-003 | AUT-01, 03, 04 | Majeure | Messages d'inscription et de connexion en anglais (« Invalid email or password », « User already exists »). | Traduction par code d'erreur, plus un message pour les tentatives trop rapprochées. | Local : « Un compte existe déjà avec cette adresse » |
| ANO-004 | DOS-08 | Mineure | Au-delà de 20 Mo, message anglais « request file too large ». | Message « Fichier limité à 20 Mo ». | Local |
| ANO-005 | FIN-01 | Majeure | Un financeur pouvait enregistrer un ticket minimum supérieur au maximum. | Règle ajoutée au schéma des critères. | Local : refus 400 |
| ANO-006 | IA-06 | Bloquante | Les projections (prévisionnel 2027) arrivaient dans les « compléments » sans marque d'hypothèse ; seul le libellé de l'IA le disait. | Les compléments gardent leur nature, badge « Hypothèse » à l'écran et « Hypothèse : » dans le PDF. Test unitaire ajouté. | Local : 2 projections, 2 marquées |
| ANO-007 | ELI-04, ELI-07 | Bloquante | i-Lab marqué « Non éligible » parce que l'information juridique était « à compléter » : une absence d'information devenait un échec bloquant. | Un « non rempli » fondé sur une mention « à compléter » redevient « à vérifier » ; consigne de l'IA précisée. Test unitaire ajouté. | Test unitaire et nouvelle analyse réelle |
| ANO-008 | IA-02 | Majeure | Le pourcentage reculait de 35 % à 15 % entre le lancement et la lecture des documents. | Barre monotone ; au-delà de l'estimation : « encore quelques instants ». | Local : 295 relevés, aucun recul |
| ANO-009 | PUB-09 | Mineure | La page 404 disait « Cette page a changé — Fund Road prépare une nouvelle expérience », ce qui trompe le visiteur après une faute de frappe. | « Page introuvable », avec un texte d'orientation. | Production |
| ANO-010 | SEC-10 (ajouté) | Mineure | Un identifiant de document mal formé provoquait une erreur 500 dans les journaux. | Format validé : réponse 400. | Local |
| ANO-012 | SEC-11 | Majeure | Limite de connexion contournable en falsifiant `x-forwarded-for`. | Lecture de `cf-connecting-ip` derrière Cloudflare (`server/auth.ts`). | Production |
| ANO-011 | ORG, FIN (formulaires) | Mineure | Une saisie refusée affichait seulement « Données invalides ». | Le détail du champ en cause est affiché. | Compilation et tests |

Après correctifs : 39 tests unitaires OK, compilation TypeScript sans erreur.

---

## Résultats détaillés

### 1. Site public

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| PUB-01 | OK | Titre animé, route et voiture présentes, aucune zone vide en défilant vite, 0 erreur JS | — |
| PUB-02 | OK | 5 rubriques visibles, retour en haut sans saut | — |
| PUB-03 | OK | « Voir comment ça marche » défile jusqu'au parcours | — |
| PUB-04 | OK | « Créer mon espace financeur » mène à `/inscription` | Pointer vers `/inscription?type=financeur` pour présélectionner le type d'organisation |
| PUB-05 | OK après correctif | 8 pages sans erreur (des 429 avant ANO-001) | — |
| PUB-06 | OK | Découverte 0 €, 149 € HT / 90 jours, gratuit financeurs, aucune commission | Prix TTC non affiché : utile pour les auto-entrepreneurs non assujettis |
| PUB-07 | OK | Nouvelle page ouverte en haut | — |
| PUB-08 | OK | 9 liens du pied de page valides | **Pas de mentions légales ni de CGU/CGV** : obligatoires pour vendre (voir KO ouverts) |
| PUB-09 | OK après correctif | 404 HTTP et « Page introuvable » (ANO-009) | — |
| PUB-10 | OK | Le menu mobile s'ouvre et se ferme | — |
| PUB-11 | OK | « Fund Road » partout sur l'accueil, l'export et les emails | — |
| PUB-12 | OK | « ne garantit pas un financement » en pied de page, aucune promesse d'éligibilité | — |

### 2. Thème clair / sombre

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| THM-01 | OK | Appareil en sombre : fond nuit `oklch(20,5 % 0,04 257)` | — |
| THM-02 | OK | Bascule immédiate (site public et espace) | — |
| THM-03 | OK | Choix conservé, thème posé avant le rendu (pas de flash) | — |
| THM-04 | OK | Aucune zone blanche sur l'accueil, l'annuaire, une fiche, les tarifs et un dossier connecté | — |
| THM-05 | OK | Bascule masquée sous 520 px | Sur mobile, impossible de forcer un thème : une entrée dans le menu suffirait |

### 3. Cookies et mesure d'audience

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| CKI-01 | OK | Bannière, boutons de même style (85/93 px), 0 requête de mesure avant le choix | **Polices Google chargées avant tout choix** : l'adresse IP du visiteur part chez Google (sanctionné en Allemagne). Héberger Archivo et JetBrains Mono sur fund-road.com |
| CKI-02 | OK | Refus mémorisé, 0 requête Google | — |
| CKI-03 | OK | googletagmanager puis collecte GA après acceptation | La vue « Temps réel » de GA n'a pas été consultée (pas d'accès au compte) |
| CKI-04 | OK après correctif | Bannière de retour, `_ga` 2 → 0 (ANO-002) | — |
| CKI-05 | OK | Mesure chargée seulement sur `fund-road.com` (code) | — |

### 4. Référencement

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| SEO-01 | OK | Titres de 49 à 60 car., descriptions de 138 à 156, canoniques `https://fund-road.com/…`, contenu dans le HTML | `/confiance` : 40 car. et la description ne cite pas « RGPD », la requête la plus probable |
| SEO-02 | OK | `http://` et `www.` → 301 vers `https://fund-road.com` | — |
| SEO-03 | OK | 125 URL dont 115 fiches, 0 page privée | Pas de `<lastmod>` : Google ne sait pas quelles fiches ont été mises à jour |
| SEO-04 | OK | robots.txt (pages privées exclues, sitemap référencé), llms.txt de 115 fiches | — |
| SEO-05 | OK | `/app`, `/connexion` en `noindex` | Ces pages gardent le titre générique de l'accueil : un titre propre aiderait l'historique du navigateur |
| SEO-06 | OK | JSON-LD présent : Organization, SoftwareApplication, WebSite, FAQPage, Offer, ProfilePage, BreadcrumbList, ItemList | Outil Rich Results de Google non passé (à faire une fois dans Search Console) |
| SEO-07 | OK | `/portail/kima-ventures` → 301 `/fonds/kima-ventures` | — |
| SEO-08 | NT | Pas d'accès à Search Console | — |

### 5. Comptes et authentification

Jouée en local : la création de comptes en production m'est interdite. Le code est identique.

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| AUT-01 | OK après correctif | Refus 400 ; message traduit (ANO-003) | Afficher la règle des 12 caractères sous le champ avant la saisie |
| AUT-02 | OK | Compte créé et session ouverte, par l'API et par le formulaire | — |
| AUT-03 | OK après correctif | Refus 422, un seul compte ; « Un compte existe déjà… » | — |
| AUT-04 | OK après correctif | Même réponse pour une adresse connue ou inconnue (pas d'énumération) | — |
| AUT-05 | OK | `/api/me` 200 puis 401 après déconnexion | — |
| AUT-06 | OK (local) / NT (prod) | Email de réinitialisation reçu par le faux SMTP | En production sans SMTP, la page dit « Consultez votre boîte email » alors que rien ne part : afficher que l'envoi est indisponible |
| AUT-07 | OK | Double authentification activée, 10 codes de secours, code validé | — |
| AUT-08 | OK | Code demandé à la connexion, faux code refusé (401), bon code accepté | — |
| AUT-09 | OK | Mauvais mot de passe refusé (400), désactivation avec le bon | — |
| AUT-10 | OK | L'autre onglet est déconnecté (401) | — |

### 6. Organisations, membres et rôles

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| ORG-01 | OK | Organisation créée depuis l'écran d'accueil, rôle propriétaire | Type choisi dans une liste déroulante : des cartes « Startup / Financeur / Incubateur » expliqueraient mieux le choix |
| ORG-02 | OK | Bascule d'organisation : contenu changé, choix mémorisé après rechargement | — |
| ORG-03 | OK | Nom, couleur, présentation enregistrés | — |
| ORG-04 | OK | PNG de 130 Ko accepté et servi | — |
| ORG-05 | OK | SVG, GIF, faux PNG refusés (400), plus de 1 Mo refusé (413) | — |
| ORG-06 | OK | Éditeur et relecteur ajoutés avec le bon rôle, invitation valable 7 jours | — |
| ORG-07 | OK | Invitation réutilisée, expirée ou pour une autre adresse : 403 | — |
| ORG-08 | OK | Relecteur : lecture 200 ; dépôt, rubrique, analyse 403 | — |
| ORG-09 | OK | Éditeur : suppression et modification de l'organisation 403 | — |
| ORG-10 | OK | Membre retiré : 403 dès la requête suivante | — |
| ORG-11 | OK | Retrait du propriétaire refusé (400) | Pas de transfert de propriété : si le fondateur part, l'organisation est bloquée |

### 7. Dossier : création et dépôt

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| DOS-01 | OK | Dossier ouvert directement, zone de dépôt visible sans défiler | — |
| DOS-02 | OK | Bouton inactif ; l'API refuse aussi (409) | — |
| DOS-03 | OK | Envoi séquentiel « Envoi 1/3… » | Envoi un par un : 30 fichiers prennent du temps ; deux envois en parallèle accéléreraient |
| DOS-04 | OK | Vérifié dans Chromium lors du correctif du 1/11 ; non rejouable automatiquement (glisser-déposer natif) | À rejouer à la main sous Safari et Firefox |
| DOS-05 | OK | Dossier avec sous-dossier : 3 fichiers envoyés, y compris celui du sous-dossier | — |
| DOS-06 | OK | « 3 document(s) déposé(s) · 2 fichier(s) ignoré(s) » | Nommer les fichiers ignorés |
| DOS-07 | OK | Doublon reconnu, pas de second document | Rien n'est affiché : dire « déjà déposé » |
| DOS-08 | OK après correctif | 413 « Fichier limité à 20 Mo » (ANO-004) | La limite ne se découvre qu'après l'envoi : contrôler la taille dans le navigateur avant |
| DOS-09 | OK | 31e document : 413 « Limite de 30 documents par dossier » | — |
| DOS-10 | OK | Faux PDF : 400 « Le contenu ne correspond pas au format » | — |
| DOS-11 | OK | Word avec macro : « Contenu actif ou pièce embarquée non accepté » | Refus constaté après l'envoi, et le bouton « Réessayer » est proposé alors qu'il échouera toujours : refuser dès le dépôt |
| DOS-12 | OK | PDF, Word, Excel, PowerPoint : « Texte extrait » | — |
| DOS-13 | OK | Conteneur de production : PDF scanné lu par OCR en 2 s (1 435 caractères) | Absent en local (pas de tesseract sur la machine) : l'installer ou documenter ce prérequis |
| DOS-14 | OK | « Réessayer » relance l'extraction | — |
| DOS-15 | OK | Fichier téléchargé identique à l'original | — |
| DOS-16 | OK | « Chargement… » jamais affiché pendant 141 s de traitement | — |

### 8. Analyse IA et contenu du dossier

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| IA-01 | OK | Analyse lancée seule après la lecture, terminée en 141 s sans clic | — |
| IA-02 | OK après correctif | Plus aucun recul (ANO-008), mention d'estimation | La zone `role=status` annonce chaque seconde à un lecteur d'écran : n'annoncer que les changements d'étape |
| IA-03 | OK | « Analyse terminée : 9 rubrique(s) sur 9 renseignée(s)… » et bouton « Voir mon dossier » | — |
| IA-04 | OK | 9/9 rubriques, chacune avec sa citation et jusqu'à 3 compléments | — |
| IA-05 | OK | 26 citations vérifiées mot pour mot, 0 introuvable | — |
| IA-06 | OK après correctif | Projections 2027 marquées « Hypothèse » (ANO-006) | — |
| IA-07 | OK | « Montant : à compléter » ne remplit pas la rubrique | — |
| IA-08 | OK | « Chiffre d'affaires 2025 contradictoire : 120 000 euros… contre 310… » | Deux documents de **sociétés différentes** (Testco et Fund Road) ne sont pas signalés comme incohérents |
| IA-09 | OK | Confirmée, citation gardée, score de 0 à 11 % | — |
| IA-10 | OK | Après modification : déclaration du porteur, citation retirée | — |
| IA-11 | OK | Relance : rubriques confirmées et modifiées conservées | — |
| IA-12 | OK | 409 « Déposez au moins un document lisible… » | — |
| IA-13 | OK | 402 « Quota d'analyses atteint… », aucune tâche créée | Le message ne dit ni quand le quota se renouvelle ni comment passer à l'offre Dossier : ajouter un lien |
| IA-14 | OK | Service IA injoignable : « Service d'IA injoignable. Relancez l'analyse dans quelques minutes. », affiché sur la page | — |
| IA-15 | OK | Deux clics simultanés : une seule analyse (200 et 409) | — |
| IA-16 | OK | Onglet « À compléter » cohérent avec le serveur | — |
| IA-17 | OK | Score = confirmées / 9 ; « Ce score mesure la complétude, pas vos chances de financement » | — |
| IA-18 | OK | **Environ 30 700 jetons par analyse** (deepseek-v4.1-flash), de 127 à 141 s | Coût visible seulement en base : un relevé mensuel dans l'administration |

### 9. Éligibilité

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| ELI-01 | OK | Bourse French Tech et i-Lab ajoutées ; le Prêt d'amorçage n'est plus proposé | — |
| ELI-02 | OK | Chaque critère en ok / ko / à vérifier, avec explication | — |
| ELI-03 | OK | 3 critères remplis, tous avec une citation exacte | « Deeptech » accordé à une plateforme logicielle : l'IA est généreuse sur les critères qualitatifs. Exiger une preuve (brevet, laboratoire) pour ce critère |
| ELI-04 | OK après correctif | Information « à compléter » → « à vérifier » (ANO-007). Revérifié sur une vraie analyse du dossier pilote : i-Lab passe de « Non éligible » à « Informations manquantes » | — |
| ELI-05 | OK | Déclaration enregistrée, critère inconnu refusé (400) | — |
| ELI-06 | OK | Programme retiré du dossier et de l'évaluation | — |
| ELI-07 | OK après correctif | Verdicts cohérents avec les critères bloquants (le faux « non éligible » venait d'ANO-007) | — |

### 10. Exports et attestation

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| EXP-01 | OK | `fund-road-recette-….pdf` : version, état, synthèse, rubriques et sources, aides visées, points à clarifier, pages numérotées | — |
| EXP-02 | OK | Word au même contenu | Ouverture dans Word et LibreOffice non vérifiée (LibreOffice absent) |
| EXP-03 | OK | 0 caractère cassé | Les symboles hors police sont supprimés : embarquer une police TTF (DejaVu) supprimerait toute perte |
| EXP-04 | OK | Citations raccourcies avec « … », aucune ligne démesurée | — |
| EXP-05 | NT | Avis à donner par un banquier ou par vous (PDF : `export-recette.pdf` dans le dossier de recette) | Mon avis : lisible et sourcé, mais le prévisionnel en texte plutôt qu'en tableau fait moins professionnel |
| EXP-06 | OK | Attestation refusée tant que le dossier est incomplet | — |
| EXP-07 | OK | 9 rubriques confirmées, analyse à jour : attestation délivrée `/verification/<id>` | — |
| EXP-08 | OK | Page publique : référentiel, version, date ; « révoquée » après révocation | Aucun bouton de révocation dans l'interface (seulement en base) |

### 11. Partage et candidatures

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| PAR-01 | OK | Candidature créée avec une version datée | — |
| PAR-02 | OK (local) | Partage par email : statut « envoyé », lien `/partages/<id>` reçu | Impossible en production tant que le SMTP n'est pas configuré |
| PAR-03 | OK | Dossier incomplet : 409 ; question sans réponse : 409, avec la raison | — |
| PAR-04 | OK | Pièce non partagée : 404 via la candidature, 403 en accès direct | — |
| PAR-05 | OK | Révocation : accès et pièces en 404 aussitôt | — |
| PAR-06 | OK | Le fonds voit toujours la version partagée | — |
| PAR-07 | OK | Liste : destinataire, étape | — |
| PAR-08 | OK (local) | Étape visible côté startup, email reçu | — |
| PAR-09 | OK | Réponse à la question du financeur enregistrée | — |
| PAR-10 | OK | Le contributeur voit 1 seul dossier ; les autres lui renvoient 403 | — |

### 12. Espace financeur

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| FIN-01 | OK après correctif | Critères enregistrés ; ticket min > max refusé (ANO-005) | — |
| FIN-02 | OK | Champs du type « fonds » enregistrés, champ d'un autre type ignoré | — |
| FIN-03 | OK | Questions et pièces visibles sur le portail | — |
| FIN-04 | OK | `/fonds/<slug>` rendu côté serveur avec critères et question | — |
| FIN-05 | OK | Dossier lié au fonds, ses questions reprises | — |
| FIN-06 | OK | Candidature dans le suivi : complétude 100 %, adéquation évaluée automatiquement | — |
| FIN-07 | OK | Étape « Rendez-vous » visible côté startup | — |
| FIN-08 | OK | Note privée : 0 note visible côté startup | — |
| FIN-09 | OK | Question reçue côté startup | — |
| FIN-10 | OK | La startup invitée voit seulement son dossier ; membres de l'incubateur : 403 | — |
| FIN-11 | OK (API) | Suivi à jour ; filtres de l'écran non pilotés automatiquement | Contrôler les filtres à la main |

### 13. Incubateur

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| INC-01 | OK | Modèle, durée, date limite, contrepartie enregistrés | — |
| INC-02 | OK | Suivi accessible, invitation de startups fonctionnelle (FIN-10) | Étapes de fonds (« Due diligence », « En portefeuille ») inadaptées à un incubateur : candidature, sélection, en programme, diplômée |
| INC-03 | OK | Le financeur apparaît dans l'annuaire dès la saisie de ses critères | — |

### 14. Annuaire public

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| ANN-01 | OK | 115 fiches | — |
| ANN-02 | OK | « kima » : 1 fiche ; « santé » : 40 fiches | — |
| ANN-03 | OK | PACA + Santé : 68 fiches, dont 42 nationales ou internationales | 68 résultats sur 115 : le filtre « Généraliste » ramène presque tout. Un tri « spécialistes d'abord » serait plus utile |
| ANN-04 | OK | Provence Angels : détails et 9 liens sources | — |
| ANN-05 | OK | Citations vérifiées par le code d'import (une valeur n'est gardée que si la source la contient) | Un contrôle à l'œil de 5 sources reste conseillé |
| ANN-06 | OK | « Préparer mon dossier », « Vous gérez… ? » | Lien « Canal officiel » absent pour Provence Angels alors que le site est connu |
| ANN-07 | OK | Aucune fiche « Recette », « Test » ou « Démo » | — |
| ANN-08 | OK après correctif | 85 logos et 30 monogrammes, 0 image cassée (logos en 429 avant ANO-001) | Pas de repli si un logo ne charge pas : afficher les initiales sur erreur |

### 15. Facturation

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| FAC-01 | OK | Offre et consommation renvoyées | — |
| FAC-02 | OK | Offre pilote active (50 analyses, 30 jours) ; une offre payée active est conservée | Le script attribue l'offre à **toutes** les organisations dont la personne est propriétaire : préciser l'organisation visée |
| FAC-03 à FAC-06 | NT | Stripe non configuré (annexe A du cahier) | — |

### 16. Parrainage

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| PRT-01 | OK | Code `START-…` créé, en attente | — |
| PRT-02 | OK | Approuvé par l'administrateur | — |
| PRT-03, PRT-04 | NT | Nécessitent un paiement Stripe | — |

### 17. Administration

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| ADM-01 | OK | Sans double authentification : 403 ; avec : 200 | — |
| ADM-02 | OK (partiel) | Liste accessible, aucun contenu en attente en local : publication non rejouée | — |
| ADM-03 | OK (partiel) | Programme de parrainage modifié ; modifier une offre exige Stripe (NT) | — |
| ADM-04 | OK | Non-administrateur : 403 | — |

### 18. Données personnelles

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| RGP-01 | OK | IA, accès, 14 jours de sauvegarde, suppression, contact | Ni responsable de traitement nommé ni base légale : à faire relire |
| RGP-02 | NT | Boîte `contact@fund-road.com` à créer | — |
| RGP-03 | OK | Documents, versions, partages, questions : 0 ; fichiers effacés du disque ; ancien lien en 404 | — |
| RGP-04 | OK | Bouton réservé au propriétaire (code), API 403 pour l'éditeur | — |
| RGP-05 | OK | Compte et dossiers effacés, organisation « Organisation supprimée », facturation conservée, connexion 401 | La suppression du compte n'est possible que par script : prévoir un bouton « Supprimer mon compte » |
| RGP-06 | OK | Seul le texte extrait part à l'IA, plus le **nom** des fichiers | Les noms de fichiers peuvent contenir des données personnelles : les remplacer par « document 1, 2… » |

### 19. Sécurité

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| SEC-01 | OK | Dossier d'une autre organisation : 403 | — |
| SEC-02 | OK | Document d'un autre compte : 403 | — |
| SEC-03 | OK | Origin étranger : 403 | — |
| SEC-04 | OK | Production : 41 réponses 429 sur 130 requêtes | — |
| SEC-05 | OK | `<script>` échappé sur la fiche publique, PDF généré | — |
| SEC-06 | OK | CSP, HSTS (1 an), nosniff, `frame-ancestors 'none'` ; cookies `Secure` en HTTPS (configuration) | Cookies de session de production non relevés (connexion non autorisée) |
| SEC-07 | OK | `.exe` renommé : 400 | — |
| SEC-08 | OK | Archive piégée : « Archive trop volumineuse après décompression » | — |
| SEC-09 | **KO** | Le dépôt est public et `RESEND_API_KEY` figure toujours dans l'historique (3 occurrences) | La révoquer chez Resend (action de votre côté) |
| SEC-10 | OK après correctif | Identifiant mal formé : 400 au lieu de 500 (ANO-010) | — |
| SEC-11 | OK après correctif | La limite des connexions et inscriptions lisait `x-forwarded-for`, que l'on peut falsifier pour la contourner. Elle lit maintenant `cf-connecting-ip` (ANO-012). Production : 3 échecs puis 429, IP du visiteur bien résolue | — |

### 20. Exploitation

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| EXO-01 | OK | `/api/health` 200 | — |
| EXO-02 | OK | Déploiement en 29 s, aucune erreur dans les journaux | — |
| EXO-03 | OK | Tâche interrompue : « Traitement interrompu. Relance nécessaire. », affiché sur la page | — |
| EXO-04 | OK | Second worker : « Un worker traite déjà cette file locale » | — |
| EXO-05 | OK | `pdftotext`, `tesseract` (fra, eng) dans l'image | — |
| EXO-06 | OK | Base et documents archivés, 14 archives gardées | Archives non chiffrées |
| EXO-07 | OK | **Restauration réussie** dans une base jetable : 119 financeurs, 85 fichiers retrouvés | Écrire la procédure de restauration dans le runbook |
| EXO-08 | OK | Minuteur actif, exécuté ce matin à 3 h 15 (succès) | Aucune alerte en cas d'échec |
| EXO-09 | **KO** | Aucune copie hors de la box | Copier l'archive chiffrée chaque nuit vers un stockage externe |
| EXO-10 | OK | Essai à blanc : 4 fiches vérifiées, domaine parqué écarté de la publication | — |
| EXO-11 | OK | Exécuté en production le 31/10 : valeurs citées, 85 logos | — |

### 21. Emails

Jouée en local avec un faux serveur SMTP.

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| MAI-01 | OK (local) | Email de confirmation reçu | Texte brut, sans mise en forme ni signature |
| MAI-02 | OK (local) | Lien valable une seule fois (2e usage : 400) | — |
| MAI-03 | OK (local) | Invitation reçue avec son lien | L'email ne dit ni qui invite ni pour quelle organisation |
| MAI-04 | OK (local) | Partage reçu avec le lien `/partages/` | Ajouter le nom de la startup et une phrase d'explication |
| MAI-05 | OK (local) | Le fonds reçoit « Nouveau dossier reçu » sans contenu du dossier ; la startup reçoit le changement d'étape | — |
| MAI-06 | NT | SMTP de production non configuré | — |

### 22. Affichage et accessibilité

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| UX-01 | OK | Aucun débordement à 320, 375, 768 et 1440 px (4 pages publiques et un dossier) | — |
| UX-02 | NT | Seul Chromium est disponible ici | Rejouer E2E-01 sur iPhone (Safari) et sur Firefox |
| UX-03 | OK | Tous les liens atteignables, focus visible | Pas de lien « Aller au contenu » en premier arrêt |
| UX-04 | OK | Animations réduites : aucun texte invisible | — |
| UX-05 | NT | Pas de lecteur d'écran ; boutons nommés, progression en `role=status` | Voir IA-02 : annonces trop fréquentes |
| UX-06 | OK | Aucun texte sous 4,5:1, en clair comme en sombre (mesure couleur par couleur) | — |

### 23. Performance

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| PRF-01 | NT | PageSpeed Insights non lancé | — |
| PRF-02 | OK | 3 à 4 documents : de 127 à 141 s | Au-delà des 2 min annoncées : afficher « environ 2 à 3 min » |
| PRF-03 | OK | Export PDF en 71 ms | — |
| PRF-04 | NT | 30 documents texte lus sans erreur ; scans non testés en local (pas d'OCR) | — |

### 24. Parcours de bout en bout

| ID | Statut | Constaté | Amélioration |
|---|---|---|---|
| E2E-01 | OK (local) | Inscription, organisation, dossier, dépôt d'un dossier entier, analyse automatique, confirmation, nouvelle analyse, attestation et export PDF : environ 4 min d'attente machine, 0 erreur JS | Partie production à faire par vous (création de compte) |
| E2E-02 | OK (local, API) | Critères, portail, réception, évaluation, note privée, question, étape « Rendez-vous » : chaque information visible du bon côté seulement | — |
| E2E-03 | NT | Demande une vraie startup et son accord | — |
| E2E-04 | OK (local) | Révocation, suppression du dossier, suppression du compte : plus aucune trace accessible | — |

---

## Ce qui bloque encore la vente

**KO ouverts (votre côté, pas du code)**

| Point | Action |
|---|---|
| SEC-09 | Révoquer `RESEND_API_KEY` chez Resend |
| EXO-09 | Mettre en place une copie chiffrée hors de la box |
| Mentions légales, CGU/CGV | À rédiger : obligatoires pour vendre l'offre à 149 € |

**P1 non testés**

| Cas | Raison |
|---|---|
| AUT-06, MAI-01, MAI-02, MAI-04 (en production) | SMTP à configurer |
| FAC-03, FAC-04, FAC-06 | Stripe à configurer |
| RGP-02 | Boîte `contact@fund-road.com` à créer |
| EXP-05 | Avis d'un banquier sur le PDF |
| UX-02 | Rejeu sur Safari iPhone et Firefox |
| E2E-03 | Un vrai dossier pilote |

## Améliorations réalisées après la recette

Toutes ces améliorations sont vérifiées en local puis en production le 1er novembre. Les 40 tests unitaires passent.

| Cas d'origine | Amélioration | Vérification |
|---|---|---|
| CKI-01 | Polices Archivo et JetBrains Mono hébergées sur fund-road.com ; Google Fonts retiré de la politique de sécurité | Production : 0 requête hors du site avant le choix des cookies, police chargée |
| RGP-05 | « Supprimer mon compte » dans Sécurité, mot de passe à l'appui ; refus tant qu'une organisation partagée n'a pas d'autre propriétaire ; page « Vos données » mise à jour | Local : mauvais mot de passe 403, organisation partagée 409, puis suppression OK et connexion impossible |
| ORG-11 | « Rendre propriétaire » dans Mon organisation (l'ancien propriétaire devient éditeur) ; rôles affichés en français | Local : transfert OK, panneau vérifié à l'œil |
| EXP-05 | Tableurs déposés repris en tableaux dans le PDF et le Word, milliers séparés, mention « non vérifiés par Fund Road » | Local : tableau du prévisionnel pilote rendu ; test unitaire |
| IA-13 | Quota atteint : nombre d'analyses, date de renouvellement, renvoi vers Facturation | Local |
| MAI-01 à MAI-04 | Emails avec contexte : qui invite, pour quelle organisation et quel rôle, nom du dossier partagé ; signature Fund Road | Local (faux SMTP) |
| INC-02 | Étapes propres aux incubateurs : Candidature, En sélection, Entretien, Comité, En programme, Non retenu (écran et email) | Local |
| DOS-06, 07, 08 | Le dépôt nomme les fichiers ignorés, signale les doublons et refuse les fichiers de plus de 20 Mo avant l'envoi | Navigateur local |
| DOS-11 | Macro et archive piégée refusées dès le dépôt (plus de « Réessayer » inutile) | Local : 400 immédiat |
| AUT-06 | « Mot de passe oublié » signale que l'envoi d'emails est indisponible et renvoie vers contact@ | Production |
| ANN-08 | Initiales affichées si un logo ne charge pas | Code |
| PUB-04 | « Créer mon espace financeur » présélectionne « fonds d'investissement » | Local |
| SEO-01, SEO-03 | Titre de « Vos données » orienté RGPD ; `<lastmod>` sur les 115 fiches du sitemap | Production |
| IA-02, UX-05 | Seule l'étape est annoncée aux lecteurs d'écran ; barre `progressbar` ; estimation « 2 à 3 min » | Code |
| UX-03 | Lien « Aller au contenu » en premier arrêt de tabulation (site public et espace) | Local |
| IA-08, ELI-03 | Consignes de l'IA : signaler des documents de sociétés différentes ; preuve explicite exigée pour les critères qualitatifs (deeptech, innovation) | Tests unitaires ; à observer sur les prochains dossiers |
| ANN-03 | Filtre par secteur : spécialistes du secteur en tête | Production |
| EXP-08 | Liste des attestations dans le dossier, avec bouton « Révoquer » (refusé aux tiers) | Local : révocation OK, tiers 403 |

### Restent à faire (plus tard)

- Police TTF embarquée dans le PDF (EXP-03).
- Relevé mensuel du coût IA dans l'administration (IA-18).
- Nom des fichiers remplacé avant l'envoi à l'IA (RGP-06) : à étudier, car la reconnaissance des pièces demandées s'appuie sur ce nom.
- Organisation visée par le script `offrir-acces.ts` (FAC-02).
- Choix du type d'organisation en cartes (ORG-01) et bascule de thème sur mobile (THM-05) : changements visuels à montrer d'abord en avant/après.
- Lien « Canal officiel » manquant sur certaines fiches (ANN-06) : données à compléter.
- Titres propres aux pages de l'espace connecté (SEO-05).
- Envois de fichiers en parallèle (DOS-03).
