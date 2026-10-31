import { randomUUID } from "node:crypto";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { requirements } from "../../shared/domain.ts";

const origin = "http://127.0.0.1:5184";
let cookies: Awaited<ReturnType<BrowserContext["cookies"]>> = [];
let fixture: {
  userName: string;
  application: { id: string };
  dossier: { id: string; name: string };
  incompleteDossier: { id: string; name: string };
  fund: { id: string; name: string };
};

async function post(page: Page, path: string, body: unknown) {
  const response = await page.request.post("/api" + path, {
    data: body,
    headers: { origin },
  });
  const data = await response.json();
  expect(
    response.ok(),
    `POST ${path}: ${response.status()} ${JSON.stringify(data)}`,
  ).toBeTruthy();
  return data;
}

async function createOrganization(page: Page, kind: "startup" | "fund") {
  const id = randomUUID().slice(0, 8);
  const name = `${kind === "startup" ? "Startup" : "Fonds"} UI ${id}`;
  const org = await post(page, "/organizations", { name, kind });
  return { id: org.id as string, name };
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext({ baseURL: origin });
  const page = await context.newPage();
  const id = randomUUID().slice(0, 8);
  const userName = `Recette UI ${id}`;
  await post(page, "/auth/sign-up/email", {
    name: userName,
    email: `fundroad-ui-${id}@example.test`,
    password: "Fundroad-Test-" + randomUUID(),
  });
  const startup = await createOrganization(page, "startup");
  const fund = await createOrganization(page, "fund");
  const dossierId = randomUUID().slice(0, 8);
  const dossierName = `Dossier UI ${dossierId}`;
  const dossier = await post(page, "/dossiers", {
    name: dossierName,
    goal: "investment",
    organizationId: startup.id,
    recipientOrg: fund.id,
  });
  let revision = 1;
  for (const requirement of requirements) {
    const response = await page.request.put(
      `/api/dossiers/${dossier.id}/facts/${requirement.id}`,
      {
        data: {
          revision,
          fact: {
            value: `Information synthétique suffisamment détaillée : ${requirement.label}.`,
            source: "declaration",
            kind: "declared",
            confirmed: true,
          },
        },
        headers: { origin },
      },
    );
    expect(response.ok(), `Complétion de ${requirement.id}`).toBeTruthy();
    revision++;
  }
  const application = await post(page, `/dossiers/${dossier.id}/applications`, {
    recipientOrg: fund.id,
    documentIds: [],
    message: "Fixture synthétique de recette UI",
    confirmed: true,
  });
  const incompleteDossier = await post(page, "/dossiers", {
    name: `Dossier incomplet UI ${dossierId}`,
    goal: "investment",
    organizationId: startup.id,
    recipientOrg: fund.id,
  });
  fixture = {
    userName,
    application,
    dossier: { id: dossier.id, name: dossierName },
    incompleteDossier: {
      id: incompleteDossier.id,
      name: `Dossier incomplet UI ${dossierId}`,
    },
    fund,
  };
  cookies = await context.cookies();
  await context.close();
});

test.beforeEach(async ({ page }) => {
  await page.context().addCookies(cookies);
});

test("tableau de bord : titres sobres et aucun encart de remplissage", async ({
  page,
}) => {
  await page.goto("/app");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: `Bonjour ${fixture.userName.split(" ")[0]}`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: new RegExp(fixture.dossier.name) }),
  ).toBeVisible();
  await expect(page.getByText("VOTRE PROCHAIN FINANCEMENT")).toHaveCount(0);
  await expect(page.getByText("Une question à la fois.")).toHaveCount(0);
  await expect(page.getByText("LE BON RÉFLEXE")).toHaveCount(0);
  await expect(page.locator("main .eyebrow")).toHaveCount(0);
});

test("dossier : aucun surtitre et destinataire conservé dans les exigences", async ({
  page,
}) => {
  await page.goto(`/app/dossiers/${fixture.dossier.id}`);

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: fixture.dossier.name,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("main .page-heading .eyebrow")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: `Exigences pour ${fixture.fund.name}` }),
  ).toBeVisible();
});

test("candidatures bureau : liste dense complète et navigation vers le partage", async ({
  page,
}) => {
  await page.goto("/app/candidatures");

  for (const label of [
    "Candidature",
    "Destinataire",
    "Partagée le",
    "Statut",
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  const row = page.getByRole("link", {
    name: new RegExp(fixture.dossier.name),
  });
  await expect(row).toBeVisible();
  await expect(row.getByText(fixture.fund.name, { exact: true })).toBeVisible();
  await expect(row.locator("time")).toBeVisible();
  await expect(row.getByText("Reçu", { exact: true })).toBeVisible();
  await expect(page.locator("main .dossier-card")).toHaveCount(0);

  await row.click();
  await expect(page).toHaveURL(`/partages/${fixture.application.id}`);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: fixture.dossier.name,
      exact: true,
    }),
  ).toBeVisible();
});

test("candidatures mobile : informations accessibles sans défilement horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/candidatures");

  const row = page.getByRole("link", {
    name: new RegExp(fixture.dossier.name),
  });
  await expect(row).toBeVisible();
  await expect(row.getByText(fixture.fund.name, { exact: true })).toBeVisible();
  await expect(row.locator("time")).toBeVisible();
  await expect(row.getByText("Reçu", { exact: true })).toBeVisible();
  await expect(page.locator("main .pipeline-head")).toBeHidden();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("soumission incomplète : refus API et bouton désactivé", async ({
  page,
}) => {
  const response = await page.request.post(
    `/api/dossiers/${fixture.incompleteDossier.id}/applications`,
    {
      data: {
        recipientOrg: fixture.fund.id,
        documentIds: [],
        confirmed: true,
      },
      headers: { origin },
    },
  );
  expect(response.status()).toBe(409);

  await page.goto(`/app/dossiers/${fixture.incompleteDossier.id}`);
  await page.getByRole("button", { name: "Partager", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Partager cette version" }),
  ).toBeDisabled();
});

test("candidatures vides : état vide sans fausse liste", async ({ page }) => {
  await page.route("**/api/applications", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.goto("/app/candidatures");

  await expect(
    page.getByRole("heading", { name: "Aucune candidature partagée" }),
  ).toBeVisible();
  await expect(page.locator("main .pipeline")).toHaveCount(0);
});
