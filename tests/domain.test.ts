import test from "node:test";
import assert from "node:assert/strict";
import {
  score,
  canAttest,
  emptyState,
  requirements,
  affiliateAmount,
  validColor,
} from "../shared/domain.ts";
test("un dossier vide ne reçoit ni score ni attestation", () => {
  assert.equal(score(emptyState()).percent, 0);
  assert.equal(canAttest(emptyState(), 1, 0), false);
});
test("une hypothèse ou une extraction non confirmée reste à compléter", () => {
  const s = emptyState();
  s.facts.company = {
    value: "Une société bien décrite.",
    source: "document",
    kind: "document",
    confirmed: false,
  };
  assert.equal(score(s).percent, 0);
  s.facts.company.confirmed = true;
  s.facts.company.kind = "hypothesis";
  assert.equal(score(s).percent, 0);
});
test("une absence d’information ne complète pas une rubrique", () => {
  const s = emptyState();
  s.facts.financials = {
    value:
      "Aucun revenu mensuel récurrent communiqué ; aucun prévisionnel financier sur trois ans fourni.",
    source: "doc1",
    kind: "document",
    confirmed: true,
  };
  assert.equal(score(s).percent, 0);
  assert.ok(score(s).missing.some((r) => r.id === "financials"));
});
test("attestation liée à une version contrôlée et à des documents", () => {
  const s = emptyState();
  for (const r of requirements)
    s.facts[r.id] = {
      value: "Information confirmée suffisamment détaillée.",
      source: "déclaration",
      kind: "declared",
      confirmed: true,
    };
  s.checkedRevision = 4;
  assert.equal(score(s).percent, 100);
  assert.equal(canAttest(s, 4, 1), true);
  assert.equal(canAttest(s, 5, 1), false);
  assert.equal(canAttest(s, 4, 0), false);
  s.conflicts = ["Chiffre contradictoire"];
  assert.equal(canAttest(s, 4, 1), false);
});
test("commission calculée sur encaissement net sans valeur négative", () => {
  assert.equal(affiliateAmount(14900, 0, 2000), 2980);
  assert.equal(affiliateAmount(14900, 14900, 2000), 0);
  assert.equal(affiliateAmount(14900, 20000, 2000), 0);
});
test("personnalisation ne permet pas une injection CSS", () => {
  assert.equal(validColor("#2354d1"), true);
  assert.equal(validColor("red; background:url(https://bad)"), false);
});
