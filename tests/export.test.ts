import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "../shared/domain.ts";
import { findProgram } from "../shared/programs.ts";
import { exportDossier } from "../server/export.ts";

test("export : PDF et Word produits avec compléments, sources et éligibilité", async () => {
  const state = emptyState();
  state.summary = "Synthèse du dossier.";
  state.facts.team = {
    value: "Fondateur : Nadir Daoudi",
    source: "doc1",
    quote: "Fondateur : Nadir Daoudi.",
    kind: "document",
    confirmed: true,
    details: [{ value: "Aucun salarié", source: "doc1", quote: "Aucun salarié à ce jour." }],
  };
  state.programs = ["bft"];
  state.eligibility = { bft: { equity_covers_aid: { status: "unknown", note: "Capital ≥ aide non renseigné" } } } as any;
  const extra = { documents: [{ id: "doc1", name: "bp.docx" }], programs: [findProgram("bft")!], version: 3 };
  const pdf = await exportDossier("Dossier — test", state, "pdf", extra);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  const docx = (await exportDossier("Dossier — test", state, "docx", extra)) as Buffer;
  assert.equal(docx.subarray(0, 2).toString(), "PK");
});
