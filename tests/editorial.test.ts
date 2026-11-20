import test from "node:test";
import assert from "node:assert/strict";
const { editorial } = await import("../shared/editorial.generated.ts");

const texte = (html: string) => html
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/\s+/g, " ").trim();

test("Contenus éditoriaux : métadonnées, HTML, FAQ alignée et liens internes", () => {
  const entries = Object.entries(editorial).filter(([u]) => u !== "/contact"); // page contact sobre, sans FAQ
  assert.equal(entries.length, 35);
  for (const [url, p] of entries) {
    assert.ok(url.startsWith("/"), url);
    assert.ok(p.title.length <= 60, `${url} titre ${p.title.length}`);
    assert.ok(p.description.length <= 160, `${url} description ${p.description.length}`);
    assert.ok(p.html.length > (url.startsWith("/fonds/") ? 1500 : 3000), `${url} HTML trop court`);
    assert.ok(p.html.includes(`<h1>`) === false, `${url} : le H1 est fourni séparément`);
    assert.ok(!/\.md\)/.test(p.html), `${url} : lien Markdown non réécrit`);
    if (!url.startsWith("/ressources/") && !url.startsWith("/fonds/")) assert.ok(p.html.includes("<table>"), `${url} : tableau attendu`); // les guides n'en ont pas toujours
    assert.equal(p.faq?.["@type"], "FAQPage", url);
    const visible = texte(p.html);
    for (const q of p.faq.mainEntity) {
      assert.ok(visible.includes(q.name), `${url} : question absente du HTML : ${q.name}`);
      assert.equal(q.acceptedAnswer["@type"], "Answer");
      assert.ok(!/\]\(/.test(q.acceptedAnswer.text), `${url} : Markdown non nettoyé dans la réponse`);
      assert.ok(visible.includes(q.acceptedAnswer.text), `${url} : réponse absente du HTML : ${q.acceptedAnswer.text.slice(0, 60)}`);
    }
  }
  assert.ok(editorial["/aides"]);
  assert.ok(editorial["/aides/subventions-bpifrance"]);
  assert.ok(editorial["/aides/pret-honneur-initiative-france"]);
  assert.ok(editorial["/fonds/bourse-french-tech"]);
  assert.ok(editorial["/fonds/bourse-french-tech-emergence"]);
  assert.ok(editorial["/fonds/bourse-french-tech-lab"]);
  assert.ok(editorial["/fonds/eic-accelerator"]);
  assert.ok(editorial["/aides/pass-pi"]);
  assert.ok(editorial["/aides/pret-honneur-reseau-entreprendre"]);
  assert.ok(editorial["/fonds/concours-i-lab"]);
  assert.ok(editorial["/aides/concours-i-nov"]);
  for (const g of ["erreurs-bourse-french-tech", "business-plan-subvention", "monter-un-dossier-de-subvention", "dossier-bpifrance", "prestations-pass-pi"])
    assert.ok(editorial["/ressources/" + g], g);
});

test("Guides /ressources : chaque lien interne pointe vers une page publiée (aucun 404 entre les guides)", () => {
  const publiees = new Set(Object.keys(editorial));
  const guides = Object.entries(editorial).filter(([u]) => u.startsWith("/ressources/"));
  assert.equal(guides.length, 5);
  for (const [url, p] of guides)
    for (const m of p.html.matchAll(/href="(\/ressources\/[^"#?]+)"/g)) assert.ok(publiees.has(m[1]), `${url} -> ${m[1]}`);
});

test("Validation : toutes les pages intégrées sont validées et la migration sauve les ressources existantes", async () => {
  const { readFileSync } = await import("node:fs");
  for (const [url, p] of Object.entries(editorial)) assert.equal(p.validated, true, url);
  const schema = readFileSync(new URL("../server/schema.sql", import.meta.url), "utf8");
  assert.match(schema, /IF NOT EXISTS \(SELECT 1 FROM information_schema\.columns[\s\S]*ALTER TABLE content_pages ADD COLUMN validated[\s\S]*UPDATE content_pages SET validated = true/);
});
