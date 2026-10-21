# Mise en ligne de fund-road.com (Cloudflare Tunnel)

Le site est un serveur Node (API + worker IA) avec PostgreSQL et un dossier de fichiers privés.
Il tourne en Docker sur une machine Linux et Cloudflare l'expose via un tunnel : aucun port ouvert,
HTTPS et cache gérés par Cloudflare.

## 1. Domaine sur Cloudflare (une fois)
1. Cloudflare → *Add a site* → `fund-road.com`, offre Free.
2. OVH → Domaines → `fund-road.com` → *Serveurs DNS* → remplacer par les deux serveurs donnés par Cloudflare.
3. Attendre l'activation (quelques minutes à 24 h).

## 2. Tunnel (une fois)
Cloudflare → Zero Trust → Networks → Tunnels → *Create a tunnel* (cloudflared) → nommer `fundroad`.
- Copier le **jeton** du tunnel (à mettre dans `TUNNEL_TOKEN`).
- *Public hostname* : `fund-road.com` → service `HTTP` → `api:3184`. Ajouter aussi `www.fund-road.com` → même service
  (ou une règle de redirection www → apex).

## 3. Serveur
```bash
git clone https://github.com/Nadir-DNA/fund-road.git && cd fund-road
cp .env.example .env.production   # puis remplir, voir ci-dessous
docker compose -f compose.prod.yaml --env-file .env.production up -d --build
```
`.env.production` (jamais commité) :
- `APP_URL=https://fund-road.com`
- `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET` : `openssl rand -base64 36`
- `TUNNEL_TOKEN` : jeton de l'étape 2
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL` : fournisseur IA
- `SMTP_URL`, `MAIL_FROM` : emails (inscription, notifications)
- `ADMIN_EMAILS`, `ADVISOR_ORG_ID`, Stripe quand prêt
- `DATABASE_URL` est fourni par `compose.prod.yaml`, inutile de le renseigner.

## 4. Mises à jour et sauvegardes
```bash
git pull && docker compose -f compose.prod.yaml --env-file .env.production up -d --build
```
Sauvegarder les volumes `fundroad_db` (base) et `fundroad_data` (documents, logos) : voir `scripts/backup.mjs`.

## 5. Après la mise en ligne
- Google Search Console : ajouter `fund-road.com` (vérification DNS dans Cloudflare) et soumettre `https://fund-road.com/sitemap.xml`.
- Stripe : webhook vers `https://fund-road.com/api/billing/webhook`.
