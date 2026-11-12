// M3 : parcours RÉEL de bout en bout, sans paiement réel. Vrai front (vite), vrai serveur et vrai worker Fund Road, base jetable,
// faux Stripe (mode test, aucun appel live), faux serveur IA, faux SMTP, et un Searchtide jetable qui reçoit les événements du pixel.
// compte créé → e-mail de confirmation → espace → dossier → document SYNTHÉTIQUE analysé → Checkout test ouvert puis abandonné.
import { Document, Packer, Paragraph } from "docx";
import { expect, test } from "@playwright/test";
import { startStack } from "../support/stack.ts";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";   // le pixel écarte « HeadlessChrome »
test.use({ userAgent: UA });
test.setTimeout(180_000);

const qp = (raw: string) => raw.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

test("M3 : inscription → activation → Checkout test abandonné ; lignes de base ET événements reçus ; aucun appel Stripe live", async ({ page }) => {
  const stack = await startStack({ checkoutUrl: "http://localhost:5191/__checkout-test" });
  try {
    // Le pixel de la page est servi par le Searchtide jetable ; ses envois lui sont transmis (domaine de production coupé du réseau).
    const script = await (await fetch(`${stack.searchtide.base}/script.js`)).text();
    await page.route("https://stats.nadirdaoudi.com/script.js", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: script }));
    page.on("request", (r) => {
      if (r.url() !== "https://stats.nadirdaoudi.com/api/collect") return;
      void fetch(`${stack.searchtide.base}/api/collect`, { method: "POST", headers: { "content-type": "text/plain;charset=UTF-8", "user-agent": UA, "x-forwarded-for": "198.51.100.7" }, body: r.postData() ?? "" });
    });
    await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    await page.route("http://localhost:5191/__checkout-test", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<h1>Page de paiement de test (Stripe simulé)</h1>" }));

    // 1. Arrivée par une campagne, inscription par l'interface.
    await page.goto("/?utm_source=linkedin&utm_medium=prospection&utm_campaign=pilotes");
    await page.locator('[data-searchtide="cta-entete-inscription"]').click();
    await page.getByLabel("Votre nom").fill("Pilote Synthétique");
    await page.getByLabel("Adresse email").fill("pilote-synthetique@exemple.test");
    await page.getByLabel("Mot de passe").fill("un-mot-de-passe-de-test-1");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Vérifiez votre boîte mail")).toBeVisible();

    // 2. E-mail de confirmation reçu par le faux SMTP ; le lien porte la campagne dans son adresse de retour.
    await expect.poll(() => stack.sink.mails.length, { timeout: 15_000 }).toBeGreaterThan(0);
    const mail = qp(stack.sink.mails[0]);
    const link = /https?:\/\/localhost:5191\/api\/auth\/verify-email\S+/.exec(mail)?.[0];
    expect(link, "lien de confirmation dans l'e-mail").toBeTruthy();
    expect(decodeURIComponent(link!)).toMatch(/callbackURL=\/app\?.*utm_campaign=pilotes/);
    await page.goto(link!);
    await expect(page).toHaveURL(/\/app\?.*utm_campaign=pilotes/);

    // 3. Espace, dossier, document synthétique : l'analyse se lance seule.
    await page.getByLabel("Nom de votre organisation").fill("Startup Synthétique");
    await page.getByRole("button", { name: /Créer mon espace/ }).click();
    await page.getByRole("button", { name: /Nouveau dossier/ }).click();
    await page.getByLabel("Nom du projet").fill("Dossier de test synthétique");
    await page.locator("form.inline-form button").last().click();
    await expect(page).toHaveURL(/\/app\/dossiers\//);
    const docx = await Packer.toBuffer(new Document({ sections: [{ children: ["Société de démonstration SYNTHÉTIQUE, aucune donnée réelle.", "Document de test pour le parcours de mesure.", "Chiffre d'affaires fictif : néant."].map((t) => new Paragraph(t)) }] }));
    await page.locator('input[type="file"]').first().setInputFiles({ name: "synthetique.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: docx });
    await expect.poll(async () => Number((await stack.db.query("SELECT count(*) FROM jobs WHERE kind='analysis' AND status='done'")).rows[0].count), { timeout: 90_000 }).toBeGreaterThanOrEqual(1);
    await expect.poll(() => stack.searchtide.rows().some((r) => r.name === "analyse_ok"), { timeout: 30_000 }).toBe(true);

    // 4. Checkout test ouvert puis ABANDONNÉ (la page de paiement simulée n'est jamais validée).
    await page.getByRole("link", { name: "Facturation" }).first().click();
    await page.getByRole("button", { name: "Choisir cette offre" }).first().click();
    await expect(page.getByText("Page de paiement de test")).toBeVisible();
    await expect.poll(() => stack.searchtide.rows().some((r) => r.name === "checkout_ouvert")).toBe(true);
    // Retour sur la page de retour SANS paiement : l'événement est émis, la base montre 0 paiement (preuve que paiement_ok n'est pas un paiement).
    await page.goto("/app/facturation?success=1");
    await expect.poll(() => stack.searchtide.rows().some((r) => r.name === "paiement_ok")).toBe(true);

    // Lignes de base (faits) et événements reçus.
    const n = async (sql: string) => Number((await stack.db.query(sql)).rows[0].count);
    const base = {
      comptes_utilisateurs: await n(`SELECT count(*) FROM "user"`),
      comptes_confirmes: await n(`SELECT count(*) FROM "user" WHERE "emailVerified"`),
      organisations: await n("SELECT count(*) FROM organizations"),
      dossiers: await n("SELECT count(*) FROM dossiers"),
      documents_prets: await n("SELECT count(*) FROM documents WHERE status='ready'"),
      analyses_reussies: await n("SELECT count(*) FROM jobs WHERE kind='analysis' AND status='done'"),
      droits_payants: await n("SELECT count(*) FROM entitlements e JOIN offers o ON o.id=e.offer_id WHERE e.status='active' AND o.price_cents>0 AND e.subscription_id IS NOT NULL"),
      paiements_recus: await n("SELECT count(*) FROM payment_events"),
    };
    const events = stack.searchtide.rows().filter((r) => r.type === "event");
    console.log("LIGNES_DE_BASE", JSON.stringify(base));
    console.log("APPELS_FAUX_STRIPE", JSON.stringify(stack.stripe.calls));
    console.log("EVENEMENTS_RECUS", JSON.stringify(events.map((e) => [e.name, e.path, e.utm_source, e.utm_medium, e.utm_campaign])));

    expect(base).toEqual({ comptes_utilisateurs: 1, comptes_confirmes: 1, organisations: 1, dossiers: 1, documents_prets: 1, analyses_reussies: 1, droits_payants: 0, paiements_recus: 0 });
    expect(stack.stripe.calls, "un seul appel Stripe, simulé : ouverture d'une session Checkout ; aucun autre").toEqual(["POST /v1/checkout/sessions"]);
    for (const name of ["compte_cree", "dossier_cree", "analyse_ok", "checkout_ouvert", "paiement_ok"]) {
      const found = events.filter((e) => e.name === name);
      expect(found.length, `${name} reçu une seule fois par le Searchtide jetable`).toBe(1);
      expect([found[0].utm_source, found[0].utm_medium, found[0].utm_campaign], `${name} : campagne attribuée`).toEqual(["linkedin", "prospection", "pilotes"]);
    }
    expect(events.some((e) => e.name === "cta-entete-inscription")).toBe(true);
  } finally {
    const diag = stack.apiLog.join("").split("\n").filter((l) => /"level":50|Stripe|rror/.test(l)).slice(-6).map((l) => l.slice(0, 400));
    if (diag.length) console.log("JOURNAL_API", JSON.stringify(diag));
    await stack.stop();
  }
});
