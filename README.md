# Fund Road

Fund Road prépare des dossiers de financement sourcés pour les startups et les remet aux financeurs (fonds, business angels, incubateurs, organismes publics) sous un format comparable.

En production sur [fund-road.com](https://fund-road.com) depuis novembre 2026 : inscription avec vérification d'email, abonnement Stripe (149 € tous les 90 jours), emails transactionnels, surveillance et sauvegardes quotidiennes.

## Ce que fait le produit

- **Startups** :
  - dépôt de documents (PDF, Word, Excel, PowerPoint, avec reconnaissance de texte sur les scans) ;
  - rangement par IA dans 9 rubriques, chaque information citant l'extrait du document dont elle vient ;
  - détection des contradictions entre documents ;
  - revue critique d'investisseur (36 points de contrôle) ;
  - éligibilité aux aides et aux financeurs, critère par critère ;
  - exports PDF et Word ;
  - partages datés et révocables, attestations.
- **Financeurs** :
  - portail de candidature à leurs couleurs, avec leurs critères ;
  - pipeline par étapes, notes d'équipe privées ;
  - adéquation de chaque dossier à leurs critères ;
  - annuaire public de 119 financeurs.
- **Commerce** :
  - offre Découverte gratuite ;
  - offre Dossier en abonnement Stripe ;
  - programme partenaire (20 % pour les fonds et les incubateurs) ;
  - pages légales (mentions, CGV, confidentialité) ;
  - mention des contenus générés par IA (AI Act).

## Architecture

| Dossier | Rôle |
|---|---|
| `app/` | Interface React (Vite), un seul point d'entrée `app/main.tsx` |
| `server/` | API Fastify, authentification better-auth, facturation Stripe, exports, référencement |
| `server/worker.ts` | File de traitement : extraction de texte, analyses et évaluations IA |
| `shared/` | Règles communes : rubriques, score, critères, programmes d'aides, textes publics |
| `tests/` | Tests unitaires (`npm test`), tests d'intégration et tests de bout en bout |
| `scripts/` | Sauvegarde, surveillance, imports de financeurs, outils d'administration |
| `docs/` | Déploiement, exploitation, recette, revue, présentations commerciales |

Stack : Node 22, TypeScript, React 18, Fastify 5, PostgreSQL 17, Stripe, nodemailer. L'IA passe par une API compatible OpenAI (`OPENAI_BASE_URL`, `OPENAI_MODEL`).

## Démarrer en local

```bash
npm install
cp .env.production.example .env.local   # renseigner au minimum DATABASE_URL et BETTER_AUTH_SECRET
docker compose up -d db                 # PostgreSQL local
npm run migrate
npm run dev:local                       # API, worker et interface
```

`npm run dev:local -- --extract-only` lance le worker sans aucun appel à l'IA.

## Vérifier

```bash
npm test                 # tests unitaires
npm run build            # compilation TypeScript et build de l'interface
npm run test:ledger      # programme partenaire (base locale requise)
```

L'intégration continue GitHub lance la compilation, les tests et le build à chaque push.

## Production

- **Hébergement** : Docker sur un serveur de l'éditeur, exposé par un tunnel Cloudflare. Voir [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).
- **Déploiement** : `docker compose -p fundroad-prod -f compose.prod.yaml --env-file .env.production up -d --build api worker`.
- **Exploitation** : sauvegarde chiffrée chaque nuit, surveillance toutes les 5 minutes avec alerte par email, restauration testée. Voir [docs/RUNBOOK.md](docs/RUNBOOK.md).
- **Configuration** : les variables sont listées dans [.env.production.example](.env.production.example). Les secrets ne sont jamais versionnés.

## Documentation

- [Revue complète et travail restant](docs/REVUE-2026-11-02.md)
- [Cahier de recette](docs/CAHIER-DE-RECETTE.md) et [résultats](docs/RESULTATS-RECETTE.md)
- [Architecture](docs/fundroad-architecture.md), [offres](docs/fundroad-offres.md), [partenariats](docs/fundroad-partenariats.md), [risques](docs/fundroad-risques.md)
- [Présentations commerciales par acteur](docs/presentations/vente/)
