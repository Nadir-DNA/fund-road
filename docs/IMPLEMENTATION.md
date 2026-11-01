# Fund Road V2 — état vérifié au 14 octobre 2026

**Statut : pilote local fonctionnel, refonte complète encore en cours. Pas d’ouverture commerciale ni de déploiement public effectué.** Le plan produit dans les neuf notes Obsidian décrit la cible ; cette page décrit ce qui existe réellement.

## Fonctions livrées dans le code

- Nouvelle interface publique et espaces startup, BA, réseau, fonds et organisme de subvention ; navigation, onboarding organisation, dossiers, annuaire, candidatures, réglages et facturation.
- PostgreSQL local, authentification locale Better Auth, sessions, rôles propriétaire/éditeur/lecteur, invitations nominatives, double authentification et réinitialisation de mot de passe. Les emails nécessitent SMTP.
- Upload PDF/DOCX/PPTX/XLSX avec limites, empreinte de dédoublonnage, stockage local et file d’extraction. Reprise des extractions en échec. Un seul worker propriétaire de la file via verrou PostgreSQL.
- Analyse structurée via API compatible OpenAI : références documentaires et citations contrôlées, réponses confirmées préservées, hypothèses et absences d’information non comptées, conflits conservés. Appel réel validé sur une fixture AMES synthétique.
- Neuf rubriques communes, score déterministe de complétude, validation des faits, exports PDF/Word avec statut et citation source. L’attestation est liée à la révision analysée ; sa page publique ne révèle pas le dossier.
- Portail par organisation : nom, couleur, présentation, thèse et questions spécifiques. La création depuis un portail copie ses exigences dans le dossier ; les réponses se préparent avant envoi. Progression du destinataire distincte du score commun.
- Fonds pouvant créer un dossier et inviter une startup à le compléter, sans lui ouvrir les autres dossiers de son organisation.
- Partage nominatif d’une version datée, sélection des pièces, contrôle des téléchargements, révocation, notes privées du fonds, questions/réponses propres à la candidature.
- Socle de facturation Stripe et programmes startup/fonds/BA distincts. Les codes et récompenses appartiennent à l’organisation. **Offres et programmes inactifs : intégration financière non réceptionnée.**
- Sauvegarde AES-256-GCM de PostgreSQL et des pièces, vérification d’intégrité et restauration de test dans une base temporaire.

## Preuves de recette

| Vérification | Résultat |
| --- | --- |
| TypeScript + build Vite | Réussi |
| 13 tests unitaires | Réussis : score/attestation, commissions, couleurs, Word/Excel, rejet de contenu actif, validation de sorties IA simulées |
| Parcours API local | Réussi : comptes, organisations, critères de portail, préparation/réponses avant partage, refus d’accès tiers, concurrence de révision, upload Word synthétique, dédoublonnage, extraction, pièce partagée, notes privées, révocation, PDF, offres inactives |
| Sauvegarde et intégrité | Réussies sur les données locales de recette |
| Restauration PostgreSQL | Réussie dans une nouvelle base temporaire, supprimée ensuite ; base active inchangée |
| Audit npm du 14/10 | 0 vulnérabilité connue signalée après mises à jour |
| Vérification visuelle finale | Non effectuée : navigateur CUA indisponible dans cette session ; ancien aperçu desktop seulement |
| IA réelle, SMTP, Stripe | Non testés : configurations absentes |

Les tests API créent des comptes `example.test` et des dossiers synthétiques dans la base pilote. Ils ne doivent pas être lancés sur des données de production. Une première relance a échoué parce que le worker avait été arrêté avec la session ; elle est passée après redémarrage explicite.

## Travail restant avant ouverture commerciale

1. **IA et référentiel** : choisir/configurer le modèle, évaluer des dossiers réalistes avec accord de transmission ; affiner les exigences par financement et les pièces obligatoires ; tester contradictions, dossiers volumineux, injections et coût réel. Le seuil actuel de texte renseigné dans neuf rubriques ne constitue pas une validation de solidité financière.
2. **Documents** : installer Tesseract français/anglais pour les PDF scannés ; tester OCR et PPTX de bout en bout ; vérifier visuellement les exports et leurs sauts de page ; compléter archive/version et politiques de conservation/suppression.
3. **Commercial** : prix et quotas approuvés, réduction utilisable côté startup parrain, décaissement à l’entité bénéficiaire, rapprochement des abonnements/remboursements/litiges et tests Stripe signés/idempotents. Le correctif local de remboursement utilise une base immuable mais ne remplace pas cette recette financière.
4. **Marque blanche** : domaines personnalisés vérifiés, HTTPS, sessions et emails par domaine, facturation des options, limitations de capacité. Les portails locaux personnalisés existent ; les domaines personnalisés ne sont pas activables dans cette version.
5. **Contenus et administration** : récupérer un export valide de l’annuaire et des ressources historiques, puis les relire ; construire l’interface d’administration de revue. Le script d’import, la file de revue et les API de publication contrôlée existent. L’annuaire local reste vide tant que ses entrées ne sont pas vérifiées.
6. **Exploitation** : SMTP, vérification email en production, scénarios MFA/invitations, vérification mobile/clavier, sauvegarde hors machine et clé séparée, reprise après panne, revue des droits et des obligations de conservation avant mise en service.

