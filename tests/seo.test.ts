import test from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
const { renderProfile, slugify } = await import("../server/seo.ts");
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
