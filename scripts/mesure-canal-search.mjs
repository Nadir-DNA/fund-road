// Usage : node scripts/mesure-canal-search.mjs   (CHROMIUM_PATH facultatif). Lecture seule sur le site en ligne ; aucun envoi vers Cockpit.
// Mesure du canal « search » sur le site EN LIGNE : référent reçu, politique CSP, sort de l'envoi du pixel. Rien n'atteint Cockpit :
// le domaine du suivi est résolu vers un port fermé, et le script du pixel (copie identique) est servi par ce test.
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const tracker = readFileSync(new URL("../tests/mesure/fixtures/searchtide-tracker.js", import.meta.url), "utf8");
const exe = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ headless: true, executablePath: exe, args: ["--host-resolver-rules=MAP stats.nadirdaoudi.com 127.0.0.1:9"] });
for (const [label, url] of [["fund-road.com (apex)", "https://fund-road.com/"], ["www.fund-road.com (redirigé)", "https://www.fund-road.com/"]]) {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const events = { violations: [], failed: [], collectRequests: 0 };
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    document.addEventListener("securitypolicyviolation", (e) => (window.__v ||= []).push(`${e.violatedDirective} → ${e.blockedURI}`));
  });
  await page.route("https://stats.nadirdaoudi.com/script.js", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: tracker }));
  page.on("request", (r) => { if (r.url().includes("/api/collect")) events.collectRequests++; });
  page.on("requestfailed", (r) => { if (r.url().includes("/api/collect")) events.failed.push(r.failure()?.errorText); });
  await page.goto(url, { referer: "https://www.google.com/", waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({ referrer: document.referrer, href: location.href, violations: window.__v || [], pixel: typeof window.searchtide }));
  console.log(JSON.stringify({ label, referrerReçu: info.referrer, urlFinale: info.href, pixelChargé: info.pixel === "function", violationsCSP: info.violations, requêtesCollect: events.collectRequests, échecsRéseau: events.failed }));
  await ctx.close();
}
await browser.close();
