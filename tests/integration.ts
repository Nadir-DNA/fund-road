import { Document, Packer, Paragraph } from "docx";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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
            sectors: "SaaS",
            stage: "Amorçage",
            geography: "France",
            ticket: "100 k€",
            exclusions: "",
            questions: ["Quel est votre revenu récurrent mensuel ?"],
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
          revision: 1,
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
  assert.equal(share.status, 200, JSON.stringify(share.data));
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
  assert.equal(received.data.criteria_snapshot.sectors, "SaaS");
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
  const pdf = await fetch(base + "/api/dossiers/" + id + "/export/pdf", {
    headers: { cookie: a.cookie },
  });
  assert.equal(pdf.status, 200);
  assert.ok((await pdf.text()).startsWith("%PDF"));
});
