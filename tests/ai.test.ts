import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "../shared/domain.ts";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
process.env.OPENAI_API_KEY = "mock-key-never-sent";
process.env.OPENAI_MODEL = "mock-model";
const { analyze, evaluate } = await import("../server/ai.ts");
const { findProgram, orgProgram } = await import("../shared/programs.ts");
test("IA : citations exactes exigées, déclarations confirmées conservées", async () => {
  const original = globalThis.fetch;
  let payload: any;
  globalThis.fetch = async (_url, options) => {
    payload = JSON.parse(String(options?.body));
    return new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                summary: "Synthèse de test",
                conflicts: ["Deux périodes diffèrent"],
                facts: [
                  {
                    id: "company",
                    value: "Nouvelle description",
                    source: "doc1",
                    quote: "Entreprise de test",
                    kind: "document",
                  },
                  {
                    id: "team",
                    value: "Une équipe inventée",
                    source: "doc1",
                    quote: "Citation absente",
                    kind: "document",
                  },
                  {
                    id: "market",
                    value: "Un marché inventé",
                    source: "inconnu",
                    quote: "Entreprise de test",
                    kind: "document",
                  },
                  {
                    id: "traction",
                    value: "Activité documentée",
                    source: "doc1",
                    quote: "Entreprise de test",
                    kind: "document",
                  },
                  {
                    id: "financials",
                    value:
                      "Aucun revenu communiqué ; aucun prévisionnel fourni.",
                    source: "doc1",
                    quote: "Entreprise de test",
                    kind: "document",
                  },
                ],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 40 },
      }),
    );
  };
  try {
    const state = emptyState();
    state.facts.company = {
      value: "Déclaration confirmée par le porteur",
      source: "declaration",
      kind: "declared",
      confirmed: true,
    };
    const result = await analyze(state, [
      { id: "doc1", name: "test.docx", extracted: "Entreprise de test" },
    ]);
    assert.equal(payload.store, false);
    assert.equal(result.state.facts.company.value, state.facts.company.value);
    assert.equal(result.state.facts.team, undefined);
    assert.equal(result.state.facts.market, undefined);
    assert.equal(result.state.facts.traction.confirmed, false);
    assert.equal(result.state.facts.financials, undefined);
    assert.deepEqual(result.state.conflicts, ["Deux périodes diffèrent"]);
    assert.equal(result.input, 100);
  } finally {
    globalThis.fetch = original;
  }
});
test("IA : sortie incomplète rejetée sans résultat utilisable", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ choices: [{ finish_reason: "length" }] }));
  try {
    await assert.rejects(analyze(emptyState(), []), /incomplète/);
  } finally {
    globalThis.fetch = original;
  }
});

test("IA : critère de programme sans citation vérifiable ramené à « à vérifier »", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                summary: "",
                facts: [],
                conflicts: [],
                eligibility: [
                  {
                    program: "bft",
                    id: "age_lt_1y",
                    status: "ok",
                    note: "Créée en mars 2026",
                    source: "doc1",
                    quote: "créée en mars 2026",
                  },
                  {
                    program: "bft",
                    id: "headcount_lt_50",
                    status: "ok",
                    note: "3 salariés",
                    source: "doc1",
                    quote: "phrase inventée",
                  },
                  {
                    program: "bft",
                    id: "innovation",
                    status: "ok",
                    note: "Déclaré",
                    source: "declaration",
                    quote: "algorithme breveté",
                  },
                  {
                    program: "bft",
                    id: "inexistant",
                    status: "ko",
                    note: "",
                    source: "doc1",
                    quote: "créée",
                  },
                ],
              }),
            },
          },
        ],
      }),
    );
  try {
    const state = {
      ...emptyState(),
      programs: ["bft"],
      declarations: {
        innovation: "Notre algorithme breveté prévoit la demande.",
      },
    };
    const r = await analyze(
      state,
      [
        {
          id: "doc1",
          name: "kbis.pdf",
          extracted: "Société créée en mars 2026 à Lyon.",
        },
      ],
      [findProgram("bft")!],
    );
    assert.equal(r.state.eligibility!.bft.age_lt_1y.status, "ok");
    assert.equal(r.state.eligibility!.bft.headcount_lt_50.status, "unknown");
    assert.equal(r.state.eligibility!.bft.innovation.status, "ok");
    assert.equal(r.state.eligibility!.bft.inexistant, undefined);
    assert.deepEqual(r.state.programs, ["bft"]);
  } finally {
    globalThis.fetch = original;
  }
});

test("IA : une pièce jointe correspondant au nom demandé est reconnue", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                eligibility: [
                  {
                    id: "d:f1:0",
                    status: "unknown",
                    note: "Le fichier est joint",
                    source: "doc1",
                    quote: "",
                  },
                ],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
    );
  try {
    const program = orgProgram({
      id: "f1",
      name: "Fonds Test",
      kind: "fund",
      criteria: { documents: ["Pitch deck"] },
    });
    const result = await evaluate(
      emptyState(),
      [
        {
          id: "doc1",
          name: "ames-pitch-deck-recette.docx",
          extracted: "Présentation synthétique",
        },
      ],
      program,
    );
    assert.equal(result.eligibility["d:f1:0"].status, "ok");
    assert.equal(result.eligibility["d:f1:0"].source, "doc1");
  } finally {
    globalThis.fetch = original;
  }
});
