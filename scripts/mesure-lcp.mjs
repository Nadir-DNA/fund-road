// Mesure LCP mobile : 5 runs, 4G bridée, CPU ×4, cache désactivé.
// Usage : BASE_URL=https://fund-road.com node scripts/mesure-lcp.mjs [pages...]
import { chromium } from "playwright";

const base = (process.env.BASE_URL || "https://fund-road.com").replace(/\/$/, "");
const pages = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/tarifs", "/financeurs", "/fonds/360-capital"];
const javaScriptEnabled = process.env.JS !== "0";
const blockJs = process.env.BLOCK_JS === "1";
const browser = await chromium.launch();

for (const path of pages) {
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      javaScriptEnabled,
    });
    const page = await ctx.newPage();
    if (blockJs) await page.route("**/*.js", (route) => route.abort());
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (0.75 * 1024 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    if (javaScriptEnabled)
      await page.addInitScript(() => {
        window.__lcp = [];
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            window.__lcp.push({
              t: Math.round(e.startTime),
              tag: e.element?.tagName,
              txt: (e.element?.textContent || "").slice(0, 40),
              sz: e.size,
            });
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(500);
    runs.push(
      javaScriptEnabled
        ? await page.evaluate(() => ({ lcp: window.__lcp.at(-1), cls: +window.__cls.toFixed(3) }))
        : { lcp: { t: 0 }, cls: 0 },
    );
    await ctx.close();
  }
  const times = runs.map((r) => r.lcp?.t ?? 0).sort((a, b) => a - b);
  const median = times[2];
  const cls = runs.map((r) => r.cls);
  console.log(
    `${path} LCP médiane ${median} ms (${times.join(",")}) CLS ${cls.join(",")} élément ${JSON.stringify(runs[2].lcp)}`,
  );
}
await browser.close();
