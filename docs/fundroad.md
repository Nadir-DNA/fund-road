---
title: Fundroad — Refonte IA et financement
created: 2026-10-13
updated: 2026-10-14
type: entity
tags: [projet, business, decision, design]
---

# Fundroad

Objectif de Nadir : gagner de l'argent dans le financement entrepreneurial avec une plateforme rentable. Plan complet accepté le 13/10/2026 ; implémentation engagée, pas encore de nouvelle production.

## Décisions confirmées

- Toutes les fonctions au lancement, réalisation par lots internes.
- Authentification et base sur la machine locale de Nadir ; fournisseur IA direct.
- Reprise des contenus seulement, sans comptes ou dossiers historiques.
- Interface claire et professionnelle ; dossier IA, questions ciblées et grand score explicable.
- Tampon automatisé selon référentiel ; aucune revue humaine commercialisée.
- Parrainage startup avec réduction des deux côtés.
- Affiliation fonds rémunérée à la structure, jamais à un salarié.
- Prix et quotas proposés restent des hypothèses à tester.

## Documentation

- [[concepts/fundroad-vision]] — Vision et décisions.
- [[concepts/fundroad-offres]] — Offres et rentabilité.
- [[concepts/fundroad-parcours]] — Parcours et interface.
- [[concepts/fundroad-referentiel]] — Référentiel, score et attestation.
- [[concepts/fundroad-partenariats]] — Parrainage et affiliation.
- [[concepts/fundroad-architecture]] — Architecture locale et données.
- [[concepts/fundroad-risques]] — Risques et exploitation.
- [[concepts/fundroad-livraison]] — Livraison et recette.

## Contexte de la reprise (13/10/2026)

- **Pourquoi ce jour-là** : à 12:35, [[entities/nadnad25]] transmet un message LinkedIn reçu d'**Octave De Champlain (Ayomi)** — « on va lancer un nouveau batch de financement dans le SaaS et on pensait étudier Amens ». Vérification faite, **Ayomi est réel** : SAS au capital de 154 882 €, SIREN 838 170 918, **prestataire de services d'investissement encadré par l'AMF**, plus de 1 500 entreprises clientes, levées annoncées à partir de 100 000 €. Mais le message est un **message type**, et il porte sur **Amens**, pas sur Fund-Road.
- **L'arbitrage rendu en séance** : **ne pas lever pour Amens.** Raison unique et décisive — « le fondateur n'est pas là » : c'est un projet qu'il a mis de côté, et une levée transforme un projet dormant en obligation légale (holding, comptes à rendre, calendrier), pour **deux mois de travail à plein temps** avant le premier euro.
- **Ce qui a été écrit, et par qui** : les neuf notes du 13/10 (cette page et les huit concepts liés) ont été rédigées **directement dans le coffre** par la session qui conduisait le chantier, à 13:26. Le gardien du wiki les a régularisées le soir même (emplacement de l'entrée de log, descriptions d'index, compteur). Le **plan reste un plan** : l'état réel des fonctionnalités est dans `docs/IMPLEMENTATION.md` du checkout, pas ici.
- **Les prix sont explicitement des hypothèses** à tester (149 € diagnostic/90 jours, 79 €/mois BA, 249 €/mois réseau, 599 €/mois fonds, marque blanche 199 €/mois + 990 € d'installation) — ne pas les activer sans décision commerciale explicite.

## Reprise technique

- Dépôt : https://github.com/Nadir-DNA/fund-road
- Checkout : `/home/dna/Documents/Codex/2026-10-13-j-aimerai-qu-on-reprenne-le/fundroad`.
- État précis : `docs/IMPLEMENTATION.md` dans le checkout ; ne pas confondre plan et fonctionnalités vérifiées.
- [[entities/digitaldna]] : projet précédent, qui conservait Fundroad en attente.

Source : décisions explicites de Nadir dans la conversation Codex du 13/10/2026 ; inspection du dépôt et sources officielles référencées dans les notes.

## Avancement vérifié — 14 octobre 2026

Pilote local accessible sur http://127.0.0.1:5184 lorsque les services sont démarrés. Nouvelle interface, comptes/organisations, dossiers et uploads, préparation depuis un portail financeur, questions spécifiques, progression séparée, partage de pièces et révocation. Le fonds peut inviter une startup sur un dossier précis.

10 tests unitaires et parcours API local réussis ; build réussi ; sauvegarde chiffrée et restauration dans une base temporaire vérifiées. IA testée avec réponses simulées seulement. Aucun déploiement public ni ouverture commerciale.

Restent notamment : IA réelle, OCR scanné, réception des paiements et des deux programmes de récompense, domaines de marque blanche, import/revue des contenus, vérification visuelle finale et exploitation en production. Voir [[concepts/fundroad-livraison]] et le journal détaillé du dépôt.
