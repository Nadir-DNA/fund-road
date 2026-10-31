---
title: Fund Road — Architecture locale et données
created: 2026-10-13
updated: 2026-10-13
type: concept
tags: [projet, business, decision]
---

# Fund Road — Architecture locale et données

Dépôt source : https://github.com/Nadir-DNA/fund-road ; ancien socle React/Vite/Supabase. Refondre dans un checkout isolé ; ne pas importer comptes ou dossiers.
Cible : React/TypeScript/Vite, Fastify, PostgreSQL local dédié, Better Auth auto-hébergé, documents privés locaux, worker et file persistante PostgreSQL. Pas de Supabase cloud pour la nouvelle application.
Entités : utilisateurs, organisations, membres, startups/dossiers, documents, sources, exigences, réponses, versions, candidatures, analyses privées, attestations, abonnements, consommation, codes, commissions.
Services externes : API IA directe avec fournisseur/modèle configuré explicitement, Stripe, emails transactionnels. Les extraits de documents sont transmis à l'API IA ; local ne signifie pas IA hors ligne.
PDF/DOCX/PPTX/XLSX ; OCR des PDF scannés ; pas d'exécution des macros. Traitements asynchrones et reprise après incident. Contrôle de budget avant appel, pas de fournisseur de secours silencieux.
Partages nominatifs, révocables, sélection de pièces et versions immuables. Tous les accès et mutations autorisés côté serveur selon organisation/rôle.
Configuration des domaines en marque blanche : preuve de propriété et HTTPS avant activation ; cookies et sessions isolés entre domaines.

## Liens

- [[entities/fundroad]]
- [[concepts/fundroad-vision]]
- [[concepts/fundroad-livraison]]
