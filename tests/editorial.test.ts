import test from "node:test";
import assert from "node:assert/strict";
const { editorial } = await import("../shared/editorial.generated.ts");

test("Contenus éditoriaux : métadonnées, HTML, FAQ alignée et liens internes", () => {
  const entries = Object.entries(editorial);
  assert.equal(entries.length, 6);
  for (const [url, p] of entries) {
    assert.ok(url.startsWith("/"), url);
    assert.ok(p.title.length <= 60, `${url} titre ${p.title.length}`);
    assert.ok(p.description.length <= 160, `${url} description ${p.description.length}`);
    assert.ok(p.html.length > 3000, `${url} HTML trop court`);
    assert.ok(p.html.includes(`<h1>`) === false, `${url} : le H1 est fourni séparément`);
    assert.ok(!/\.md\)/.test(p.html), `${url} : lien Markdown non réécrit`);
    assert.ok(p.html.includes("<table>"), `${url} : tableau attendu`);
    assert.equal(p.faq?.["@type"], "FAQPage", url);
    for (const q of p.faq.mainEntity) {
      assert.ok(p.html.includes(`<h3>${q.name}</h3>`), `${url} : question absente du HTML : ${q.name}`);
      assert.equal(q.acceptedAnswer["@type"], "Answer");
      assert.ok(q.acceptedAnswer.text.trim().length > 3, `${url} : réponse vide`);
    }
  }
  assert.ok(editorial["/aides"]);
  assert.ok(editorial["/aides/subventions-bpifrance"]);
  assert.ok(editorial["/aides/pret-honneur-initiative-france"]);
  assert.ok(editorial["/fonds/bourse-french-tech"]);
  assert.ok(editorial["/fonds/bourse-french-tech-emergence"]);
  assert.ok(editorial["/fonds/bourse-french-tech-lab"]);
});
