# 05 — Développement

## Interface reprise
- Accueil animé conservé : route liée à la lecture et 9 rubriques activées au passage de la voiture.
- Tableau de bord : encarts secondaires de remplissage supprimés, liste des dossiers élargie.
- Dossier : surtitres restants supprimés, nom du destinataire conservé dans « Exigences pour … ».
- Candidatures : cartes remplacées par une liste dense responsive avec destinataire, date et statut.

## Corrections après recette AMES
1. **Absences d’information** : les phrases du type « non communiqué », « non fourni » ou « à compléter » ne comptent plus comme des rubriques remplies et ne sont plus ajoutées par l’analyse IA comme faits confirmables.
2. **Pièces demandées** : un fichier joint dont le nom normalisé correspond à la pièce demandée est reconnu comme fourni, avec son identifiant pour preuve. Le pitch AMES est ainsi reconnu.
3. **Soumission incomplète** : l’API refuse désormais le partage tant que les neuf rubriques ne sont pas confirmées sans conflit ou que des questions du destinataire restent sans réponse. Le bouton est désactivé et explique la règle dans l’interface.
4. **Worker IA** : `npm run dev:local` lance le worker complet. Le mode sans appel IA reste disponible avec `npm run dev:local -- --extract-only`.

## Recette AMES réelle avec données synthétiques
Aucun dossier AMES réel n’était présent. Les entreprises, financeurs et documents de recette sont entièrement synthétiques ; aucun email externe n’a été envoyé.

### Cas incomplet
- Ancien résultat : 78 % de complétude malgré l’absence de données financières, soumission acceptée et pitch non reconnu.
- Ces comportements sont corrigés. Une soumission incomplète est maintenant refusée avec HTTP 409 et le bouton est désactivé.

### Cas complet exécuté après correction
- Extraction et analyse IA exécutées par le worker complet, sans traitement manuel du job.
- **Complétude : 100 % (9/9), aucun conflit.**
- **Questions du destinataire : 2/2.**
- **Soumission : `submitted`.**
- **Adéquation : 100 % (9/9), verdict `eligible`.**
- Secteur, stade, géographie, ticket, exclusions, MRR, mandat, pitch et prévisionnel reconnus avec citations ou pièce jointe en preuve.

## Lancer
```bash
npm run dev:local
```

## Vérifications
- `npm test` : **26/26 tests unitaires réussis**.
- `npm run test:e2e` : **6/6 scénarios Chromium réussis**, dont le refus API et UI d’une soumission incomplète.
- `npm run test:integration` : **parcours API complet réussi**.
- `npm run build` : réussi.
- `git diff --check` : réussi.

## Reste / risques
- Firefox et WebKit non testés ; les scénarios navigateur utilisent Chromium.
- Les comptes et dossiers de recette synthétiques restent en base locale.
- Vite signale un chunk principal supérieur à 500 kB, avertissement non bloquant.
- Aucun commit ni déploiement effectué.
