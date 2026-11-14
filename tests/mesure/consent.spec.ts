// Consentement : avant tout choix et après « Refuser », AUCUNE requête vers le script de suivi ni vers sa collecte.
// Après « Accepter » seulement, le pixel est chargé et envoie sa page vue.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const TRACKER = readFileSync(new URL("./fixtures/searchtide-tracker.js", import.meta.url), "utf8");
const SCRIPT = "https://stats.nadirdaoudi.com/script.js";
const COLLECT = "https://stats.nadirdaoudi.com/api/collect";

async function compter(page: Page) {
  const etat = { scripts: 0, collectes: 0 };
  await page.route(SCRIPT, (r) => { etat.scripts += 1; return r.fulfill({ status: 200, contentType: "text/javascript", body: TRACKER }); });
  await page.route(COLLECT, (r) => { etat.collectes += 1; return r.fulfill({ status: 204 }); });
  await page.route(/https:\/\/([^/]*\.)?(googletagmanager|google-analytics)\.com\/.*/, (r) => r.abort());
  await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  return etat;
}

test("avant tout choix : aucun envoi, aucun stockage", async ({ page }) => {
  const etat = await compter(page);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Refuser" })).toBeVisible();
  await page.waitForTimeout(800);
  expect(etat.scripts, "aucun chargement du pixel avant le choix").toBe(0);
  expect(etat.collectes, "aucune collecte avant le choix").toBe(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
});

test("refus : aucun envoi, campagne et marqueurs effacés", async ({ page }) => {
  const etat = await compter(page);
  await page.addInitScript(() => {
    sessionStorage.setItem("fundroad-utm", JSON.stringify({ utm_source: "linkedin" }));
    sessionStorage.setItem("fundroad-vu-compte_cree", "1");
  });
  await page.goto("/?utm_source=linkedin&utm_medium=prospection&utm_campaign=incubateurs");
  await page.getByRole("button", { name: "Refuser" }).click();
  await page.waitForTimeout(800);
  expect(etat.scripts).toBe(0);
  expect(etat.collectes).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("fundroad-cookies"))).toBe("non");
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  // navigation interne après refus : toujours rien
  await page.locator('a[href="/tarifs"]').first().click();
  await page.waitForTimeout(600);
  expect(etat.scripts).toBe(0);
  expect(etat.collectes).toBe(0);
});

test("acceptation : le pixel est chargé et envoie la page vue", async ({ page }) => {
  const etat = await compter(page);
  await page.addInitScript(() => localStorage.setItem("fundroad-cookies", "oui"));
  await page.goto("/");
  await expect.poll(() => etat.scripts, { timeout: 5000 }).toBe(1);
  await expect.poll(() => etat.collectes, { timeout: 5000 }).toBeGreaterThan(0);
});