## Configuration et données

Le worker est complet par défaut depuis la recette AMES ; `npm run dev:local -- --extract-only` permet de lancer uniquement l’extraction sans envoyer de document à l’IA. La recette IA réelle utilise exclusivement des fixtures synthétiques, avec accord explicite pour leur transmission au fournisseur configuré.

Les anciens fichiers `.env` et `supabase/functions/.env` ont été retirés de l’index Git, conservés sur disque et ignorés. Cela ne retire pas d’éventuels secrets déjà présents dans l’historique public : leur revue et rotation restent à traiter. Aucun secret n’est reproduit dans cette documentation.

Voir [RUNBOOK.md](RUNBOOK.md) pour lancer le pilote. Les modifications n’ont pas été poussées sur GitHub.

## Suite de livraison — contenus et affiliation

- Import éditorial reproductible : tables publiques autorisées seulement, pagination, empreinte du contenu, mise en attente de revue. Alternative JSON local avec `npm run import:legacy -- --file chemin.json`. Champs hors liste exclus ; tables de comptes refusées.
- Tentative sur l’ancien Supabase : échec DNS `ENOTFOUND` pour l’hôte historique. Aucun contenu réel récupéré. Un export JSON ou une source valide est nécessaire ; les originaux ne sont pas modifiés.
- Ressources publiques reliées à `content_pages` ; contenu rendu en texte, sans exécution de HTML importé. API de revue/publication réservées à un administrateur avec MFA ; interface d’administration à terminer.
- Conditions d’affiliation figées à l’attribution : version, type de programme, organisation bénéficiaire, taux et durée. La durée commence au premier encaissement. Les modifications du programme ne changent pas une attribution existante.
- Récompense idempotente par paiement ; refus d’auto-parrainage, d’attribution concurrente différente et de réutilisation par un client déjà abonné. Calcul hors taxes sur encaissement effectif. Remboursements cumulatifs monotones pour éviter un recrédit par événement plus ancien.
- Tests supplémentaires réussis : 3 unitaires de paiement, transaction SQL d’affiliation annulée après test, import JSON synthétique idempotent avec suppression de la fixture, routes de ressources publiques et refus d’accès administrateur. Le build passe.
- Ces tests sont locaux ; la réception des webhooks Stripe signés et les décaissements réels restent à tester. Aucun programme ni offre activé.

## Vérification des accès — 17 octobre 2026

Correction du diagnostic précédent : la clé Stripe d’organisation existe dans le coffre gopass (`stripe/api-key`). Son absence du `.env.local` Fund Road ne signifiait pas son absence de l’environnement. Aucune valeur secrète copiée dans les notes ni dans le dépôt.

- Stripe : appel authentifié en lecture reçu par Stripe, mais `Stripe-Context` du compte cible requis. Compte Fund Road non identifié. L’application prend désormais en charge `STRIPE_CONTEXT=acct_…`, avec refus d’une clé d’organisation sans compte explicite. 16 tests unitaires et build réussis. Aucun compte, webhook ni produit créé.
- OVH : trois entrées du coffre examinées (`ovh/amens`, `ovh/fieatapp`, `cloudflare/ovh-locio`). Les appels GET vers le domaine Fund Road, les hébergements web et les VPS renvoient 403 « This call has not been granted ». Leur présence ne prouve pas les droits sur Fund Road.
- Domaine : RDAP Verisign donne **IONOS SE** comme registrar de `fund-road.com`. Les DNS publics sont `ns1111.ui-dns.de`, `ns1026.ui-dns.com`, `ns1101.ui-dns.org`, `ns1104.ui-dns.biz` ; A = `185.158.133.1`. Aucun accès IONOS trouvé dans les entrées du coffre recherchées. Aucun DNS modifié.
- Aucune session navigateur disponible pour identifier le compte Stripe ou administrer IONOS. Questions transmises à Nadir : emplacement de l’accès IONOS et existence/identifiant du compte Stripe Fund Road.
- Instruction de Nadir : emails et IA reportés. Ne pas les présenter comme des credentials à fournir immédiatement. L’inscription publique exige encore un parcours cohérent sans SMTP : la vérification email reste requise en mode production dans le code, et n’a pas été désactivée.

Mise en ligne non effectuée : il manque l’accès au domaine et l’identification de la cible d’hébergement ; création du webhook en attente du compte Stripe et d’une URL serveur effective. Conserver la base/auth locales selon la décision existante tant qu’une autre cible n’est pas confirmée.

Références : [clés d’organisation Stripe](https://docs.stripe.com/keys/organization-api-keys), [création d’un compte dans une organisation](https://docs.stripe.com/get-started/account/orgs/build), [registre du domaine](https://rdap.verisign.com/com/v1/domain/fund-road.com).
