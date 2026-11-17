// M2 / M4 (côté navigateur) : le VRAI script du pixel Searchtide (copie identique à celui servi par Cockpit, voir fixtures/)
// reçoit les événements ; on lit ce qu'il envoie réellement au serveur de suivi. Aucune API réelle : tout est simulé.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { WEB_ORIGIN } from "../support/stack.ts";

const TRACKER = readFileSync(new URL("./fixtures/searchtide-tracker.js", import.meta.url), "utf8");
const SECRETS = ["Dossier-Secret-ABC", "pilote@exemple.test", "org-secret-uuid", "14900", "document-secret.pdf"];
type Hit = { site: string; url: string; referrer: string; lang: string; name?: string };

/** Sert le vrai pixel et capture ses envois ; navigator.webdriver est masqué pour que le pixel (qui s'arrête sinon) s'exécute. */
async function withPixel(page: Page, o: { webdriver?: boolean } = {}) {
  const hits: Hit[] = [];
  await page.route("https://stats.nadirdaoudi.com/script.js", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TRACKER }));
  // sendBeacon n'est pas toujours visible de page.route : on lit les requêtes émises (le domaine est de toute façon coupé du réseau).
  page.on("request", (r) => { if (r.url() === "https://stats.nadirdaoudi.com/api/collect") hits.push(JSON.parse(r.postData() || "{}")); });
  await page.route("https://stats.nadirdaoudi.com/api/collect", (r) => r.fulfill({ status: 204 }));
  if (!o.webdriver) await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  return hits;
}
/** Simule un visiteur qui a ACCEPTÉ la mesure d'audience (clé du bandeau) ; Google Analytics, chargé alors par le site, est coupé du réseau. */
async function accepterMesure(page: Page) {
  await page.addInitScript(() => localStorage.setItem("fundroad-cookies", "oui"));
  await coupeGoogle(page);
}
async function coupeGoogle(page: Page) {
  await page.route(/https:\/\/([^/]*\.)?(googletagmanager|google-analytics)\.com\/.*/, (r) => r.abort());
}
const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

test("M2 : sept événements — nom fixe, aucune charge utile, campagne conservée de l'arrivée à la page de retour (mesure acceptée)", async ({ page }) => {
  const hits = await withPixel(page);
  await accepterMesure(page);
  const state = { org: null as any, dossiers: [] as any[], gets: 0, signup: null as any };
  await page.route("**/api/**", async (route) => {
    const req = route.request(); const { pathname } = new URL(req.url()); const m = req.method();
    if (pathname === "/api/auth/sign-up/email") { state.signup = JSON.parse(req.postData() || "{}"); return route.fulfill(json({ token: null, user: {} })); }
    if (pathname === "/api/me") return route.fulfill(json({ user: { name: "Pilote Test", email: "pilote@exemple.test" }, organizations: state.org ? [state.org] : [] }));
    if (pathname === "/api/organizations" && m === "POST") { state.org = { id: "org-secret-uuid", name: "Startup test", kind: "startup" }; return route.fulfill(json(state.org, 201)); }
    if (pathname === "/api/dossiers" && m === "POST") { const d = { id: "d1", organization_id: "org-secret-uuid", name: "Dossier-Secret-ABC", goal: "grant", updated_at: "2026-11-12T00:00:00Z", score: { percent: 0, completed: 0, total: 10, missing: [] } }; state.dossiers.push(d); return route.fulfill(json(d, 201)); }
    if (pathname === "/api/dossiers") return route.fulfill(json(state.dossiers));
    if (pathname === "/api/dossiers/d1") {
      state.gets += 1;   // l'analyse est vue « en cours » aux deux premières lectures, puis « terminée » : le serveur répond
      const status = state.gets <= 2 ? "running" : "done";
      return route.fulfill(json({ ...state.dossiers[0], documents: [{ id: "doc1", name: "document-secret.pdf", status: "ready" }], jobs: [{ id: "j1", kind: "analysis", status }], evaluations: [], questions: [], versions: [], applications: [], state: { facts: {}, conflicts: [], summary: "" }, score: { percent: 0, completed: 0, total: 10, missing: [], conflicts: [], attestable: false } }));
    }
    if (pathname === "/api/offers") return route.fulfill(json([{ id: "dossier", label: "Dossier financement", price_cents: 14900, cadence: "quarter", active: true }]));
    if (pathname === "/api/billing/checkout") return route.fulfill(json({ url: `${WEB_ORIGIN}/app/facturation?success=1` }));   // jamais Stripe
    if (pathname.startsWith("/api/billing/")) return route.fulfill(json({}));
    return route.fulfill(json([]));
  });
  const names = () => hits.map((h) => h.name);

  // Arrivée par un lien de campagne ; clic sur le CTA d'en-tête (navigation interne vers /inscription).
  await page.goto("/?utm_source=linkedin&utm_medium=prospection&utm_campaign=incubateurs");
  await page.locator('[data-searchtide="cta-entete-inscription"]').click();
  await expect(page).toHaveURL(/\/inscription\?.*utm_campaign=incubateurs/);
  await page.getByLabel("Votre nom").fill("Pilote Test");
  await page.getByLabel("Adresse email").fill("pilote@exemple.test");
  await page.getByLabel("Mot de passe").fill("un-mot-de-passe-solide-1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByText("Vérifiez votre boîte mail")).toBeVisible();
  expect(state.signup.callbackURL, "le lien de confirmation garde la campagne").toMatch(/^\/app\?.*utm_source=linkedin.*utm_campaign=incubateurs/);

  // Lien reçu par e-mail (simulé) → espace, organisation et premier dossier (l'onboarding crée les deux).
  await page.goto(state.signup.callbackURL);
  await page.getByRole("link", { name: /Créer mon organisation/ }).click();
  await page.getByLabel("Nom de votre entreprise ou organisation").fill("Startup test");
  await page.getByRole("button", { name: /Créer mon espace/ }).click();
  await expect.poll(names).toContain("dossier_cree");
  await expect.poll(names, { timeout: 15_000 }).toContain("analyse_ok");

  // Paiement : Checkout ouvert, puis retour (simulé) sur la page de retour.
  await page.getByRole("link", { name: "Facturation" }).first().click();
  await page.getByRole("button", { name: "Choisir cette offre" }).click();
  await expect(page).toHaveURL(/success=1/);
  await expect.poll(names).toContain("paiement_retour");

  const expected = ["inscription_commencee", "compte_cree", "dossier_cree", "analyse_ok", "paiement_demarre", "checkout_ouvert", "paiement_retour"];
  for (const e of expected) {
    const found = hits.filter((h) => h.name === e);
    expect(found.length, `${e} envoyé une seule fois`).toBe(1);
    const h = found[0];
    expect(Object.keys(h).sort(), `${e} : le pixel n'envoie que ces champs`).toEqual(["lang", "name", "referrer", "site", "url"]);
    expect(h.site).toBe("fund-road.com");
    const q = new URL(h.url).searchParams;
    expect([q.get("utm_source"), q.get("utm_medium"), q.get("utm_campaign")], `${e} : campagne conservée`).toEqual(["linkedin", "prospection", "incubateurs"]);
  }
  expect(hits.some((h) => h.name === "cta-entete-inscription"), "clic sur un CTA mesuré").toBe(true);
  // Aucune donnée de dossier, d'organisation, de document, d'e-mail ni de montant dans AUCUN corps envoyé au pixel.
  const all = JSON.stringify(hits);
  for (const secret of SECRETS) expect(all, `fuite : ${secret}`).not.toContain(secret);
});

test("M4 : ?searchtide=ignore → plus aucune visite, même après rechargement ; ?searchtide=track annule", async ({ page }) => {
  const hits = await withPixel(page);
  await accepterMesure(page);
  await page.route("**/api/**", (r) => r.fulfill(json([])));
  await page.goto("/?searchtide=ignore");
  await page.goto("/tarifs"); await page.goto("/financeurs"); await page.reload();
  await page.waitForTimeout(500);
  expect(hits, "aucune visite après ignore").toEqual([]);
  await page.goto("/?searchtide=track");
  await expect.poll(() => hits.length).toBeGreaterThan(0);
});

test("M4 : navigateur automatisé (navigator.webdriver) → aucune visite envoyée par le pixel", async ({ page }) => {
  const hits = await withPixel(page, { webdriver: true });
  await accepterMesure(page);
  await page.route("**/api/**", (r) => r.fulfill(json([])));
  await page.goto("/"); await page.goto("/tarifs");
  await page.waitForTimeout(500);
  expect(hits).toEqual([]);
});

test("sans script de suivi (bloqueur) : le parcours fonctionne, aucune erreur", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://stats.nadirdaoudi.com/**", (r) => r.abort());
  await page.route("**/api/**", (r) => r.fulfill(json([])));
  await page.goto("/inscription?utm_source=x");
  await page.getByLabel("Votre nom").fill("A");
  await expect(page.getByLabel("Votre nom")).toHaveValue("A");
  expect(errors).toEqual([]);
});

