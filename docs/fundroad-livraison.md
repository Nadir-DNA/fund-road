---
title: Fundroad — Livraison et recette
created: 2026-10-13
updated: 2026-10-17
type: concept
tags: [projet, business, decision]
---

# Fundroad — Livraison et recette

Ordre : fondations locales → dossier IA/score/export → financeurs/portails → paiement/partenariats → annuaire/candidatures → recette/bascule. Tous les modules sont requis avant ouverture commerciale.
Contenus : import reproductible, annuaire revérifié, articles relus, statistiques marketing justifiées ou retirées, anciens comptes/dossiers non transférés et non supprimés.
Recette : fichiers invalides/scannés/doublons ; contradictions et inconnues ; reprise de traitements ; pièces bloquantes ; attestation périmée ; deux fonds isolés ; invitations expirées ; partages révoqués ; paiements dupliqués/remboursés ; auto-parrainage/double attribution ; commission exclusivement organisationnelle ; mobile/clavier ; redémarrage et restauration.
Indicateurs : temps jusqu'au dossier exploitable, relances, erreurs critiques, coût par dossier, marge, conversion, renouvellement. Financement obtenu suivi séparément sans attribution causale automatique.
État au démarrage 13/10/2026 : plan accepté, implémentation commencée, aucune mise en production nouvelle. Le journal de livraison du dépôt décrit les preuves et limites réelles.
Dépendances externes : fournisseur/modèle IA et credentials, Stripe et catalogue approuvé, emails/domaine, sauvegarde hors machine et validation juridique avant ouverture. Ne jamais annoncer connecté/testé si non vérifié.

## Liens

- [[entities/fundroad]]
- [[concepts/fundroad-vision]]
- [[concepts/fundroad-livraison]]

## Recette locale du 14 octobre 2026

- TypeScript/build et 10 tests unitaires réussis.
- Parcours API réussi : compte, organisation, critères de portail, questions préparées avant partage, upload Word synthétique, dédoublonnage, extraction locale, réponse reprise dans candidature, isolement tiers, notes internes privées, téléchargement nominatif et révocation.
- Sauvegarde AES-256-GCM vérifiée ; restauration PostgreSQL réussie dans une base temporaire isolée.
- Audit npm : aucune vulnérabilité connue signalée au contrôle du 14/10.
- Mode worker utilisé : extraction locale uniquement. Le démarrage général avait été refusé par la validation automatique car susceptible de transmettre des documents à OpenAI ; aucun appel fournisseur réel effectué.
- Le navigateur de recette était indisponible : vérification visuelle finale/mobile à faire.

Limites à ne pas confondre avec des fonctions terminées : le référentiel de pièces obligatoires par financement reste à affiner ; Tesseract manque pour l’OCR ; les tarifs restent des hypothèses et les programmes inactifs ; réduction du parrain startup, décaissement organisationnel et scénarios Stripe restent à terminer/recetter. Annuaire historique non importé. Domaine personnalisé non activé. SMTP et IA non raccordés.

Le plan complet reste en cours. État détaillé : `fundroad/docs/IMPLEMENTATION.md` ; démarrage et sauvegardes : `fundroad/docs/RUNBOOK.md`. Code local non poussé sur GitHub.

## Suite du 14/10 — import et affiliation

Reprise éditoriale codée : file de revue, import public ou JSON local, dédoublonnage par source et empreinte, aucune publication automatique ni import de comptes. La source Supabase historique échoue au DNS ; aucun contenu réel récupéré. Un export ou une nouvelle adresse valide est nécessaire. Rubrique Ressources reliée au stockage local ; API admin de revue disponibles, interface de revue encore à construire.

13 tests unitaires passent ; tests SQL d’affiliation, import JSON synthétique, parcours API et build réussis. L’affiliation fige désormais ses conditions à l’attribution, démarre sa durée au premier encaissement, conserve le fonds comme bénéficiaire et refuse doublons/auto-parrainage. Les remboursements locaux sont monotones. Stripe réel et décaissements restent à réceptionner ; programmes inactifs.

## Vérification des accès — 17 octobre 2026

Correction du diagnostic précédent : la clé Stripe d’organisation existe dans le coffre gopass (`stripe/api-key`). Son absence du `.env.local` Fundroad ne signifiait pas son absence de l’environnement. Aucune valeur secrète copiée dans les notes ni dans le dépôt.

- Stripe : appel authentifié en lecture reçu par Stripe, mais `Stripe-Context` du compte cible requis. Compte Fundroad non identifié. L’application prend désormais en charge `STRIPE_CONTEXT=acct_…`, avec refus d’une clé d’organisation sans compte explicite. 16 tests unitaires et build réussis. Aucun compte, webhook ni produit créé.
- OVH : trois entrées du coffre examinées (`ovh/amens`, `ovh/fieatapp`, `cloudflare/ovh-locio`). Les appels GET vers le domaine Fundroad, les hébergements web et les VPS renvoient 403 « This call has not been granted ». Leur présence ne prouve pas les droits sur Fundroad.
- Domaine : RDAP Verisign donne **IONOS SE** comme registrar de `fund-road.com`. Les DNS publics sont `ns1111.ui-dns.de`, `ns1026.ui-dns.com`, `ns1101.ui-dns.org`, `ns1104.ui-dns.biz` ; A = `185.158.133.1`. Aucun accès IONOS trouvé dans les entrées du coffre recherchées. Aucun DNS modifié.
- Aucune session navigateur disponible pour identifier le compte Stripe ou administrer IONOS. Questions transmises à Nadir : emplacement de l’accès IONOS et existence/identifiant du compte Stripe Fundroad.
- Instruction de Nadir : emails et IA reportés. Ne pas les présenter comme des credentials à fournir immédiatement. L’inscription publique exige encore un parcours cohérent sans SMTP : la vérification email reste requise en mode production dans le code, et n’a pas été désactivée.

Mise en ligne non effectuée : il manque l’accès au domaine et l’identification de la cible d’hébergement ; création du webhook en attente du compte Stripe et d’une URL serveur effective. Conserver la base/auth locales selon la décision existante tant qu’une autre cible n’est pas confirmée.

Références : [clés d’organisation Stripe](https://docs.stripe.com/keys/organization-api-keys), [création d’un compte dans une organisation](https://docs.stripe.com/get-started/account/orgs/build), [registre du domaine](https://rdap.verisign.com/com/v1/domain/fund-road.com).
