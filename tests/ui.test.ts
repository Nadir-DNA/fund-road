import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const ui = await import("../shared/ui.ts");

// A5b — bouton groupé : seules les propositions relues et non vides sont confirmées
test("A5b.1/A5b.2 : seules les propositions non confirmées et non vides sont retenues", () => {
  const facts = {
    company: { value: "Fondée en 2024 à Lyon", source: "document:abc" },
    team: { value: "Deux fondateurs", source: "document:abc", confirmed: true },
    market: { value: "   ", source: "document:abc" },
    solution: { value: "Saisie à la main", source: "declaration:user" },
    traction: { value: "12 clients payants", source: "ai" },
  };
  assert.deepEqual(
    ui.propositionsRelues(facts, ["company", "team", "market", "solution", "traction"]),
    ["company", "traction"],
  );
  // aucune rubrique inventée : un identifiant absent ne crée rien
  assert.deepEqual(ui.propositionsRelues(facts, ["inconnue"]), []);
  assert.deepEqual(ui.propositionsRelues(undefined, ["company"]), []);
});

test("A5b.4 : plus rien à confirmer quand tout est confirmé ou vide", () => {
  assert.deepEqual(
    ui.propositionsRelues(
      { company: { value: "x", confirmed: true }, team: { value: "" } },
      ["company", "team"],
    ),
    [],
  );
});

// A15 — onglet du dossier dans l'URL
test("A15.1/A15.2 : onglet lu dans l'URL, valeur inconnue ramenée à la vue d'ensemble", () => {
  assert.equal(ui.ongletDepuisUrl("?onglet=questions"), "questions");
  assert.equal(ui.ongletDepuisUrl("?onglet=documents"), "documents");
  assert.equal(ui.ongletDepuisUrl("?onglet=apercu"), "overview");
  assert.equal(ui.ongletDepuisUrl("?onglet=partage"), "share");
  assert.equal(ui.ongletDepuisUrl("?onglet=nimporte-quoi"), "overview");
  assert.equal(ui.ongletDepuisUrl(""), "overview");
  assert.equal(ui.ongletDepuisUrl("?autre=1"), "overview");
});

test("A15.3 : la vue d'ensemble ne traîne pas de paramètre inutile", () => {
  assert.deepEqual(ui.parametresOnglet("overview"), {});
  assert.deepEqual(ui.parametresOnglet("questions"), { onglet: "questions" });
});

// A16 — aucun statut technique rendu tel quel
test("A16.1 : les statuts sont traduits, jamais affichés bruts", () => {
  for (const brut of ["queued", "running", "done", "failed"]) {
    assert.notEqual(ui.libelleJob("analysis", brut), brut);
    assert.ok(ui.libelleJob("analysis", brut).startsWith("Analyse IA :"));
  }
  assert.equal(ui.libelleJob("extract", "done"), "Extraction : terminée");
  assert.equal(ui.libelleJob("analysis", "statut-inconnu"), "Analyse IA : état inconnu");
  for (const brut of ["pending", "available", "used", "expired", "refunded"]) {
    assert.notEqual(ui.libelleRecompense(brut), brut);
  }
  assert.equal(ui.libelleRecompense(undefined), "À vérifier");
  for (const brut of ["active", "past_due", "cancelled", "expired"]) {
    assert.notEqual(ui.libelleDroit(brut), brut);
  }
  assert.equal(ui.libelleDroit(undefined), "À vérifier");
});

test("A16.1 : aucun confirm() natif dans l'application", () => {
  const source = readFileSync(new URL("../app/main.tsx", import.meta.url), "utf8");
  assert.equal(source.includes("confirm("), false, "confirm() natif encore présent");
  assert.ok(source.includes("ConfirmDialog"), "confirmation dans l'application absente");
});

// A20 — annuaire : compteur et tri, ticket inconnu hors du tri numérique
const financeur = (name: string, ticketMin?: number, verifiedAt?: string) => ({
  name,
  theme: { name },
  criteria: ticketMin === undefined ? {} : { ticketMin },
  verifiedAt,
});
test("A20.2 : tri stable, ticket inconnu après les tickets connus", () => {
  const rows = [
    financeur("Zeta", undefined),
    financeur("Alpha", 500000),
    financeur("Beta", 50000),
  ];
  assert.deepEqual(
    ui.trierAnnuaire(rows, "ticket-asc").map((r) => r.name),
    ["Beta", "Alpha", "Zeta"],
  );
  assert.deepEqual(
    ui.trierAnnuaire(rows, "ticket-desc").map((r) => r.name),
    ["Alpha", "Beta", "Zeta"],
  );
  assert.deepEqual(
    ui.trierAnnuaire(rows, "nom").map((r) => r.name),
    ["Alpha", "Beta", "Zeta"],
  );
  // un ticket à 0 n'est pas une valeur connue
  assert.equal(ui.ticketConnu(financeur("Zero", 0)), null);
  assert.equal(ui.ticketConnu(financeur("Vide")), null);
});

test("A20.1 : tri par date de vérification, inconnue en dernier", () => {
  const rows = [
    financeur("Ancien", 1, "2025-01-05T00:00:00Z"),
    financeur("Sans date", 1),
    financeur("Récent", 1, "2026-02-01T00:00:00Z"),
  ];
  assert.deepEqual(
    ui.trierAnnuaire(rows, "verification").map((r) => r.name),
    ["Récent", "Ancien", "Sans date"],
  );
});