test("consentement : avant choix aucun envoi ni stockage ; campagne gardée en mémoire ; après acceptation seulement, stockage d'onglet", async ({ page }) => {
  const hits = await withPixel(page);
  await coupeGoogle(page);
  const etat = { signup: null as any };
  await page.route("**/api/**", async (route) => {
    const req = route.request(); const { pathname } = new URL(req.url());
    if (pathname === "/api/auth/sign-up/email") { etat.signup = JSON.parse(req.postData() || "{}"); return route.fulfill(json({ token: null, user: {} })); }
    return route.fulfill(json({}));
  });
  const stockage = () => page.evaluate(() => ({ local: Object.keys(localStorage).filter((k) => k.startsWith("fundroad")), session: Object.keys(sessionStorage).filter((k) => k.startsWith("fundroad")) }));

  await page.goto("/?utm_source=linkedin&utm_medium=prospection&utm_campaign=incubateurs");
  expect(await stockage(), "navigateur neuf, aucun choix : rien d'écrit").toEqual({ local: [], session: [] });

  // Landing → inscription : la campagne vient de la mémoire de la page, sans aucun stockage ni envoi.
  await page.locator('[data-searchtide="cta-entete-inscription"]').click();
  await expect(page).toHaveURL(/\/inscription\?.*utm_campaign=incubateurs/);
  await page.getByLabel("Votre nom").fill("Pilote Test");
  await page.getByLabel("Adresse email").fill("pilote@exemple.test");
  await page.getByLabel("Mot de passe").fill("un-mot-de-passe-solide-1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).toBeVisible();
  expect(etat.signup.callbackURL, "la campagne reste dans le lien de confirmation").toMatch(/^\/app\?.*utm_source=linkedin.*utm_campaign=incubateurs/);
  expect(hits, "aucun envoi avant le consentement").toEqual([]);
  expect(await stockage(), "toujours rien d'écrit après l'inscription").toEqual({ local: [], session: [] });

  // Après acceptation : le pixel est chargé, la campagne est gardée dans l'onglet, jamais en cookie.
  await page.getByRole("button", { name: "Accepter" }).click();
  await expect.poll(async () => (await stockage()).session).toContain("fundroad-utm");
  await expect.poll(() => hits.length, { timeout: 5000 }).toBeGreaterThan(0);
  const apres = await stockage();
  expect(apres.local, "localStorage : uniquement le choix du bandeau").toEqual(["fundroad-cookies"]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
});
