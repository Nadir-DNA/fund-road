# Exploiter le pilote local Fundroad

Node 22+, npm, Docker Compose. PostgreSQL reste sur la machine ; API sur `127.0.0.1:3184`, interface sur `http://127.0.0.1:5184`, PostgreSQL sur `127.0.0.1:5448`.

## Installation et démarrage

1. `npm ci`
2. Créer `.env.local` depuis `.env.example` seulement s’il n’existe pas. Utiliser un mot de passe PostgreSQL et un secret Better Auth aléatoires ; ne pas remplacer les valeurs d’une installation existante.
3. `docker compose --env-file .env.local -p fundroad-v2 up -d`
4. `npm run migrate`
5. `npm run dev:local`

La dernière commande lance API, Vite et worker **extraction locale seulement**, et arrête ses enfants à Ctrl+C. Ne pas la cumuler avec les trois services déjà démarrés individuellement. Sur cette machine, Docker est aussi accessible par `/home/dna/.local/docker/docker`.

PDF texte : `pdftotext` (Poppler). PDF scanné : `pdfinfo`, `pdftoppm`, `tesseract` et langues `fra`/`eng`. L’OCR est limité à 100 pages ; au-delà, le document doit être découpé. Tesseract n’était pas installé lors de cette recette.

## Brancher les services

Dans `.env.local`, renseigner `OPENAI_API_KEY` et `OPENAI_MODEL` pour le fournisseur IA préparé. Le worker complet (`npm run worker`) transmet le texte des documents à OpenAI ; ne pas le lancer à côté du worker d’extraction. Vérifier l’accord d’utilisation et le modèle avec des documents de recette avant dossiers réels. La requête utilise `store:false`, ce qui ne constitue pas à lui seul une politique contractuelle de rétention nulle.

`SMTP_URL` et `MAIL_FROM` permettent invitations et emails d’authentification. Ne pas activer de production sans tester vérification email et réinitialisation. `NODE_ENV=production` exige la vérification email ; `APP_URL` doit correspondre à l’origine exacte servie en HTTPS.

Stripe : clés secrète/webhook, catalogue et programmes restent à réceptionner ; ne pas activer les offres pour contourner les éléments manquants listés dans IMPLEMENTATION.md. Prix affichés : hypothèses.

## Vérifier

- `npm test` : tests isolés, fournisseur IA simulé.
- `npm run test:integration` : API, base et worker extraction doivent être actifs ; crée uniquement des données synthétiques mais conserve les fixtures en base.
- `npm run build` : vérification TypeScript et bundle.
- `npm audit` : audit courant des dépendances, nécessite le réseau.

## Sauvegarde

Suspendre les modifications de dossiers pendant la sauvegarde pour obtenir une copie cohérente entre base et pièces.

```
DOCKER_BIN=/home/dna/.local/docker/docker npm run backup -- create
npm run backup -- verify .local/backups/NOM.frbackup
DOCKER_BIN=/home/dna/.local/docker/docker npm run backup -- restore-test .local/backups/NOM.frbackup
```

La clé `.local/backup.key` est créée une fois (32 octets, permissions 600). Copier la sauvegarde hors machine et conserver la clé séparément : perdre les deux ou conserver les deux au même endroit ne protège pas d’une panne/compromission de la machine. La clé n’est pas incluse dans l’archive. Les secrets d’environnement ne sont pas sauvegardés par ce script.

`restore-test` crée une base temporaire, y restaure le dump puis la supprime même en cas d’échec. Il ne remplace jamais la base active. La restauration opérationnelle des fichiers et le raccordement d’une base restaurée doivent être préparés séparément avant mise en production.

## Reprise des contenus historiques

`npm run import:legacy` lit seulement les tables éditoriales publiques de la source historique. Cette source échoue actuellement au DNS.

Alternative : `npm run import:legacy -- --file /chemin/export.json`. Le JSON est un objet dont les seules clés autorisées sont `investors`, `articles`, `resources`, `entrepreneur_resources`, chacune contenant un tableau de lignes avec leur `id` source. Ne pas inclure de comptes ni de dossiers. Les champs permis correspondent aux sélections de `scripts/import-legacy.mjs`. L’import conserve les contenus en attente de revue, sans publication.

La revue passe par `/api/admin/content` et les actions `/publish`, `/investor`, `/reject`, protégées par le contrôle admin et MFA. Une source HTTPS vérifiée et une confirmation explicite sont requises pour publier. L’interface de revue reste à construire.

Recettes supplémentaires : `npm run test:ledger` utilise une transaction SQL annulée ; `npm run test:import` utilise un export synthétique puis retire sa fixture. Ne pas les lancer sur une installation de production.

## Stripe et domaine : contrôle du 17/10

La clé Stripe d’organisation est déjà dans le coffre. Préférer une clé limitée au compte Fundroad pour le serveur de production ; conserver la clé d’organisation dans le coffre pour l’administration. Si une clé d’organisation est utilisée, `STRIPE_CONTEXT` doit être l’identifiant `acct_…` de Fundroad. Le SDK joint sa version API. Ne pas réutiliser le contexte d’un autre projet.

Le domaine `fund-road.com` est enregistré chez IONOS ; les accès OVH trouvés n’autorisent pas sa gestion. Emails et IA sont reportés par Nadir. La vérification email reste obligatoire en production dans l’authentification actuelle : ne pas lancer d’inscription publique sans avoir défini et testé le parcours sans SMTP.
