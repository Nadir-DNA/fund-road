# Cahier de recette Fund Road

Version du 1er novembre 2026, établie à partir du code (branche `refonte/v2-pret-vente`, commit `578fb03`) : toutes les pages, routes d'API, traitements de fond et scripts d'exploitation y sont couverts.

## Mode d'emploi

- **Priorité** : P1 = bloquant pour vendre ou risque de données ; P2 = parcours important ; P3 = confort et finition.
- **Environnement** : `L` = local (`npm run dev:local`, base de test) ; `P` = production (fund-road.com). Tout ce qui crée des comptes, paie ou supprime se joue d'abord en `L`.
- **Statut** : noter `OK`, `KO` (avec n° d'anomalie, voir annexe B) ou `NT` (non testé, avec la raison).
- Pour chaque cas : faire l'action décrite, comparer au résultat attendu, noter le statut. Un cas `KO` P1 bloque la mise en vente.

### Comptes de test à préparer

| Rôle | Compte | Usage |
|---|---|---|
| Startup propriétaire | `startup@…` | parcours dossier complet |
| Startup éditeur invité | `editeur@…` | droits d'écriture sans être propriétaire |
| Startup relecteur invité | `relecteur@…` | lecture seule |
| Contributeur d'un seul dossier | `contributeur@…` | accès limité à un dossier |
| Fonds | `fonds@…` (organisation de type Fonds) | portail, réception, pipeline |
| Business angel / réseau | `ba@…` | portail selon le type |
| Incubateur | `incubateur@…` | suivi des startups |
| Administrateur | adresse listée dans `ADMIN_EMAILS`, double authentification activée | administration |
| Visiteur | navigation privée, non connecté | site public |

### Jeux de documents

- Dossier pilote : `.local/pilote-fundroad/` (business plan Word, pitch PDF, prévisionnel Excel).
- À constituer : un PDF **scanné** (image seule), un PowerPoint, un fichier de plus de 20 Mo, un PDF corrompu (renommé depuis un .txt), un Word contenant une macro ou un objet incorporé, un fichier `.txt`, 31 petits PDF, un dossier avec un sous-dossier.

---

## 1. Site public

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| PUB-01 | Ouvrir l'accueil `/` | Titre animé mot à mot, coup de pinceau, route et voiture qui avancent au défilement, capture du produit, aucune section vide en défilant vite | P1 | P |
| PUB-02 | Défiler l'accueil jusqu'en bas puis remonter | Toutes les sections visibles (parcours, fonctionnalités, financeurs, FAQ, appel final), pas de saut de page | P1 | P |
| PUB-03 | Cliquer « Voir comment ça marche » | Défilement doux jusqu'au parcours | P3 | P |
| PUB-04 | Page `/financeurs` | Contenu financeurs, captures, FAQ, bouton « Créer mon espace financeur » vers l'inscription | P2 | P |
| PUB-05 | Pages `/entrepreneurs`, `/referentiel`, `/marque-blanche`, `/partenaires`, `/confiance`, `/ressources` | Chaque page s'affiche, sans « Chargement… » bloqué ni erreur | P2 | P |
| PUB-06 | Page `/tarifs` | Trois offres (Découverte 0 €, Dossier 149 € HT / 90 j, Financeurs gratuit), mention « aucune commission » | P1 | P |
| PUB-07 | Changer de page depuis le milieu d'une page longue | La nouvelle page s'ouvre en haut | P2 | P |
| PUB-08 | Liens du pied de page (Produit, Ressources, « Gérer les cookies ») | Tous mènent à une page existante | P2 | P |
| PUB-09 | Adresse inexistante `/xyz` | Page « introuvable », code HTTP 404 | P2 | P |
| PUB-10 | Menu mobile (largeur 375 px) | Le bouton menu ouvre et ferme la navigation, les liens fonctionnent | P2 | P |
| PUB-11 | Orthographe de la marque sur toutes les pages, emails et PDF | Toujours « Fund Road » | P3 | P |
| PUB-12 | Promesses publiques (accueil, tarifs, descriptions Google) | Aucune promesse de financement ni « vérifie l'éligibilité » ; mention « ne garantit pas un financement » en pied de page | P1 | P |

## 2. Thème clair / sombre

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| THM-01 | Appareil réglé en sombre, aucun choix enregistré | Le site s'ouvre en sombre (bleu nuit de la route) | P2 | P |
| THM-02 | Cliquer l'icône lune / soleil (site public puis espace connecté) | Bascule immédiate, icône inversée | P2 | P |
| THM-03 | Recharger après avoir choisi | Le choix est conservé, pas de flash blanc au chargement | P2 | P |
| THM-04 | Parcourir accueil, annuaire, fiche, tableau de bord, dossier en sombre | Textes lisibles, logo clair, aucune zone blanche oubliée | P2 | P |
| THM-05 | Mobile 375 px | Le bouton de bascule est masqué, le thème suit le téléphone | P3 | P |

## 3. Cookies et mesure d'audience

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| CKI-01 | Première visite | Bannière avec « Refuser » et « Accepter » de même poids ; aucune requête vers Google avant le choix | P1 | P |
| CKI-02 | Refuser | Bannière fermée, aucune requête Google, choix mémorisé | P1 | P |
| CKI-03 | Accepter | Requêtes vers googletagmanager.com et google-analytics.com ; la visite apparaît dans Google Analytics → Temps réel | P2 | P |
| CKI-04 | « Gérer les cookies » en pied de page | La bannière revient, les cookies `_ga` sont supprimés | P2 | P |
| CKI-05 | Site en local (`127.0.0.1`) | Même en acceptant, aucune mesure n'est envoyée | P3 | L |

## 4. Référencement (SEO / GEO)

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| SEO-01 | Source HTML (sans JavaScript) de `/`, `/tarifs`, `/annuaire`, `/fonds/kima-ventures` | Titre ≤ 60 caractères, description ≤ 160, canonique en `https://fund-road.com/…`, contenu lisible dans le HTML | P1 | P |
| SEO-02 | `http://fund-road.com` et `https://www.fund-road.com` | Redirection 301 vers `https://fund-road.com` | P1 | P |
| SEO-03 | `/sitemap.xml` | Pages publiques et toutes les fiches `/fonds/…` publiées ; aucune page privée | P1 | P |
| SEO-04 | `/robots.txt` et `/llms.txt` | Accessibles, référencent le sitemap ; llms.txt liste les fiches | P2 | P |
| SEO-05 | `/app/…`, `/connexion` | Balise `noindex` | P2 | P |
| SEO-06 | Données structurées (Rich Results Test de Google) sur accueil, tarifs, fiche | Organization, SoftwareApplication, FAQPage, ProfilePage, fil d'Ariane valides | P2 | P |
| SEO-07 | Ancien chemin `/portail/<slug>` | Redirection 301 vers `/fonds/<slug>` | P3 | P |
| SEO-08 | Search Console → Pages et Sitemaps | Sitemap lu sans erreur, pages en cours d'indexation | P2 | P |

## 5. Comptes et authentification

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| AUT-01 | Inscription avec mot de passe de 11 caractères | Refus : 12 caractères minimum | P1 | P |
| AUT-02 | Inscription valide | Compte créé, accès à l'espace (confirmation d'email désactivée tant que l'envoi d'emails n'est pas configuré) | P1 | P |
| AUT-03 | Inscription avec une adresse déjà utilisée | Refus explicite, pas de second compte | P1 | P |
| AUT-04 | Connexion avec mauvais mot de passe | Refus sans indiquer si l'adresse existe | P1 | P |
| AUT-05 | Connexion / déconnexion | Accès puis retour au site public ; `/app` redirige vers la connexion après déconnexion | P1 | P |
| AUT-06 | Mot de passe oublié | Email de réinitialisation (nécessite SMTP : `NT` tant qu'il n'est pas configuré) | P1 | L |
| AUT-07 | Activer la double authentification (Sécurité) | QR code, validation par code, codes de secours affichés | P2 | P |
| AUT-08 | Se reconnecter avec double authentification | Code demandé, refus d'un code faux, accès avec le bon | P2 | P |
| AUT-09 | Désactiver la double authentification | Demande le mot de passe ou un code, puis désactive | P3 | P |
| AUT-10 | Ouvrir l'application deux onglets, se déconnecter dans l'un | L'autre redemande la connexion à la prochaine action | P3 | P |

## 6. Organisations, membres et rôles

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| ORG-01 | Premier accès après inscription | Choix du type (startup, fonds, BA, réseau, incubateur, organisme) et création de l'organisation | P1 | P |
| ORG-02 | Créer une deuxième organisation puis basculer avec le sélecteur | Le contenu affiché change d'organisation ; le choix est mémorisé | P2 | L |
| ORG-03 | Mon organisation : nom, couleur, présentation | Enregistré, visible sur le portail | P2 | P |
| ORG-04 | Logo PNG / JPEG / WebP < 1 Mo | Accepté et affiché | P2 | P |
| ORG-05 | Logo SVG, GIF, fichier renommé en .png, > 1 Mo | Refus avec message clair | P1 | L |
| ORG-06 | Inviter un membre « Éditeur » puis « Relecteur » | Lien d'invitation valable 7 jours ; l'invité rejoint avec le bon rôle | P2 | L |
| ORG-07 | Invitation expirée ou déjà utilisée | Refus explicite | P2 | L |
| ORG-08 | Relecteur : tenter de modifier une rubrique, déposer, analyser | Refus (lecture seule) | P1 | L |
| ORG-09 | Éditeur : tenter de supprimer un dossier ou de modifier l'organisation | Refus (réservé au propriétaire) | P1 | L |
| ORG-10 | Propriétaire retire un membre | Le membre perd l'accès immédiatement | P2 | L |
| ORG-11 | Tenter de retirer le propriétaire | Impossible | P2 | L |

## 7. Dossier startup : création et dépôt

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| DOS-01 | « Nouveau dossier » (levée puis subvention) | Ouverture directe du dossier sur la Vue d'ensemble, zone de dépôt en tête | P1 | P |
| DOS-02 | Dossier neuf : bouton « Analyser mes documents » | Inactif tant qu'aucun document n'est lisible | P1 | P |
| DOS-03 | Glisser-déposer plusieurs fichiers d'un coup | Tous envoyés, progression « Envoi 1/3… » | P1 | P |
| DOS-04 | Glisser-déposer un **dossier** contenant un sous-dossier | Tous les fichiers pris en charge sont envoyés, y compris ceux du sous-dossier | P1 | P |
| DOS-05 | « Choisir un dossier » | Même résultat que DOS-04 | P2 | P |
| DOS-06 | Dépôt contenant un `.txt` et un fichier caché | Ignorés et signalés (« x fichier(s) ignoré(s) ») | P2 | P |
| DOS-07 | Déposer deux fois le même fichier | Pas de doublon | P2 | P |
| DOS-08 | Fichier > 20 Mo | Refus explicite, les autres fichiers du lot passent | P2 | L |
| DOS-09 | 31e document | Refus « limite de 30 documents » | P3 | L |
| DOS-10 | PDF corrompu (faux PDF) | Refus « le contenu ne correspond pas au format » | P2 | L |
| DOS-11 | Word avec macro ou objet incorporé | Refus « contenu actif » | P1 | L |
| DOS-12 | PDF texte, Word, PowerPoint, Excel | Statut « Texte extrait » pour chacun | P1 | P |
| DOS-13 | PDF **scanné** (image seule) | Texte reconnu par OCR, statut « Texte extrait » | P1 | P |
| DOS-14 | Extraction en échec | Statut « à reprendre » et bouton « Réessayer » qui relance | P2 | L |
| DOS-15 | Télécharger un document déposé | Fichier identique à l'original | P2 | P |
| DOS-16 | Pendant tout le traitement | La page ne clignote pas sur « Chargement… » | P1 | P |

## 8. Analyse IA et contenu du dossier

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| IA-01 | Fin de lecture des documents déposés | L'analyse se lance seule, sans clic | P1 | P |
| IA-02 | Pendant l'analyse | Barre de progression en %, mention « estimation, environ 2 min », jamais de recul du pourcentage | P1 | P |
| IA-03 | Fin d'analyse | « Analyse terminée : n rubriques sur 9 renseignées… » et bouton « Voir mon dossier » | P1 | P |
| IA-04 | Mon dossier : chaque rubrique renseignée | Valeur, citation exacte du document, éventuels compléments avec leur propre citation | P1 | P |
| IA-05 | Vérifier 5 citations au hasard dans les documents d'origine | Chaque citation y figure mot pour mot | P1 | P |
| IA-06 | Document contenant des projections | Classées « hypothèse », pas présentées comme des faits | P1 | P |
| IA-07 | Document disant « montant : à compléter » | La rubrique n'est pas comptée comme remplie | P1 | P |
| IA-08 | Deux documents contradictoires (deux chiffres d'affaires différents) | Contradiction listée dans « Points à clarifier » | P1 | L |
| IA-09 | Confirmer une rubrique sans la modifier | Statut « Confirmé », le score augmente | P1 | P |
| IA-10 | Modifier puis confirmer une rubrique | Devient une déclaration du porteur, la citation disparaît | P2 | P |
| IA-11 | Relancer l'analyse après confirmation | Les rubriques confirmées ne sont pas écrasées | P1 | P |
| IA-12 | Lancer l'analyse sans document lisible (via l'API) | Refus « Déposez au moins un document lisible » | P2 | L |
| IA-13 | Quota atteint (offre Découverte : 1 analyse par mois en production) | Refus « Quota d'analyses atteint », pas de tâche créée | P1 | L |
| IA-14 | IA indisponible ou trop lente (clé invalide en local) | Message en français affiché sur la page, possibilité de relancer | P2 | L |
| IA-15 | Deux clics rapides sur « Analyser » | Une seule analyse lancée | P2 | P |
| IA-16 | Onglet « À compléter » | Liste des rubriques manquantes avec leur question ; le compteur correspond | P2 | P |
| IA-17 | Score (Vue d'ensemble) | Pourcentage = rubriques confirmées / 9 ; mention « ne mesure pas vos chances de financement » | P1 | P |
| IA-18 | Coût : relever les jetons de l'analyse (table `usage`) | Noter le coût réel par dossier | P1 | P |

## 9. Éligibilité aux aides et aux financeurs

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| ELI-01 | Ajouter la Bourse French Tech, i-Lab, un financeur inscrit | Ajoutés au dossier ; le Prêt d'amorçage n'est plus proposé | P1 | P |
| ELI-02 | Après analyse | Chaque critère « Rempli », « Non rempli » ou « À vérifier », avec explication | P1 | P |
| ELI-03 | Critère rempli | Accompagné d'une citation présente dans les documents | P1 | P |
| ELI-04 | Information absente des documents | Le critère reste « À vérifier », jamais « Rempli » | P1 | P |
| ELI-05 | Déclaration du porteur sur un critère | Enregistrée et prise en compte à la prochaine analyse | P2 | P |
| ELI-06 | Retirer un programme | Disparaît du dossier et de l'export | P3 | P |
| ELI-07 | Verdict global | Cohérent : un critère bloquant non rempli donne « Non éligible en l'état » | P2 | L |

## 10. Exports et attestation

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| EXP-01 | Export PDF | Fichier au nom du dossier ; logo, version, date ; état (confirmées / renseignées / à compléter) ; synthèse ; 9 rubriques avec source ; aides visées ; points à clarifier ; pied de page numéroté | P1 | P |
| EXP-02 | Export Word | Même contenu que le PDF, s'ouvre dans Word et LibreOffice | P1 | P |
| EXP-03 | Caractères spéciaux (« ≥ », guillemets, accents, €) | Aucun caractère cassé | P2 | P |
| EXP-04 | Citation très longue (tableur) | Raccourcie sur une ligne avec « … » | P3 | P |
| EXP-05 | Juger le PDF « présentable à une banque » | Avis noté par le testeur | P1 | P |
| EXP-06 | Attestation avec rubriques incomplètes | Bouton inactif | P1 | P |
| EXP-07 | Attestation avec 9 rubriques confirmées, sans contradiction, version analysée | Attestation délivrée, lien public `/verification/<id>` | P1 | L |
| EXP-08 | Page de vérification d'une attestation (non connecté) | Affiche le dossier, la version et la date ; « révoquée » si révoquée | P2 | L |

## 11. Partage et candidatures (côté startup)

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| PAR-01 | Onglet Partager : choisir un financeur inscrit, des pièces, un message | Candidature créée avec une version datée du dossier | P1 | L |
| PAR-02 | Partager à une adresse email (financeur non inscrit) | Candidature « préparée », lien `/partages/<id>` (email envoyé si SMTP) | P2 | L |
| PAR-03 | Partager un dossier incomplet ou avec questions du destinataire sans réponse | Refus explicite, bouton inactif avec la raison | P1 | L |
| PAR-04 | Destinataire : n'accède qu'aux pièces choisies | Une pièce non partagée est refusée (403) | P1 | L |
| PAR-05 | Révoquer un partage | Le destinataire perd l'accès immédiatement | P1 | L |
| PAR-06 | Modifier le dossier après partage | Le destinataire voit toujours la version datée partagée | P2 | L |
| PAR-07 | Candidatures (startup) | Liste dense : destinataire, date, étape suivie | P2 | L |
| PAR-08 | Le financeur change l'étape | L'étape est visible côté startup (notification si SMTP) | P2 | L |
| PAR-09 | Questions du financeur | Visibles dans « À compléter », la réponse est enregistrée | P2 | L |
| PAR-10 | Inviter un contributeur sur un seul dossier | Il voit ce dossier uniquement, pas les autres | P1 | L |

## 12. Espace financeur (fonds, business angel, réseau, organisme)

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| FIN-01 | Mon organisation : critères (secteurs, stades, zones en cases, tickets en euros) | Enregistrés ; ticket min > max refusé | P1 | L |
| FIN-02 | Champs propres au type (fonds : position dans le tour, réinvestit… ; BA : implication… ; organisme : montant max…) | Affichés selon le type, enregistrés | P2 | L |
| FIN-03 | Questions et pièces demandées | Enregistrées, visibles sur le portail public | P1 | L |
| FIN-04 | Portail public `/fonds/<slug>` | Logo, critères, détails, pièces, questions, bouton « Préparer ma candidature » | P1 | L |
| FIN-05 | Startup clique « Préparer ma candidature » depuis le portail | Nouveau dossier lié au financeur, ses critères et questions ajoutés | P1 | L |
| FIN-06 | Réception d'une candidature | Visible dans le suivi, avec complétude et adéquation évaluée automatiquement | P1 | L |
| FIN-07 | Faire avancer l'étape (nouveau, revue, rendez-vous, due diligence, portefeuille, refusé) | Enregistrée et visible côté startup | P2 | L |
| FIN-08 | Note privée | Visible par l'équipe du financeur, jamais par la startup | P1 | L |
| FIN-09 | Poser une question à la startup | Reçue côté startup | P2 | L |
| FIN-10 | Lien de candidature et invitation d'une startup | La startup crée son dossier sans voir le reste de l'organisation | P2 | L |
| FIN-11 | Suivi des startups : filtres et progression | Liste à jour, filtres opérants | P2 | L |

## 13. Incubateur

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| INC-01 | Créer une organisation incubateur | Champs propres (modèle, durée, date limite, contrepartie…) | P2 | L |
| INC-02 | Inviter et suivre des startups accompagnées | Complétude et étapes visibles | P2 | L |
| INC-03 | Portail public de l'incubateur | Affiché dans l'annuaire avec ses critères | P3 | L |

## 14. Annuaire public des financeurs

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| ANN-01 | `/annuaire` | 115 fiches, cartes sobres (logo, nom, ticket, zone, secteurs, stade) | P1 | P |
| ANN-02 | Recherche par nom, secteur, géographie | Résultats filtrés à la frappe | P2 | P |
| ANN-03 | Filtres type / secteur / stade / région combinés | Cohérents : un fonds « France entière » sort pour une région ; « Généraliste » sort pour tout secteur | P1 | P |
| ANN-04 | Fiche enrichie (ex. `/fonds/provence-angels`) | Détails du type, références, « D'où viennent ces informations » avec liens sources | P1 | P |
| ANN-05 | Vérifier 5 sources au hasard | La page source contient bien la citation | P1 | P |
| ANN-06 | Fiche non revendiquée | Bouton « Préparer mon dossier », lien « Canal officiel » si connu, « Vous gérez X ? » | P2 | P |
| ANN-07 | Aucune fiche « Recette » ou de démonstration en production | Aucune | P1 | P |
| ANN-08 | Logos | Affichés quand disponibles, initiales sur couleur unie sinon | P3 | P |

## 15. Facturation et offres

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| FAC-01 | Page Facturation (startup) | Offre active et quota restant affichés | P2 | P |
| FAC-02 | Script `offrir-acces.ts <email> [jours]` | Offre « Pilote offert » active, 50 analyses ; une offre payée active n'est pas remplacée | P1 | L |
| FAC-03 | Paiement de l'offre Dossier (Stripe en mode test, carte 4242…) | Retour à l'application, offre active, quota relevé | P1 | L |
| FAC-04 | Webhook Stripe (paiement, renouvellement, échec, annulation) | Statuts « active », « past_due », « cancelled » appliqués | P1 | L |
| FAC-05 | Portail client Stripe | S'ouvre pour l'organisation payante | P2 | L |
| FAC-06 | Événement Stripe rejoué deux fois | Traité une seule fois | P1 | L |

## 16. Parrainage et partenaires

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| PRT-01 | Recommandations : obtenir un code | Code créé, en attente d'approbation | P3 | L |
| PRT-02 | Administrateur approuve le code | Code actif | P3 | L |
| PRT-03 | Inscription avec `?code=…` puis achat | Attribution enregistrée, commission calculée après la période de rétention | P3 | L |
| PRT-04 | Remboursement après achat | Commission réduite d'autant | P3 | L |

## 17. Administration

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| ADM-01 | Accès administration sans double authentification | Refus « double authentification requise » | P1 | L |
| ADM-02 | Contenus importés : publier, rejeter, convertir en fiche financeur | Statut mis à jour, page publique créée | P3 | L |
| ADM-03 | Modifier une offre ou un programme | Pris en compte dans les tarifs et l'éligibilité | P3 | L |
| ADM-04 | Compte non administrateur appelle une route d'administration | 403 | P1 | L |

## 18. Données personnelles

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| RGP-01 | Page « Vos données » (`/confiance`) | Ce qui part à l'IA, qui voit le dossier, 14 jours de sauvegarde, suppression, contact `contact@fund-road.com` | P1 | P |
| RGP-02 | Écrire à `contact@fund-road.com` depuis l'extérieur | Message reçu | P1 | P |
| RGP-03 | Supprimer un dossier (propriétaire, avec confirmation) | Dossier, documents, versions et partages effacés ; fichiers absents du disque ; ancien lien de partage en erreur | P1 | L |
| RGP-04 | Supprimer un dossier en tant qu'éditeur | Bouton absent, API en 403 | P1 | L |
| RGP-05 | Script `supprimer-compte.ts <email> --confirmer` | Compte, dossiers et fichiers effacés ; organisation anonymisée ; facturation conservée ; connexion impossible | P1 | L |
| RGP-06 | Texte envoyé à l'IA | Uniquement le texte extrait, jamais les fichiers ; aucun appel IA sans analyse lancée ou partage | P2 | L |

## 19. Sécurité

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| SEC-01 | Ouvrir l'adresse d'un dossier d'une autre organisation | 403 ou 404, aucune donnée | P1 | L |
| SEC-02 | Télécharger le document d'un autre compte par son identifiant | Refus | P1 | L |
| SEC-03 | Requête d'écriture avec un en-tête Origin étranger | Refus | P1 | L |
| SEC-04 | Plus de 120 requêtes par minute depuis une même adresse | Limitation (429) | P2 | P |
| SEC-05 | Nom d'organisation ou de dossier `<script>alert(1)</script>` | Affiché comme du texte partout (pages, fiche publique, PDF) | P1 | L |
| SEC-06 | En-têtes HTTP | CSP présente, HTTPS seul, cookies de session `Secure` et `HttpOnly` | P1 | P |
| SEC-07 | Dépôt d'un fichier `.exe` renommé en `.pdf` | Refus | P1 | L |
| SEC-08 | Archive Office piégée (décompression massive) | Refus « archive trop volumineuse » | P2 | L |
| SEC-09 | Secrets | Clé Resend révoquée ; aucun secret dans le dépôt public | P1 | P |

## 20. Exploitation

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| EXO-01 | `curl http://127.0.0.1:3190/api/health` sur la box | 200 | P1 | P |
| EXO-02 | Déploiement (`docker compose … up -d --build api worker`) | Site disponible en moins de 2 minutes, migrations sans erreur | P1 | P |
| EXO-03 | Redémarrer le worker pendant une analyse | La tâche passe en échec « relance nécessaire », l'interface le signale | P2 | L |
| EXO-04 | Lancer un second worker | Refus « Un worker traite déjà cette file » | P3 | L |
| EXO-05 | Outils PDF et OCR dans l'image | `pdftotext` et `tesseract` présents | P1 | P |
| EXO-06 | Sauvegarde `scripts/backup-prod.sh` | Archive base + documents créée, plus ancienne que 14 jours supprimée | P1 | P |
| EXO-07 | **Restaurer** une sauvegarde sur un environnement de test | Données et documents retrouvés | P1 | L |
| EXO-08 | Sauvegarde de nuit (`install-backup-timer.sh`) | Exécutée chaque nuit à 3 h 15 | P2 | P |
| EXO-09 | Copie hors de la box | Existe et est récente | P1 | P |
| EXO-10 | Import financeurs (`import-financeurs.ts`, essai puis `--ecrire`) | Rapport : vérifiées, confirmées à la main, masquées, rejetées ; domaines parqués refusés | P2 | L |
| EXO-11 | Qualification (`qualifier-financeurs.ts --slug …`, `--logos-seulement`) | Valeurs gardées seulement avec citation, logos PNG/JPEG/WebP | P3 | L |

## 21. Emails (dès que l'envoi est configuré)

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| MAI-01 | Confirmation d'inscription | Reçue, lien valide | P1 | L |
| MAI-02 | Réinitialisation du mot de passe | Reçue, lien valide une seule fois | P1 | L |
| MAI-03 | Invitation d'un membre ou d'un contributeur | Reçue avec le lien d'invitation | P2 | L |
| MAI-04 | Partage d'un dossier à une adresse email | Reçu avec le lien `/partages/<id>` | P1 | L |
| MAI-05 | Notifications financeur (nouvelle candidature) et startup (changement d'étape, question) | Reçues, sans contenu sensible du dossier | P2 | L |
| MAI-06 | Délivrabilité (SPF, DKIM, DMARC) | Pas de classement en indésirable chez Gmail et Outlook | P2 | P |

## 22. Affichage, navigateurs et accessibilité

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| UX-01 | Largeurs 320, 375, 768, 1440 px sur accueil, annuaire, fiche, dossier | Aucun défilement horizontal, aucun texte coupé | P1 | P |
| UX-02 | Safari iPhone, Chrome Android, Firefox, Edge | Parcours dossier complet fonctionnel, y compris le dépôt (le dépôt de dossier entier peut varier selon le navigateur) | P1 | P |
| UX-03 | Navigation au clavier (Tab, Entrée, Échap) | Tous les boutons et champs atteignables, focus visible | P2 | P |
| UX-04 | Réglage « réduire les animations » | Pas d'animation, tout le contenu visible | P2 | P |
| UX-05 | Lecteur d'écran sur dépôt et progression | Progression annoncée, boutons nommés | P3 | P |
| UX-06 | Contrastes en clair et en sombre | Textes lisibles (ratio ≥ 4,5:1) | P2 | P |

## 23. Performance

| ID | Scénario | Résultat attendu | P | Env |
|---|---|---|---|---|
| PRF-01 | PageSpeed Insights sur l'accueil (mobile) | LCP < 2,5 s, CLS < 0,1 | P2 | P |
| PRF-02 | Durée d'analyse d'un dossier de 3 à 5 documents | 1 à 3 minutes | P1 | P |
| PRF-03 | Export PDF d'un dossier complet | Moins de 5 secondes | P3 | P |
| PRF-04 | Dossier de 30 documents dont plusieurs scannés | Lecture terminée sans erreur, durée notée | P2 | L |

## 24. Parcours de bout en bout (à dérouler d'une traite)

| ID | Parcours | Résultat attendu | P | Env |
|---|---|---|---|---|
| E2E-01 | **Startup** : inscription → organisation → nouveau dossier → dépôt d'un dossier entier → analyse automatique → confirmation des 9 rubriques → éligibilité BFT → export PDF → partage à un financeur inscrit → suivi de l'étape | Aucun blocage ; moins de 30 min d'intervention ; PDF présentable | P1 | L puis P |
| E2E-02 | **Financeur** : inscription → critères, questions, pièces → portail public → réception de la candidature d'E2E-01 → évaluation → note privée → question → étape « Rendez-vous » | Chaque action visible du bon côté seulement | P1 | L |
| E2E-03 | **Pilote réel** : dossier d'une vraie startup, avec son accord pour l'envoi à l'IA | Critères du pilote : faits cités, < 30 min de reprise, PDF jugé présentable par une banque, coût relevé | P1 | P |
| E2E-04 | **Fin de relation** : révocation du partage → suppression du dossier → demande de suppression du compte | Plus aucune trace accessible, facturation conservée | P1 | L |

---

## Annexe A. Points connus avant recette

Cas à noter `NT` ou `KO` d'office tant que le point n'est pas réglé :

- **Emails** (AUT-06, MAI-*, partie de PAR-02 et PAR-08) : envoi non configuré en production (`SMTP_URL` et `MAIL_FROM` vides).
- **Paiement** (FAC-03 à FAC-06) : compte, prix et webhook Stripe à configurer.
- **Clé Resend** (SEC-09) : présente dans l'historique du dépôt public, à révoquer.
- **`contact@fund-road.com`** (RGP-02) : boîte à créer chez OVH.
- **Sauvegardes** (EXO-08, EXO-09) : sauvegarde de nuit non activée, pas de copie hors de la box.
- **Mentions légales et CGU** : absentes du site.
- **Prévisionnel** dans l'export : repris en texte, pas en tableau.
- **Dépôt de dossier entier** : vérifié dans Chromium uniquement.

## Annexe B. Fiche d'anomalie

| Champ | Contenu |
|---|---|
| N° | ANO-001 |
| Cas de test | ex. DOS-04 |
| Environnement | Local / Production, navigateur et version, appareil |
| Étapes pour reproduire | 1. … 2. … 3. … |
| Résultat obtenu | … |
| Résultat attendu | … |
| Gravité | Bloquante / Majeure / Mineure |
| Pièces | Capture, heure précise (pour retrouver les journaux du serveur) |

## Annexe C. Synthèse de campagne

| Section | Cas | OK | KO | NT |
|---|---|---|---|---|
| 1 à 24 | … | … | … | … |
| **Total** | | | | |

Décision : la mise en vente est possible si tous les cas P1 sont `OK`, ou `NT` avec une justification acceptée.
