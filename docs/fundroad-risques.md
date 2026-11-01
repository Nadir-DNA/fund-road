---
title: Fund Road — Risques et exploitation
created: 2026-10-13
updated: 2026-10-13
type: concept
tags: [projet, business, decision]
---

# Fund Road — Risques et exploitation

Risques prioritaires : hallucinations, faux justificatifs, fuite entre fonds, prompt injection, attestations trompeuses, biais, données obsolètes, surconsommation IA, conflit d'intérêts, personnalisation ingérable.
Contrôles : source/confirmation, distinction authenticité/présence, permissions serveur et tests croisés, traitements de documents non fiables, référentiels versionnés, décision d'investissement humaine, limites de coût, séparation commission/score.
Auth : sessions sécurisées, vérification email, récupération de mot de passe, double authentification administrateur. Secrets hors dépôt. Ne pas exposer PostgreSQL sur Internet.
Sauvegardes chiffrées de la base et des documents avec copie hors machine avant ouverture. Test réel de restauration. Journalisation expurgée, supervision et reprise worker.
Hébergement machine de Nadir : disponibilité dépendante de la machine et de sa connexion ; aucun SLA promis sans moyens correspondants.
Qualification juridique à mener avant ouverture commerciale : activité financière réelle, contrats partenaires, RGPD (rôles/sous-traitants/transferts/conservation), usages IA. Ne pas déduire une exemption de la seule appellation logiciel.
Sources : https://www.amf-france.org/fr/conseil-en-investissement ; https://www.cnil.fr/fr/determiner-la-qualification-juridique-des-fournisseurs-de-systemes-dia ; https://eur-lex.europa.eu/eli/reg/2024/1689/oj ; https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

## Liens

- [[entities/fundroad]]
- [[concepts/fundroad-vision]]
- [[concepts/fundroad-livraison]]
