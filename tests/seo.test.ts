import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
const { renderProfile, slugify, profileTitle, profileDescription } = await import("../server/seo.ts");
const { profileFaq } = await import("../shared/faq.ts");
const { showAidesLink } = await import("../shared/seo.ts");
const index =
  '<html><head><meta name="description" content="générique" /><title>Fund Road</title></head><body><div id="root"></div></body></html>';
test("SEO : page de fonds propre au financeur et échappée", () => {
  const html = renderProfile(index, {
    id: "f1",
    slug: "capital-demo",
    kind: "fund",
    name: "Capital Démo",
    theme: { intro: "<script>alert(1)</script>" },
    criteria: { ticket: "200 à 500 k€", documents: ["Pitch deck"] },
  });
  assert.match(html, /<title>Capital Démo : critères, ticket et candidature \| Fund Road<\/title>/);
  assert.match(html, /rel="canonical" href="[^"]+\/fonds\/capital-demo"/);
  assert.match(html, /<h1>Capital Démo<\/h1>/);
  assert.ok(!html.includes("générique"));
  assert.ok(!html.includes("<script>alert"));
  assert.ok(html.includes('"@type":"BreadcrumbList"'));
  assert.equal(slugify("Élan Capital & Co"), "elan-capital-co");
});
test("SEO : titres et descriptions dans les longueurs affichées par Google", async () => {
  const { pageMeta } = await import("../shared/content.ts");
  for (const [path, m] of Object.entries(pageMeta)) {
    assert.ok(m.title.length <= 60, `${path} titre ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${path} description ${m.description.length}`);
  }
  const html = renderProfile(index, {
    id: "f2",
    slug: "long",
    kind: "fund",
    name: "Fonds Très Long",
    theme: {},
    criteria: { ticket: "x".repeat(80), sectors: "y ".repeat(60) },
  });
  const d = html.match(/name="description" content="([^"]*)"/)![1];
  assert.ok(d.length <= 160, String(d.length));
});
test("SEO : la page d'un programme public reprend ses critères sourcés et une FAQ", () => {
  const html = renderProfile(index, { id: "b1", slug: "pass-pi-brevet", kind: "public", name: "Pass PI Brevet Français", criteria: {} });
  assert.match(html, /<h2>Conditions d’éligibilité de Pass PI Brevet Français<\/h2>/);
  assert.ok(html.includes('"@type":"FAQPage"'));
  const desc = html.match(/name="description" content="([^"]*)"/)![1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  assert.ok(desc.length <= 155, `description ${desc.length}`);
  assert.match(desc, /Fund Road\.$/);
  assert.doesNotMatch(desc, /…/);
});
test("SEO : une fiche éditoriale validée remplace la fiche générique", () => {
  const html = renderProfile(index, { id: "b2", slug: "bourse-french-tech", kind: "public", name: "Bourse French Tech", criteria: {} });
  assert.match(html, /<title>Bourse French Tech : 30 000 €, conditions et dossier<\/title>/);
  assert.match(html, /<h1>Bourse French Tech<\/h1>/);
  assert.ok(html.includes('"@type":"FAQPage"'));
  assert.match(html, /Questions fréquentes/);
});

test("SEO : un nom long garde un titre ≤ 60 et une description qui ne coupe pas la marque", () => {
  const name = "Aide pour le développement de l’innovation et de l’expérimentation";
  assert.ok(profileTitle(name).length <= 60, profileTitle(name));
  assert.ok(profileDescription([`${name}.`, "Organisme : Bpifrance.", "1 à 2 M€.", "Conditions, pièces et candidature."]).length <= 155);
  const d = profileDescription(["x ".repeat(200)]);
  assert.ok(d.length <= 155);
  assert.match(d, /Fund Road\.$/);
  assert.doesNotMatch(d, /Fund…/);
  const html = renderProfile(index, { id: "x", slug: "nom-long", kind: "public", name, criteria: { ticket: "1 à 2 M€", sectors: "Industrie ".repeat(30) } });
  const desc = html.match(/name="description" content="([^"]*)"/)![1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  assert.ok(desc.length <= 155, String(desc.length));
  assert.match(desc, /Fund Road\.$/);
  assert.doesNotMatch(desc, /…/);
});
test("SEO : la description d'un programme se termine par Fund Road sans troncature", () => {
  const html = renderProfile(index, { id: "b3", slug: "pass-pi-brevet", kind: "public", name: "Pass PI Brevet Français", criteria: {} });
  const desc = html.match(/name="description" content="([^"]*)"/)![1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  assert.ok(desc.length <= 155, String(desc.length));
  assert.match(desc, /Fund Road\.$/);
  assert.doesNotMatch(desc, /…/);
});

test("SEO : une fiche sans guide reçoit une FAQ factuelle et son JSON-LD", () => {
  const html = renderProfile(index, { id: "p1", slug: "pass-pi", kind: "public", name: "Pass PI", criteria: { ticket: "jusqu’à 3 k€", stage: "Prototype", geography: "France entière" } });
  assert.ok(html.includes('"@type":"FAQPage"'));
  assert.match(html, /Questions fréquentes sur Pass PI/);
  assert.match(html, /Quel ticket propose Pass PI \?/);
  assert.ok(!html.includes("Fund…"));
  assert.equal(profileFaq("X", { ticket: "1 k€" }).length, 0, "une seule donnée ne suffit pas");
  const faq = profileFaq("X", { ticket: "1 k€", stage: "Amorçage" });
  assert.equal(faq.length, 2);
  assert.match(faq[0][1], /^Ticket indiqué par X : 1 k€\.$/);
  const avecLien = profileFaq("X", { ticket: "1 k€", stage: "Amorçage" }, "https://exemple.test/candidater");
  assert.equal(avecLien.length, 3);
  assert.match(avecLien[2][1], /adresse de candidature officielle/);
  assert.ok(!avecLien[2][1].includes("pièces"));
});

test("SEO : les descriptions de i-Lab et Pass PI sont des phrases complètes, sans coupure", () => {
  assert.equal(showAidesLink("grant"), true);
  assert.equal(showAidesLink("fund"), false);
  for (const [name, slug] of [["Concours i-Nov", "concours-i-nov"], ["Pass PI", "pass-pi"]]) {
    const html = renderProfile(index, { id: "x", slug, kind: "grant", name, criteria: { ticket: "jusqu’à 3 k€", stage: "Prototype", geography: "France entière" } });
    const desc = html.match(/name="description" content="([^"]*)"/)![1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    assert.ok(desc.length <= 155, `${name} : ${desc.length}`);
    assert.ok(!desc.includes("…"), `${name} : coupure`);
    assert.match(desc, /Fund Road\.$/, name);
    assert.match(html, /href="\/aides"/, `${name} : lien /aides absent`);
  }
});

test("LCP : les classes du premier écran serveur sont celles du client", async () => {
  const { readFileSync } = await import("node:fs");
  const server = readFileSync(new URL("../server/seo.ts", import.meta.url), "utf8");
  const client = readFileSync(new URL("../app/main.tsx", import.meta.url), "utf8");
  assert.match(server, /<main class="section info-page"><h1>Un prix simple/);
  assert.match(client, /<main className="section info-page">\s*<h1>Un prix simple/);
  assert.match(server, /<main class="home"><section class="hero">/);
  assert.match(client, /<main ref=\{ref\} className="home">\s*<section className="hero">/);
  assert.match(server, /<p class="lead">Les startups commencent/);
  assert.match(client, /<p className="lead">\s*Les startups commencent/);
});
