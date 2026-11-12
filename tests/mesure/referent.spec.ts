// M5 : la redirection www → adresse canonique ne doit pas effacer le référent (cause mesurée du canal « search » à 0 : la réponse 301
// portait Referrer-Policy: no-referrer, donc un visiteur arrivé de Google sur www.fund-road.com devenait « direct »).
// Pile jetable ; le navigateur arrive d'une page de recherche simulée en http (pas de rétrogradation https→http, qui effacerait le
// référent pour une autre raison) sur www.localhost, redirigé par le serveur vers l'adresse canonique.
import { expect, test } from "@playwright/test";
import http from "node:http";
import { API_PORT, startStack, WEB_ORIGIN } from "../support/stack.ts";

test.setTimeout(120_000);

test("M5 : la redirection 301 vers l'adresse canonique garde le référent de recherche (et la page, elle, reste en no-referrer)", async ({ page }) => {
  const stack = await startStack({ checkoutUrl: `${WEB_ORIGIN}/__checkout-test`, appUrl: `http://localhost:${API_PORT}` })   // canonique = le serveur lui-même;
  try {
    // 1. En-tête de la réponse de redirection (appel HTTP direct, Host www.).
    const redirect = await new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get({ host: "127.0.0.1", port: API_PORT, path: "/tarifs", headers: { host: `www.localhost:${API_PORT}` } }, resolve).on("error", reject);
    });
    expect(redirect.statusCode).toBe(301);
    expect(redirect.headers.location).toBe(`http://localhost:${API_PORT}/tarifs`);
    expect(redirect.headers["referrer-policy"], "la redirection ne doit pas effacer le référent").toBe("strict-origin-when-cross-origin");

    // 2. Dans un navigateur : le référent d'une page de recherche survit à la redirection www → canonique.
    await page.goto(`http://www.localhost:${API_PORT}/tarifs`, { referer: "http://recherche.example.test/resultats?q=secret" });
    await expect(page).toHaveURL(`http://localhost:${API_PORT}/tarifs`);
    expect(await page.evaluate(() => document.referrer), "origine seulement : jamais la requête de recherche").toBe("http://recherche.example.test/");

    // 3. La politique des pages elles-mêmes ne change pas : une page normale reste en no-referrer.
    const page200 = await fetch(`http://127.0.0.1:${API_PORT}/tarifs`);
    expect(page200.headers.get("referrer-policy")).toBe("no-referrer");
  } finally { await stack.stop(); }
});
