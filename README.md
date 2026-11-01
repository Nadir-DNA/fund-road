# Fundroad V2

Plateforme locale de préparation de dossiers de financement : documents, rubriques sourcées, progression, portails financeurs et partage nominatif.

**Pilote en cours de développement. Pas encore prêt pour une ouverture commerciale.**

- [État réel, tests et travail restant](docs/IMPLEMENTATION.md)
- [Installation, démarrage et sauvegardes](docs/RUNBOOK.md)
- [Vision et décisions produit](docs/fundroad.md)

Le nouveau frontend est dans `app/`, l’API et le worker dans `server/`, les règles communes dans `shared/`. Le code historique `src/` et `supabase/` est conservé comme référence et n’est pas utilisé par le nouveau point d’entrée.

Démarrage après installation et migration : `npm run dev:local`. Le worker complet est lancé ; utiliser `npm run dev:local -- --extract-only` pour interdire tout appel IA.
