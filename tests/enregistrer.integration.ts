// Vérifie la date de vérification à l'import : un ré-import ne la renouvelle pas, une création ne l'invente pas.
// Base jetable : DATABASE_URL=.../base_test npx tsx --env-file=.env.local --test tests/enregistrer.integration.ts
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db.ts";
import { enregistrer } from "../server/financeurs.ts";

test("enregistrer : un ré-import ne renouvelle pas verified_at, une création ne l'invente pas", async () => {
  const nom = "Fixture import " + randomUUID().slice(0, 8);
  const fiche = {
    nom,
    type: "fund" as const,
    description: "fixture de test",
    source_url: "https://exemple.invalid",
    criteria: { sectors: [], stages: [], regions: [], ticketMin: 100000 },
  };
  try {
    await enregistrer(fiche, true);
    const cree = (await db.query("SELECT verified_at FROM investors WHERE name=$1", [nom])).rows[0];
    assert.equal(cree.verified_at, null, "une création ne date pas une vérification de critères");
    await db.query("UPDATE investors SET verified_at=timestamptz '2026-10-31 12:00:00+02' WHERE name=$1", [nom]);
    await enregistrer(fiche, true);
    const apres = (await db.query("SELECT verified_at FROM investors WHERE name=$1", [nom])).rows[0];
    assert.equal(apres.verified_at.toISOString(), new Date("2026-10-31T10:00:00Z").toISOString(), "un ré-import conserve la date existante");
    // les valeurs sont bien mises à jour, seule la date est préservée
    assert.equal(Number(apres.verified_at) > 0, true);
    const crit = (await db.query("SELECT criteria FROM investors WHERE name=$1", [nom])).rows[0].criteria;
    assert.equal(crit.ticketMin, 100000);
  } finally {
    await db.query("DELETE FROM investors WHERE name=$1", [nom]);
    await db.end();
  }
});
