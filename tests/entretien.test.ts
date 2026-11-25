import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "../shared/domain.ts";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
process.env.OPENAI_API_KEY = "mock-key-never-sent";
process.env.OPENAI_MODEL = "mock-model";
process.env.OPENAI_BASE_URL = "https://principal.test/v1";
const { analyze, jugerReponse, normaliserEntretien, normaliserJugement, documentEntretien } =
  await import("../server/ai.ts");
const { prixCompatible } = await import("../server/droits.ts");

const reponseModele = (content: unknown) =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason: "stop", message: { content: JSON.stringify(content) } }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    }),
  );

test("Entretien : questions ramenées à ce que l'application affiche (types, rubriques, doublons)", () => {
  const e = normaliserEntretien({
    comprehension: { activite: "Location de vélos pour campus", strategie: "Entrer par 3 campus lyonnais", hypotheses: ["Les étudiants paient 9 €/mois"], zones_floues: null },
    questions: [
      { rubrique: "market", type: "Objection", question: "Pourquoi 40 000 étudiants paieraient-ils 9 € par mois ?", pourquoi: "Le marché repose sur ce prix", attendu: "Un test de prix" },
      { rubrique: "inconnue", type: "piste", question: "Avez-vous envisagé la Bourse French Tech ?", pourquoi: "", attendu: "" },
      { rubrique: "market", type: "challenger", question: "Pourquoi 40 000 étudiants paieraient-ils 9 € par mois ?", pourquoi: "", attendu: "" },
      { rubrique: "team", type: "clarifier", question: "Qui ?", pourquoi: "", attendu: "" },
    ],
  });
  assert.equal(e.comprehension?.activite, "Location de vélos pour campus");
  assert.deepEqual(e.comprehension?.zonesFloues, []);
  assert.equal(e.questions.length, 2, "doublon et question trop courte écartés");
  assert.equal(e.questions[0].type, "challenger");
  assert.equal(e.questions[1].type, "orienter");
  assert.equal(e.questions[1].rubrique, "general", "rubrique inconnue ramenée à « general »");
});

test("Entretien : une réponse solide n'appelle pas de relance, un verdict inattendu reste prudent", () => {
  assert.deepEqual(normaliserJugement({ verdict: "Solide", retour: "Chiffré et daté.", relance: "Et ensuite ?" }), {
    verdict: "solide",
    retour: "Chiffré et daté.",
    relance: "",
  });
  assert.equal(normaliserJugement({ verdict: "bof", retour: "", relance: "Précisez la période." }).verdict, "a_preciser");
  assert.equal(normaliserJugement({ verdict: "contestable", retour: "x", relance: "y" }).relance, "y");
});

test("Entretien : les réponses deviennent un document citable, lu comme une déclaration", async () => {
  assert.equal(documentEntretien([{ question: "Q", reponse: "   " }]), null);
  const original = globalThis.fetch;
  const systemes: string[] = [];
  globalThis.fetch = async (_url, options) => {
    const corps = JSON.parse(String(options?.body));
    const systeme = corps.messages[0].content as string;
    systemes.push(systeme);
    const entree = JSON.parse(corps.messages[1].content);
    if (systeme.includes("tu prépares l’entretien")) {
      assert.ok(entree.documents.some((d: any) => d.id === "entretien"), "les réponses sont relues pour préparer la suite");
      return reponseModele({
        comprehension: { activite: "Vélos en libre-service sur campus", clients: "Étudiants", proposition: "", strategie: "Campus lyonnais d’abord", modele: "Abonnement", hypotheses: [], zones_floues: ["Prix non testé"] },
        questions: [{ rubrique: "business", type: "challenger", question: "Votre prix de 9 € a-t-il été testé auprès d’étudiants ?", pourquoi: "Tout le modèle en dépend", attendu: "Résultat d’un test de prix" }],
      });
    }
    if (systeme.includes("Tu structures"))
      return reponseModele({
        summary: "",
        conflicts: [],
        facts: [{ id: "traction", value: "120 abonnés payants en octobre 2026", source: "entretien", quote: "120 abonnés payants en octobre 2026", kind: "document" }],
      });
    return reponseModele({ synthese: "", stade: "", forces: [], alertes: [], priorites: [], rubriques: [] });
  };
  try {
    const r = await analyze(
      emptyState(),
      [{ id: "doc1", name: "deck.pdf", extracted: "VéloCampus" }],
      [],
      [{ question: "Combien d’abonnés payants ?", reponse: "Nous avions 120 abonnés payants en octobre 2026." }],
      "investment",
    );
    assert.equal(r.state.facts.traction.kind, "declared", "une réponse du porteur n'est jamais un document probant");
    assert.equal(r.state.facts.traction.source, "entretien");
    assert.equal(r.state.comprehension?.strategie, "Campus lyonnais d’abord");
    assert.equal(r.questions?.length, 1);
    assert.ok(systemes.every((s) => !s.includes("{{")), "aucun gabarit non rempli");
  } finally {
    globalThis.fetch = original;
  }
});

test("Entretien : préparation en panne, l'analyse aboutit sans nouvelles questions", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    const systeme = JSON.parse(String(options?.body)).messages[0].content as string;
    if (systeme.includes("tu prépares l’entretien")) return new Response("indisponible", { status: 500 });
    return reponseModele({ summary: "Résumé", conflicts: [], facts: [] });
  };
  try {
    const r = await analyze(emptyState(), [{ id: "doc1", name: "bp.docx", extracted: "Texte" }]);
    assert.equal(r.state.summary, "Résumé");
    assert.equal(r.questions, null, "null : les questions déjà posées ne sont pas effacées");
  } finally {
    globalThis.fetch = original;
  }
});

test("Entretien : le jugement reçoit le fil et la réponse, sans les pièces complètes", async () => {
  const original = globalThis.fetch;
  let entree: any;
  globalThis.fetch = async (_url, options) => {
    entree = JSON.parse(JSON.parse(String(options?.body)).messages[1].content);
    return reponseModele({ verdict: "contestable", retour: "Le deck annonce 80 abonnés, pas 120.", relance: "Lequel des deux chiffres est juste, et à quelle date ?" });
  };
  try {
    const j = await jugerReponse({
      facts: {},
      rubrique: "traction",
      question: "Combien d’abonnés payants ?",
      pourquoi: "",
      attendu: "Un chiffre daté",
      fil: [],
      reponse: "120 abonnés",
    });
    assert.equal(j.verdict, "contestable");
    assert.match(j.relance, /date/);
    assert.equal(entree.rubrique, "Traction et preuves");
    assert.equal(entree.documents, undefined);
  } finally {
    globalThis.fetch = original;
  }
});

test("Offres : le prix Stripe doit correspondre à la cadence de l'offre", () => {
  const trimestriel = { recurring: { interval: "month", interval_count: 3 } };
  assert.equal(prixCompatible("quarter", trimestriel), true);
  assert.equal(prixCompatible("quarter", { recurring: null }), false, "prix ponctuel sur un abonnement refusé");
  assert.equal(prixCompatible("quarter", { recurring: { interval: "month", interval_count: 1 } }), false);
  assert.equal(prixCompatible("once", { recurring: null }), true);
  assert.equal(prixCompatible("once", trimestriel), false);
  assert.equal(prixCompatible("month", { recurring: { interval: "month", interval_count: 1 } }), true);
});
