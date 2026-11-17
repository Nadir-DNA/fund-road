# Mesure de l'entonnoir — runbook

Périmètre : **mesure seulement**. Aucun prix, paiement, webhook ni schéma de base modifié. Le pixel est celui de Searchtide déjà présent dans `index.html` (aucun nouveau script).

## 1. Événements du pixel (noms fixes, aucune charge utile)
Le pixel n'envoie que **l'URL, le référent, la langue et le nom**. Jamais : nom de dossier, texte ou nom de document, e-mail, identifiant d'organisation, montant, secret.

| Événement | Émis | Réserve |
|---|---|---|
| `inscription_commencee` | première ouverture de `/inscription` après consentement | une fois par onglet |
| `compte_cree` | après la réponse de succès de l'inscription | l'e-mail reste à confirmer ; la base fait foi |
| `dossier_cree` | après la création d'un dossier | |
| `analyse_ok` | quand une analyse vue « en cours » devient « terminée » dans la page ouverte | invisible si l'utilisateur a quitté la page : la base fait foi. **Il n'existe pas d'événement « activé »** : l'activation d'un pilote se mesure dans la base (requête `dossiers_actives`) |
| `paiement_demarre` | clic sur « Choisir cette offre » | ne confirme ni ouverture du Checkout ni paiement |
| `checkout_ouvert` | après la réponse du serveur qui ouvre la session de paiement | ni offre ni montant |
| `paiement_retour` | à l'arrivée sur la page de retour (`success=1`) | **n'est pas une confirmation de paiement** et ne sert **jamais de KPI** ; seul le webhook en fait foi (le paiement se lit dans la base et chez Stripe) |
| `cta-entete-inscription`, `cta-accueil-creer-dossier`, `cta-financeurs-inscription`, `cta-tarifs-inscription` | au clic (attribut `data-searchtide`) | |

## 2. Consentement et chargement du pixel
Le script de suivi n'est **pas** dans `index.html` : il est injecté par l'application **seulement après un choix « oui »** (`chargerMesure`, `app/track.ts`). Avant tout choix et après « Refuser », aucune requête n'est faite vers `stats.nadirdaoudi.com` ; après un refus, le script est retiré et la campagne et les marqueurs de visite sont effacés du `sessionStorage`. Test navigateur : `tests/mesure/consent.spec.ts`.

## 2. Attribution (UTM)
Les liens de prospection portent `utm_source`, `utm_medium`, `utm_campaign` (le segment : `incubateurs`, `ba`, `no-code`…), par exemple `https://fund-road.com/?utm_source=linkedin&utm_medium=prospection&utm_campaign=incubateurs`.
`Link`, `NavLink` et `useNavigate` (`app/links.tsx`) gardent ces trois paramètres dans l'adresse des navigations vers `/inscription`, `/connexion` et `/app` ; le lien de confirmation par e-mail les garde dans `callbackURL`. **Consentement** : la campagne est gardée **en mémoire** de la page par défaut (suffit de l'arrivée à l'inscription : les événements de la première page d'inscription sont attribués). **Rien n'est écrit dans le navigateur avant que le visiteur ait accepté la mesure d'audience** (choix `fundroad-cookies` = `oui`, lu comme le fait le bandeau) ; après acceptation seulement, elle est aussi gardée dans `sessionStorage` (propre à l'onglet, effacé à sa fermeture). **Jamais** de cookie, de `localStorage`, de colonne ni de stockage serveur, et pas de conservation sur 30 jours (la première version écrivait 30 jours dans `localStorage` sans consentement : corrigé, testé).
Conséquence assumée : sans consentement, une page rechargée perd la campagne ; **le lien de confirmation par e-mail la garde dans son adresse (`callbackURL`), même ouvert dans un autre navigateur**. Les étapes suivantes se lisent par les faits de la base.

## 2 bis. E-mail de confirmation d'inscription
L'écran demande lui-même l'envoi du lien juste après l'inscription : si l'envoi échoue (SMTP en panne), il affiche « E-mail non envoyé… » et l'événement serveur `mail.verification_failed` (code technique, jamais l'adresse) est journalisé ; « Renvoyer le lien » est proposé sur cet écran et après un refus de connexion « adresse non confirmée » ; la route est limitée à 3 demandes par minute (message « Trop de tentatives »). Aucun changement du transport, de `MAIL_FROM` ni du DNS. Distinct de l'alias Gmail `hello@fund-road.com` utilisé pour la prospection.
Points à connaître :
- **Inscription par l'API seule** (onglet fermé ou script en échec juste après l'inscription) : aucun e-mail n'est envoyé (`sendOnSignUp: false`) ; la personne se récupère en se connectant (« Renvoyer le lien de confirmation »).
- **La limite de 3 demandes par minute dépend de l'adresse lue** : en production `BEHIND_CLOUDFLARE=1` (seul `cf-connecting-ip` fait foi, `X-Forwarded-For` usurpé ne la contourne pas) ; la protection repose donc sur le **tunnel** : le port local de la machine ne doit jamais être exposé, car un `cf-connecting-ip` usurpé y contournerait la limite. Sans `BEHIND_CLOUDFLARE`, un `X-Forwarded-For` usurpé la contourne.
- **Limite par adresse** : plusieurs pilotes derrière la même adresse peuvent se bloquer une minute.

