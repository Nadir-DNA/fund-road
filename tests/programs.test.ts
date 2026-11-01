import test from "node:test";
import assert from "node:assert/strict";
import {
  findProgram,
  orgProgram,
  programScore,
  programs,
} from "../shared/programs.ts";
const bft = findProgram("bft")!;
const all = (status: "ok" | "ko" | "unknown") =>
  Object.fromEntries(bft.criteria.map((c) => [c.id, { status, note: "" }]));
test("programmes : identifiants et critères uniques, sources présentes", () => {
  assert.equal(new Set(programs.map((p) => p.id)).size, programs.length);
  for (const p of programs) {
    assert.ok(p.sources.length > 0, p.id);
    assert.equal(
      new Set(p.criteria.map((c) => c.id)).size,
      p.criteria.length,
      p.id,
    );
  }
});
test("programme : verdicts prudents", () => {
  assert.equal(programScore(bft, {}).verdict, "incomplete");
  assert.equal(programScore(bft, all("ok")).verdict, "eligible");
  assert.equal(programScore(bft, all("ok")).percent, 100);
  const blocked = {
    ...all("ok"),
    age_lt_1y: { status: "ko" as const, note: "créée en 2022" },
  };
  assert.equal(programScore(bft, blocked).verdict, "ineligible");
  assert.equal(programScore(bft, blocked).blockers[0].id, "age_lt_1y");
  const piece = {
    ...all("ok"),
    expense_budget: { status: "unknown" as const, note: "" },
  };
  assert.equal(programScore(bft, piece).verdict, "eligible_missing_pieces");
});
test("financeur : critères du portail convertis, questions propres au financeur", () => {
  const p = orgProgram({
    id: "f1",
    name: "Fonds Test",
    kind: "fund",
    criteria: {
      sectors: "SaaS",
      stage: "",
      geography: "France",
      ticket: "100 k€",
      exclusions: "",
      questions: ["MRR ?"],
    },
  });
  assert.equal(p.id, "org:f1");
  assert.deepEqual(
    p.criteria.map((c) => c.id),
    ["sector", "geography", "ticket", "q:f1:0"],
  );
  assert.equal(p.criteria.at(-1)!.blocking, false);
});
test("financeur : les pièces demandées deviennent des critères non bloquants", () => {
  const p = orgProgram({
    id: "i1",
    name: "Incubateur Test",
    kind: "incubator",
    criteria: { sectors: "Santé", documents: ["Pitch deck", "Prévisionnel"] },
  });
  assert.equal(p.operator, "Incubateur");
  const pieces = p.criteria.filter((c) => c.id.startsWith("d:i1:"));
  assert.equal(pieces.length, 2);
  assert.ok(pieces.every((c) => !c.blocking));
});
