import { Document, Packer, Paragraph } from "docx";
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { requirements } from "../shared/domain.ts";
// fixtures de droits : la base de test est jetable (DATABASE_URL du serveur de test)
const pgc = new Client({ connectionString: process.env.DATABASE_URL });
await pgc.connect();
// ne jamais garder le processus en vie après un échec
after(async () => {
  await pgc.end();
});
const base = "http://127.0.0.1:3184";
async function call(url: string, method = "GET", body?: any, cookie = "") {
  const r = await fetch(base + "/api" + url, {
    method,
    headers: {
      "content-type": "application/json",
      origin: "http://127.0.0.1:5184",
      cookie,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers
      .getSetCookie()
      .map((s) => s.split(";")[0])
      .join("; "),
  };
}
async function account(name: string) {
  const id = randomUUID().slice(0, 8);
  const r = await call("/auth/sign-up/email", "POST", {
    name,
    email: `fundroad-test-${id}@example.test`,
    password: "Fundroad-Test-" + randomUUID(),
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.cookie);
  return r;
}
test("parcours API local et frontières entre organisations", async () => {
  const a = await account("Recette Entrepreneur"),
    b = await account("Recette Financeur"),
    c = await account("Recette Tiers");
  const oa = await call(
      "/organizations",
      "POST",
      { name: "Recette startup", kind: "startup" },
      a.cookie,
    ),
    ob = await call(
      "/organizations",
      "POST",
      { name: "Recette fonds", kind: "fund" },
      b.cookie,
    );
  assert.equal(oa.status, 200);
  assert.equal(ob.status, 200);
  assert.equal(
    (
      await call(
        "/organizations/" + ob.data.id,
        "PUT",
        {
          theme: { name: "Fonds test", accent: "#2354d1", intro: "Recette" },
          criteria: {
            sectors: ["Logiciel / SaaS"],
            stages: ["Amorçage"],
            regions: ["France entière"],
            ticketMin: 100000,
            ticketMax: 2000000,
            exclusions: "",
            questions: ["Quel est votre revenu récurrent mensuel ?"],
            documents: [],
          },
        },
        b.cookie,
      )
    ).status,
    200,
  );
  const created = await call(
    "/dossiers",
    "POST",
    {
      name: "Dossier de recette",
      goal: "investment",
      organizationId: oa.data.id,
      recipientOrg: ob.data.id,
    },
    a.cookie,
  );
  assert.equal(created.status, 200);
  const id = created.data.id;
  const intake = (await call("/dossiers/" + id, "GET", undefined, a.cookie))
    .data;
  assert.equal(intake.recipientProgress.total, 1);
  // A17b : répondre à des critères ne consomme aucune analyse ; seule une relance en consomme une
  const quotaAvant = (await call("/dossiers/" + id, "GET", undefined, a.cookie))
    .data.usage;
  const programmes = (await call("/programs", "GET", undefined, a.cookie)).data;
  assert.ok(programmes.length > 0);
  const programme = programmes[0];
  const revCourante = async () =>
    (await call("/dossiers/" + id, "GET", undefined, a.cookie)).data.revision;
  assert.equal(
    (
      await call(
        "/dossiers/" + id + "/programs/" + encodeURIComponent(programme.id),
        "PUT",
        { revision: await revCourante() },
        a.cookie,
      )
    ).status,
    200,
  );
  const criteres = programme.criteria.slice(0, 4).map((c: any) => c.id);
  assert.equal(criteres.length, 4);
  for (const [i, critere] of criteres.entries())
    assert.equal(
      (
        await call(
          "/dossiers/" + id + "/declarations/" + critere,
          "PUT",
          {
            revision: await revCourante(),
            answer: "Réponse " + (i + 1) + " au critère " + critere,
          },
          a.cookie,
        )
      ).status,
      200,
    );
  assert.equal(
    (await call("/dossiers/" + id, "GET", undefined, a.cookie)).data.usage,
    quotaAvant,
  );
  assert.equal(intake.recipientProgress.completed, 0);
  assert.equal(
    (
      await call(
        "/questions/" + intake.questions[0].id,
        "PUT",
        { answer: "Réponse préparée avant le partage" },
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("/dossiers/" + id, "GET", undefined, a.cookie)).data
      .recipientProgress.completed,
    1,
  );
  assert.equal(
    (await call("/dossiers/" + id, "GET", undefined, b.cookie)).status,
    403,
  );
  assert.equal((await call("/dossiers/" + id)).status, 401);
  assert.equal(
    (
      await call(
        "/dossiers/" + id + "/facts/company",
        "PUT",
        {
          revision: await revCourante(),
          fact: {
            value: "Une entreprise de test sans données réelles.",
            kind: "declared",
            source: "declaration",
            confirmed: true,
          },
        },
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "/dossiers/" + id + "/facts/company",
        "PUT",
        {
          revision: 1,
          fact: {
            value: "Une modification concurrente rejetée.",
            kind: "declared",
            source: "declaration",
            confirmed: true,
          },
        },
        a.cookie,
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("/dossiers/" + id + "/attest", "POST", {}, a.cookie)).status,
    409,
  );
  const fixture = await Packer.toBuffer(
    new Document({
      sections: [
        {
          children: [
            new Paragraph(
              "Dossier de recette synthétique sans données confidentielles. Entreprise Atelier Test, revenu annuel 100 000 EUR.",
            ),
          ],
        },
      ],
    }),
  );
  async function upload() {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(fixture)]), "recette.docx");
    const r = await fetch(base + "/api/dossiers/" + id + "/documents", {
      method: "POST",
      headers: { cookie: a.cookie, origin: "http://127.0.0.1:5184" },
      body: form,
    });
    assert.equal(r.status, 200);
    return r.json();
  }
  const uploaded = await upload();
  assert.equal((await upload()).duplicate, true);
  let extracted = false;
  for (let i = 0; i < 30; i++) {
    const current = await call("/dossiers/" + id, "GET", undefined, a.cookie);
    if (current.data.documents[0]?.status === "ready") {
      extracted = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  assert.ok(extracted, "Le worker local doit terminer l’extraction");
  assert.equal(
    (
      await fetch(base + "/api/documents/" + uploaded.id, {
        headers: { cookie: b.cookie },
      })
    ).status,
    403,
  );
  let revision = (await call("/dossiers/" + id, "GET", undefined, a.cookie))
    .data.revision;
  for (const requirement of requirements.filter((r) => r.id !== "company")) {
    const completed = await call(
      `/dossiers/${id}/facts/${requirement.id}`,
      "PUT",
      {
        revision,
        fact: {
          value: `Information synthétique suffisamment détaillée : ${requirement.label}.`,
          kind: "declared",
          source: "declaration",
          confirmed: true,
        },
      },
      a.cookie,
    );
    assert.equal(completed.status, 200, JSON.stringify(completed.data));
    revision++;
  }
  const share = await call(
    "/dossiers/" + id + "/applications",
    "POST",
    {
      recipientOrg: ob.data.id,
      documentIds: [uploaded.id],
      message: "Test",
      confirmed: true,
    },
    a.cookie,
  );
  assert.equal(share.status, 201, JSON.stringify(share.data));
  assert.equal(share.data.score, 100);
  const received = await call(
    "/applications/" + share.data.id,
    "GET",
    undefined,
    b.cookie,
  );
  assert.equal(received.status, 200);
  assert.equal(
    (
      await fetch(
        base +
          "/api/applications/" +
          share.data.id +
          "/documents/" +
          uploaded.id,
        { headers: { cookie: b.cookie } },
      )
    ).status,
    200,
  );
  assert.equal(received.data.questions.length, 1);
  assert.equal(
    received.data.questions[0].answer,
    "Réponse préparée avant le partage",
  );
  assert.deepEqual(received.data.criteria_snapshot.sectors, ["Logiciel / SaaS"]);
  const question = received.data.questions[0];
  assert.equal(
    (
      await call(
        "/questions/" + question.id,
        "PUT",
        { answer: "Réponse réservée à ce fonds" },
        c.cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await call(
        "/questions/" + question.id,
        "PUT",
        { answer: "12 000 EUR au 30 septembre" },
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("/applications/" + share.data.id, "GET", undefined, b.cookie))
      .data.questions[0].answer,
    "12 000 EUR au 30 septembre",
  );
  assert.equal(
    (
      await call(
        "/dossiers/" + id + "/applications",
        "POST",
        {
          recipientOrg: ob.data.id,
          recipientEmail: "test@example.test",
          documentIds: [],
          confirmed: true,
        },
        a.cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (await call("/applications/" + share.data.id, "GET", undefined, c.cookie))
      .status,
    403,
  );
  assert.equal(
    (
      await call(
        "/applications/" + share.data.id + "/notes",
        "POST",
        { body: "Note privée de recette" },
        b.cookie,
      )
    ).status,
    200,
  );
  const source = await call(
    "/applications/" + share.data.id,
    "GET",
    undefined,
    a.cookie,
  );
  assert.deepEqual(source.data.notes, []);
  assert.equal(
    (
      await call(
        "/applications/" + share.data.id + "/revoke",
        "POST",
        {},
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("/applications/" + share.data.id, "GET", undefined, b.cookie))
      .status,
    404,
  );
  assert.equal(
    (
      await fetch(
        base +
          "/api/applications/" +
          share.data.id +
          "/documents/" +
          uploaded.id,
        { headers: { cookie: b.cookie } },
      )
    ).status,
    404,
  );
  const list = await call("/applications", "GET", undefined, b.cookie);
  assert.ok(!list.data.some((x: any) => x.id === share.data.id));
  assert.equal((await call("/resources")).status, 200);
  assert.equal((await call("/admin/content")).status, 401);
  assert.equal(
    (await call("/admin/content", "GET", undefined, a.cookie)).status,
    403,
  );
  const offers = await call("/offers");
  assert.ok(offers.data.every((x: any) => !x.active));
  assert.equal(
    (
      await call(
        "/billing/checkout",
        "POST",
        { organizationId: oa.data.id, offerId: "dossier" },
        a.cookie,
      )
    ).status,
    503,
  );
  assert.equal(
    (await call("/partners/" + ob.data.id, "POST", {}, b.cookie)).status,
    200,
  );
  assert.equal(
    (await call("/partners/" + ob.data.id, "GET", undefined, a.cookie)).status,
    403,
  );
  const cross = await fetch(base + "/api/dossiers", {
    method: "POST",
    headers: {
      origin: "https://untrusted.example",
      "content-type": "application/json",
      cookie: a.cookie,
    },
    body: "{}",
  });
  assert.equal(cross.status, 403);
  // A12b : l'export de son propre dossier est payant ; sans droit, aucun octet de fichier
  const pdfGratuit = await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
    headers: { cookie: a.cookie },
  });
  assert.equal(pdfGratuit.status, 403);
  assert.equal((await pdfGratuit.text()).startsWith("%PDF"), false);
  // sans session, 401 ; autre organisation, 403
  assert.equal(
    (await fetch(base + "/api/dossiers/" + id + "/export/pdf")).status,
    401,
  );
  assert.equal(
    (
      await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
        headers: { cookie: b.cookie },
      })
    ).status,
    403,
  );
  // droit attribué à la main sur une offre à abonnement, sans subscription_id : pas d'export
  await pgc.query(
    "INSERT INTO entitlements(organization_id,offer_id,status,expires_at) VALUES($1,'fund','active',now()+interval '30 days') ON CONFLICT (organization_id) DO UPDATE SET offer_id='fund',status='active',subscription_id=NULL,expires_at=now()+interval '30 days'",
    [oa.data.id],
  );
  assert.equal(
    (
      await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
        headers: { cookie: a.cookie },
      })
    ).status,
    403,
  );
  // achat unique payant : export autorisé, PDF servi
  await pgc.query(
    "UPDATE entitlements SET offer_id='dossier',subscription_id=NULL,expires_at=now()+interval '90 days' WHERE organization_id=$1",
    [oa.data.id],
  );
  const pdfPaye = await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
    headers: { cookie: a.cookie },
  });
  assert.equal(pdfPaye.status, 200);
  assert.ok((await pdfPaye.text()).startsWith("%PDF"));
  // pilote à 0 € : pas d'export
  await pgc.query(
    "UPDATE entitlements SET offer_id='pilote',expires_at=now()+interval '90 days' WHERE organization_id=$1",
    [oa.data.id],
  );
  assert.equal(
    (
      await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
        headers: { cookie: a.cookie },
      })
    ).status,
    403,
  );
  // droit expiré : pas d'export non plus
  await pgc.query(
    "UPDATE entitlements SET offer_id='dossier',expires_at=now()-interval '1 day' WHERE organization_id=$1",
    [oa.data.id],
  );
  assert.equal(
    (
      await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
        headers: { cookie: a.cookie },
      })
    ).status,
    403,
  );

  // A12a — partage d'un dossier incomplet : autorisé, taux exact, contenu filtré et figé
  const vide = await call(
    "/dossiers",
    "POST",
    { name: "Dossier incomplet", goal: "grant", organizationId: oa.data.id },
    a.cookie,
  );
  assert.equal(vide.status, 200);
  assert.equal(
    (
      await call(
        "/dossiers/" + vide.data.id + "/facts/company",
        "PUT",
        {
          revision: 1,
          fact: {
            value: "MARQUEUR-NON-CONFIRME-12A",
            kind: "hypothesis",
            source: "ai",
            confirmed: false,
          },
        },
        a.cookie,
      )
    ).status,
    200,
  );
  const partage0 = await call(
    "/dossiers/" + vide.data.id + "/applications",
    "POST",
    { recipientOrg: ob.data.id, documentIds: [], confirmed: true },
    a.cookie,
  );
  assert.equal(partage0.status, 201, JSON.stringify(partage0.data));
  assert.equal(partage0.data.score, 0);
  const vu = await call(
    "/applications/" + partage0.data.id,
    "GET",
    undefined,
    b.cookie,
  );
  assert.equal(vu.status, 200);
  assert.equal(JSON.stringify(vu.data).includes("MARQUEUR-NON-CONFIRME-12A"), false);
  assert.equal(vu.data.score.percent, 0);
  // le taux est figé : confirmer une rubrique après coup ne change pas cette candidature
  assert.equal(
    (
      await call(
        "/dossiers/" + vide.data.id + "/facts/company",
        "PUT",
        {
          revision: 2,
          fact: {
            value: "Une entreprise de test sans données réelles.",
            kind: "declared",
            source: "declaration",
            confirmed: true,
          },
        },
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("/applications/" + partage0.data.id, "GET", undefined, b.cookie))
      .data.score.percent,
    0,
  );
  const partage1 = await call(
    "/dossiers/" + vide.data.id + "/applications",
    "POST",
    { recipientOrg: ob.data.id, documentIds: [], confirmed: true },
    a.cookie,
  );
  assert.equal(partage1.status, 201);
  assert.ok(partage1.data.score > 0, "un nouveau partage prend le taux à jour");
  // une autre organisation ne partage pas ce dossier
  assert.equal(
    (
      await call(
        "/dossiers/" + vide.data.id + "/applications",
        "POST",
        { recipientOrg: ob.data.id, documentIds: [], confirmed: true },
        c.cookie,
      )
    ).status,
    403,
  );
  // un partage révoqué est introuvable
  assert.equal(
    (
      await call(
        "/applications/" + partage1.data.id + "/revoke",
        "POST",
        {},
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await call("/applications/" + partage1.data.id, "GET", undefined, b.cookie))
      .status,
    404,
  );
});