// A17 — recherche des programmes
const programme = (name: string, operator: string, kind: string) => ({
  name,
  operator,
  kind,
  summary: "",
});
test("A17.2 : recherche libre et message quand rien ne correspond", () => {
  const list = [
    programme("i-Lab", "Bpifrance", "Concours"),
    programme("Prêt d’honneur", "Réseau Entreprendre", "Prêt"),
  ];
  assert.equal(ui.filtrerProgrammes(list, "i-Lab").length, 1);
  assert.equal(ui.filtrerProgrammes(list, "bpifrance").length, 1);
  assert.equal(ui.filtrerProgrammes(list, "inexistant").length, 0);
  assert.equal(ui.filtrerProgrammes(list, "").length, 2);
});

test("A17.3 : suggestions cohérentes avec l'objectif du dossier", () => {
  const list = [
    programme("Fonds propres", "X", "Subvention et fonds propres"),
    programme("Subvention innovation", "Y", "Subvention"),
    programme("Prêt relais", "Z", "Prêt"),
  ];
  assert.equal(ui.trierProgrammes(list, "investment")[0].name, "Fonds propres");
  assert.equal(ui.trierProgrammes(list, "grant")[0].name, "Subvention innovation");
});

// A5b.2 — un conflit bloque la confirmation groupée
test("A5b.2 : aucune confirmation en lot tant qu’une contradiction n’est pas tranchée", () => {
  const facts = {
    company: { value: "Fondée en 2024", source: "document:abc" },
    team: { value: "Deux fondateurs", source: "document:abc" },
  };
  assert.deepEqual(ui.confirmationEnLot(facts, ["company", "team"], 0), [
    "company",
    "team",
  ]);
  assert.deepEqual(ui.confirmationEnLot(facts, ["company", "team"], 1), []);
  assert.deepEqual(ui.confirmationEnLot(undefined, ["company"], 2), []);
});

// A10 — pipeline financeur : recherche, tri, export identique à l'écran
const ligne = (startup: string, fit: number | null, date: string) => ({
  startup,
  name: startup + " SAS",
  score: { percent: 50 },
  fit: fit === null ? null : { percent: fit, verdict: "eligible" },
  stage: "new",
  created_at: date,
  source: "application",
});
test("A10.3 : recherche et tri du pipeline", () => {
  const rows = [
    ligne("Alpha", 40, "2026-11-01T00:00:00Z"),
    ligne("Beta", 90, "2026-11-05T00:00:00Z"),
    ligne("Gamma", null, "2026-11-03T00:00:00Z"),
  ];
  assert.deepEqual(
    ui.filtrerPipeline(rows, "bet").map((r) => r.startup),
    ["Beta"],
  );
  assert.equal(ui.filtrerPipeline(rows, "").length, 3);
  assert.deepEqual(
    ui.trierPipeline(rows, "fit").map((r) => r.startup),
    ["Beta", "Alpha", "Gamma"],
  );
  assert.deepEqual(
    ui.trierPipeline(rows, "date").map((r) => r.startup),
    ["Beta", "Gamma", "Alpha"],
  );
  assert.deepEqual(
    ui.trierPipeline(rows, "nom").map((r) => r.startup),
    ["Alpha", "Beta", "Gamma"],
  );
});

test("A10.3 : l'export CSV reprend exactement les lignes affichées", () => {
  const rows = [ligne("Alpha", 40, "2026-11-01T00:00:00Z")];
  const lignes = ui.csvPipeline(rows).split("\n");
  assert.equal(lignes.length, 2);
  assert.ok(lignes[0].includes("Startup"));
  assert.ok(lignes[1].includes('"Alpha"'));
  assert.ok(lignes[1].includes('"50"'));
  assert.equal(ui.csvPipeline([]).split("\n").length, 1);
});

// A9.1 — deux profils × présence d'un droit payant
test("A9.1 : le menu d'une startup est inchangé", () => {
  const menu = ui.menuPour("startup", false).map(([to]: any) => to);
  assert.deepEqual(menu, [
    "/app",
    "/app/dossiers",
    "/app/candidatures",
    "/app/annuaire",
    "/app/portail",
    "/app/partenaires",
    "/app/facturation",
    "/app/securite",
  ]);
  assert.deepEqual(ui.menuPour("startup", true).map(([to]: any) => to), menu);
});

test("A9.1 : un financeur sans droit payant ne voit pas la facturation", () => {
  const menu = ui.menuPour("fund", false).map(([to]: any) => to);
  assert.deepEqual(menu, ["/app", "/app/candidatures", "/app/portail", "/app/securite"]);
  assert.ok(!menu.includes("/app/dossiers"));
  assert.ok(!menu.includes("/app/annuaire"));
  assert.ok(!menu.includes("/app/partenaires"));
  assert.ok(!menu.includes("/app/facturation"));
});

test("A9.1 : un financeur avec droit payant voit la facturation en dernier", () => {
  const menu = ui.menuPour("fund", true).map(([to]: any) => to);
  assert.deepEqual(menu, [
    "/app",
    "/app/candidatures",
    "/app/portail",
    "/app/securite",
    "/app/facturation",
  ]);
  // tous les types de financeur suivent la même règle
  for (const kind of ["angel", "network", "grant", "incubator"])
    assert.deepEqual(ui.menuPour(kind, false).map(([to]: any) => to), [
      "/app",
      "/app/candidatures",
      "/app/portail",
      "/app/securite",
    ]);
});
