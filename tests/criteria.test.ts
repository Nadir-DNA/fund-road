import test from "node:test";
import assert from "node:assert/strict";
import { correspond, details, formatTicket, resume } from "../shared/criteria.ts";
import { orgProgram } from "../shared/programs.ts";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
const { citeLeNom, lireFiche, verifierSource, retenir, liensUtiles, logoDe, texteDe } = await import("../server/financeurs.ts");

const fonds = {
  sectors: ["Fintech / Assurtech", "Logiciel / SaaS"],
  stages: ["Amorçage", "Série A"],
  regions: ["France entière"],
  ticketMin: 500000,
  ticketMax: 3000000,
  details: { position: "Mène les tours", reinvestit: true, tractionMin: "100 k€ de revenu récurrent annuel" },
};

test("critères : résumé lisible, structuré ou en texte libre", () => {
  assert.deepEqual(resume(fonds), {
    ticket: "500 k€ à 3 M€",
    stage: "Amorçage, Série A",
    geography: "France entière",
    sectors: "Fintech / Assurtech, Logiciel / SaaS",
  });
  const ancien = { sectors: "Fintech", stage: "Seed", geography: "Paris", ticket: "1 M€" };
  assert.deepEqual(resume(ancien), { ticket: "1 M€", stage: "Seed", geography: "Paris", sectors: "Fintech" });
  assert.equal(formatTicket(null, 50000), "jusqu’à 50 k€");
  assert.equal(formatTicket(1500000, null), "dès 1,5 M€");
});

test("critères : filtres de l'annuaire, avec généraliste et zones larges", () => {
  assert.ok(correspond(fonds, { secteur: "Fintech / Assurtech", region: "Bretagne" }));
  assert.ok(!correspond(fonds, { secteur: "Biotech" }));
  assert.ok(!correspond(fonds, { stade: "Idée" }));
  assert.ok(correspond({ sectors: ["Généraliste"], regions: ["International"] }, { secteur: "Biotech", region: "Asie" }));
  assert.ok(!correspond({ regions: ["Île-de-France"] }, { region: "Bretagne" }));
  assert.ok(correspond({ geography: "Paris et Lyon" }, { region: "paris" }), "ancienne fiche : recherche dans le texte");
});

test("critères : détails du type et conditions bloquantes pour l'IA", () => {
  assert.deepEqual(
    details("fund", fonds).map((d) => d.texte),
    ["Mène les tours", "Oui", "100 k€ de revenu récurrent annuel"],
  );
  const p = orgProgram({ id: "x", name: "Fonds X", kind: "fund", criteria: fonds });
  const ids = p.criteria.filter((c) => c.blocking).map((c) => c.id);
  assert.deepEqual(ids, ["sector", "stage", "geography", "ticket", "x:tractionMin"]);
  assert.equal(p.amount, "Ticket : 500 k€ à 3 M€");
  // généraliste et international ne restreignent rien
  const large = orgProgram({ id: "y", name: "Y", kind: "fund", criteria: { sectors: ["Généraliste"], regions: ["International"] } });
  assert.deepEqual(large.criteria.map((c) => c.id), []);
});

test("import : fiches validées selon leur type", () => {
  const ok = lireFiche({
    nom: "Fonds X",
    type: "fund",
    source_url: "https://fonds-x.fr/these",
    criteria: { ...fonds, details: { ...fonds.details, inconnu: "retiré" } },
  });
  assert.ok(ok.fiche, ok.erreur);
  assert.equal("inconnu" in ok.fiche!.criteria.details, false);
  assert.match(lireFiche({ nom: "Fonds X", type: "fund", source_url: "http://x.fr" }).erreur!, /https/);
  assert.match(
    lireFiche({ nom: "Fonds X", type: "fund", source_url: "https://x.fr", criteria: { sectors: ["Crypto"] } }).erreur!,
    /criteria\.sectors/,
  );
  assert.match(
    lireFiche({ nom: "Fonds X", type: "fund", source_url: "https://x.fr", criteria: { ticketMin: 5, ticketMax: 1 } }).erreur!,
    /supérieur/,
  );
  // réponses générées : null pour « inconnu », apostrophe droite
  const g = lireFiche({
    nom: "Fonds X",
    type: "fund",
    site: null,
    description: null,
    source_url: "https://x.fr",
    candidature_url: null,
    criteria: { exclusions: null, regions: ["Provence-Alpes-Côte d'Azur"], details: { position: null } },
  });
  assert.ok(g.fiche, g.erreur);
  assert.deepEqual(g.fiche!.criteria.regions, ["Provence-Alpes-Côte d’Azur"]);
  // un champ d'incubateur n'est pas accepté tel quel pour un fonds : il est retiré
  assert.deepEqual(
    lireFiche({ nom: "Fonds X", type: "fund", source_url: "https://x.fr", criteria: { details: { duree: "6 mois" } } }).fiche!.criteria.details,
    {},
  );
});

