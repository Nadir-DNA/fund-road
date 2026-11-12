// MAIL-1 / MAIL-2 : l'envoi du lien de confirmation. SMTP en panne = message visible (et événement journalisé), « Renvoyer le lien »
// envoie un nouveau mail sans créer de second utilisateur, limitation de débit visible. Pile jetable, faux SMTP : aucun envoi réel.
import { expect, test, type Page } from "@playwright/test";
import { startStack } from "../support/stack.ts";

test.setTimeout(150_000);
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
test.use({ userAgent: UA });

const count = async (stack: Awaited<ReturnType<typeof startStack>>, sql = `SELECT count(*) FROM "user"`) => Number((await stack.db.query(sql)).rows[0].count);
async function inscrire(page: Page, email: string) {
  await page.goto("/inscription");
  await page.getByLabel("Votre nom").fill("Pilote Synthétique");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill("un-mot-de-passe-de-test-1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page.getByRole("heading", { name: "Vérifiez votre boîte mail" })).toBeVisible();
}

test("MAIL : envoi unique à l'inscription, « Renvoyer le lien » = nouveau mail sans nouvel utilisateur, connexion avant confirmation, limite de débit", async ({ page }) => {
  const stack = await startStack({ checkoutUrl: "http://localhost:5191/__checkout-test" });
  try {
    await inscrire(page, "un@exemple.test");
    await expect.poll(() => stack.sink.mails.length, { timeout: 30_000 }).toBe(1);   // marge : premier envoi à froid
    await expect(page.getByText("vient d’être envoyé")).toBeVisible();
    await page.waitForTimeout(1500);
    expect(stack.sink.mails.length, "un seul mail à l'inscription (pas de doublon automatique)").toBe(1);

    await page.getByRole("button", { name: "Renvoyer le lien" }).click();
    await expect.poll(() => stack.sink.mails.length, { timeout: 15_000 }).toBe(2);
    expect(await count(stack), "aucun second utilisateur").toBe(1);
    const lien = (m: string) => /verify-email\?token=([^&\s]+)/.exec(m.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))))?.[1];
    expect(lien(stack.sink.mails[1]), "le nouveau mail porte un lien valide").toBeTruthy();

    // Connexion avant confirmation : message clair et possibilité de renvoyer (3e envoi de la minute).
    await page.goto("/connexion");
    await page.getByLabel("Adresse email").fill("un@exemple.test");
    await page.getByLabel("Mot de passe").fill("un-mot-de-passe-de-test-1");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByRole("button", { name: "Renvoyer le lien de confirmation" }).click();
    await expect.poll(() => stack.sink.mails.length, { timeout: 15_000 }).toBe(3);

    // 4e demande dans la minute : limitée par le serveur, message visible, aucun envoi de plus.
    await page.getByRole("button", { name: "Renvoyer le lien" }).click();
    await expect(page.getByRole("alert")).toContainText("Trop de tentatives");
    expect(stack.sink.mails.length).toBe(3);
    expect(await count(stack)).toBe(1);
  } finally { await stack.stop(); }
});

test("MAIL : SMTP en panne → message visible et événement journalisé ; SMTP rétabli → « Renvoyer le lien » envoie le mail ; aucun doublon d'utilisateur", async ({ page }) => {
  const stack = await startStack({ checkoutUrl: "http://localhost:5191/__checkout-test" });
  try {
    await stack.sink.pause();
    await inscrire(page, "panne@exemple.test");
    await expect(page.getByRole("alert")).toContainText("E-mail non envoyé");
    await expect(page.getByRole("alert")).toContainText("compte est créé");
    expect(stack.sink.mails.length).toBe(0);
    expect(await count(stack), "le compte est créé malgré l'échec d'envoi").toBe(1);
    await expect.poll(() => stack.apiLog.join("").includes('"event":"mail.verification_failed"'), { timeout: 10_000 }).toBe(true);
    expect(stack.apiLog.join(""), "l'événement ne contient jamais l'adresse").not.toContain("panne@exemple.test\",\"code");

    await stack.sink.resume();
    await page.getByRole("button", { name: "Renvoyer le lien" }).click();
    await expect.poll(() => stack.sink.mails.length, { timeout: 15_000 }).toBe(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByText("vient d’être envoyé")).toBeVisible();
    expect(await count(stack), "pas de doublon d'utilisateur").toBe(1);
  } finally { await stack.stop(); }
});
