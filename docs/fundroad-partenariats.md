---
title: Fund Road — Parrainage et affiliation
created: 2026-10-13
updated: 2026-10-14
type: concept
tags: [projet, business, decision]
---

# Fund Road — Parrainage et affiliation

Deux programmes et codes distincts.
Startup : remise filleul avant achat ; avantage du parrain sur un prochain achat après paiement éligible et délai de remboursement. Montants, plafonds et durée non validés.
Fonds/VC : contrat, code, attribution et paiement rattachés à la structure contractante. Les salariés peuvent utiliser le lien de leur organisation mais ne touchent aucune commission personnelle. BA indépendant : bénéficiaire professionnel vérifié séparément.
Hypothèse de commission : 20 % des montants HT encaissés éligibles pendant 12 mois, nette des remboursements ; pas encore décision tarifaire.
Pas d'auto-parrainage ni double attribution ni commission sur un dossier déjà financé par l'abonnement du fonds. Pas d'accès aux documents par le seul lien de recommandation.
Transparence de la rémunération ; indépendance de l'attestation, du score et des décisions. Règlements contrôlés par administrateur au lancement. Conditions versionnées et remboursements réconciliés.

## Liens

- [[entities/fundroad]]
- [[concepts/fundroad-vision]]
- [[concepts/fundroad-livraison]]

## Implémentation vérifiée le 14/10

Conditions copiées dans l’attribution : version, programme, organisation bénéficiaire, taux, durée et délai. Un changement de taux ultérieur n’altère pas les conditions attribuées. Durée déclenchée au premier encaissement. Test SQL réussi avec modification du programme, paiement répété, refus d’auto-parrainage et bénéficiaire organisationnel. Calcul hors taxes sur cash reçu ; remboursements répétés/hors ordre testés.

Ne pas assimiler ce socle à un programme commercial activé : réduction utilisable par la startup parrain, décaissements, litiges et recette Stripe réelle restent à finaliser. Les offres et programmes restent inactifs.