test("import : la source doit répondre et citer le financeur", async () => {
  assert.ok(citeLeNom("<h1>Bienvenue chez Kima Ventures</h1>", "Kima Ventures"));
  assert.ok(citeLeNom("L'équipe de Kima investit…", "Kima Ventures"), "mot distinctif");
  assert.ok(!citeLeNom("Un autre fonds", "Kima Ventures"));
  const page = (status: number, body: string) => (async () => new Response(body, { status })) as typeof fetch;
  assert.equal(await verifierSource("https://x.fr", "Kima Ventures", page(200, "Kima Ventures")), null);
  assert.match((await verifierSource("https://x.fr", "Kima Ventures", page(404, "")))!, /404/);
  assert.match((await verifierSource("https://x.fr", "Kima", page(200, "autre")))!, /ne cite pas/);
  assert.match(
    (await verifierSource("https://x.fr", "Jolt Capital", page(200, "joltcapital.com est à vendre — GoDaddy")))!,
    /à vendre/,
  );
});

test("qualification : seules les valeurs citées mot pour mot et valides sont gardées", () => {
  const pages = [{ url: "https://x.fr/these", texte: texteDe("<p>Nous investissons des tickets de 150&nbsp;k€ en amorçage.</p><p>Équipe basée à Paris.</p>") }];
  const r = retenir(
    "fund",
    {
      ticketMin: { valeur: 150000, citation: "tickets de 150 k€", url: "https://x.fr/these" },
      stages: { valeur: ["Amorçage"], citation: "en amorçage.", url: "https://x.fr/these" },
      regions: { valeur: ["Île-de-France"], citation: "phrase absente de la page", url: "https://x.fr/these" },
      sectors: { valeur: ["Crypto"], citation: "Nous investissons des tickets", url: "https://x.fr/these" },
      details: { position: { valeur: "Mène les tours", citation: "Équipe basée à Paris.", url: "https://autre.fr" } },
      notables: [{ valeur: "10%", citation: "Équipe basée à Paris", url: "https://x.fr/these" }],
    },
    pages,
  );
  assert.equal(r.criteres.ticketMin, 150000);
  assert.deepEqual(r.criteres.stages, ["Amorçage"]);
  assert.equal(r.criteres.regions, undefined, "citation introuvable");
  assert.equal(r.criteres.sectors, undefined, "valeur hors liste");
  assert.deepEqual(r.criteres.details, {}, "citation d'une autre page");
  assert.deepEqual(r.notables, [], "référence sans nom");
  assert.deepEqual(Object.keys(r.sources).sort(), ["stages", "ticketMin"]);
});

test("qualification : pages utiles du même site et logo carré", () => {
  const html = '<link rel="apple-touch-icon" href="/icon-180.png"><a href="/nos-criteres">c</a><a href="https://autre.fr/these">x</a><a href="/blog/x">b</a><a href="/candidater">a</a>';
  assert.deepEqual(liensUtiles(html, "https://x.fr/"), ["https://x.fr/nos-criteres", "https://x.fr/candidater"]);
  assert.equal(logoDe(html, "https://x.fr/"), "https://x.fr/icon-180.png");
  assert.equal(logoDe('<link rel="icon" href="/logo.svg">', "https://x.fr/"), null, "SVG refusé");
});