## 3. Équipe et trafic automatisé
- **Équipe** : ouvrir **une fois par navigateur** `https://fund-road.com/?searchtide=ignore` ; ensuite plus aucune visite n'est envoyée. Annuler : `?searchtide=track`.
- **Robots** : le filtre existant reste tel quel (agent utilisateur reconnu, `navigator.webdriver`). **Aucun pays ni type d'appareil n'est jamais exclu** (testé : un visiteur hors France sur ordinateur est compté).
- On publie deux nombres (`docs/mesure/visites.sql`, `node scripts/visites-engagees.mjs <copie.db> fund-road.com <du> <au>`) : **visites** (visiteur-jour) et **visites engagées** (≥ 1 `cta-…` ou ≥ 2 pages). Le reste est « **trafic non confirmé** » : ce n'est pas un diagnostic de robot.

## 4. KPI et requêtes en lecture seule (`docs/mesure/requetes.sql`)
| KPI | Définition |
|---|---|
| **Clients payants** | droit `status='active'` **et non expiré** (`expires_at` nul ou futur, comme le quota du produit) d'une offre à **prix > 0** payée via Stripe : **abonnement** (`subscription_id` renseigné) **ou achat unique** (offre de cadence `once`, ouverte en mode paiement : le webhook n'écrit alors que `customer_id`). Un simple `customer_id` sur une offre à abonnement ne suffit pas ; l'offre `pilote` et toute attribution manuelle sont exclues. Le droit n'est créé que par le webhook Stripe signé avec `payment_status='paid'` (un code à 100 % → `no_payment_required` : pas de droit, donc pas compté). **Limites** : un **remboursement** n'a pas de gestionnaire (droit actif jusqu'à expiration) ; rien ne prouve un encaissement net : le **MRR Stripe** reste la référence monétaire |
| **Pilotes actifs** | droit actif **et non expiré** de l'offre `pilote` à 0 € (le pilote dure 90 jours : un droit expiré n'est plus compté) |
| Comptes utilisateurs / confirmés / organisations / dossiers / analyses réussies (par jour) | faits de la base, **hors équipe/test** : exclusion par **identifiant d'organisation** (`$2`, liste d'`uuid`), jamais par nom |
| **Dossiers activés** (protocole des pilotes) | compte vérifié, ≥ 1 document prêt, **≥ 5 faits `confirmed: true` avec `source` non vide** dans `dossiers.state->'facts'` (un objet par rubrique `{value, source, confirmed, kind, quote}`), **0 conflit** (`state->'conflicts'` vide) |

Faits qui ne sont **pas** dans la base de Fund Road : les **sessions Checkout ouvertes** et les **paiements du jour** se lisent chez Stripe, en lecture seule (`GET /v1/checkout/sessions`, `/v1/charges`). La base ne garde que le stock d'abonnements actifs (« Clients payants »).
Exécution à la main : `psql … -c "BEGIN READ ONLY; <requête>; ROLLBACK;"`. Aucune requête ne sélectionne de nom, d'e-mail ni de contenu (testé).

## 5. Canal « search » à 0 — cause mesurée
Mesure sur le site en ligne (`node scripts/mesure-canal-search.mjs`, Chromium réel, arrivée avec un référent Google) : sur `fund-road.com` le référent est reçu ; sur **`www.fund-road.com`** (qui redirige en 301 vers l'adresse canonique) il est **perdu**, parce que la réponse de redirection portait `Referrer-Policy: no-referrer`. La CSP ne bloque pas le pixel (aucune violation). Les clics Google comptés sur `https://www.fund-road.com/` devenaient donc « direct ». Correction : en-tête `strict-origin-when-cross-origin` **sur cette seule redirection** (`server/index.ts`) ; les pages gardent `no-referrer`. À vérifier après mise en ligne en relançant le script (le second cas doit afficher `https://www.google.com/`).
Limite : Search Console ne donne pas la page de chaque clic Google côté pixel ; la cause est établie par la mesure du mécanisme, pas rattachée clic par clic aux 2 clics du 10/11.

## 6. Rejouer les vérifications
- `npm test` (tests purs) · `npx tsc -p tsconfig.v2.json --noEmit` · `npx vite build`.
- `npm run test:mesure` : événements, absence de charge utile, UTM, `?searchtide=ignore`, robot (M2/M4), parcours réel de bout en bout sur pile jetable (M3) et référent (M5). Demande un Postgres **local** (`DATABASE_URL` de `.env.local`) et Searchtide dans `~/projects/searchtide` (variable `SEARCHTIDE_DIR`). Les ports de l'API et de l'interface sont choisis **libres** à chaque lancement (`MESURE_API_PORT`, `MESURE_WEB_PORT` pour les imposer) et chaque exécution a son dossier de résultats : **deux exécutions peuvent tourner en parallèle**. La pile est créée puis supprimée ; Stripe, l'IA et le SMTP sont simulés ; l'appel vers `api.stripe.com` est refusé s'il n'est pas redirigé vers le faux Stripe.
- `npm run test:kpi` : requêtes de mesure sur une base jetable (M1).
