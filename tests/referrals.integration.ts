import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../server/db.ts";
import { attribute, reward } from "../server/referrals.ts";
test("affiliation : conditions figées, bénéfice au fonds, doublons et auto-parrainage", async () => {
  const c = await db.connect();
  await c.query("BEGIN");
  try {
    const fund = randomUUID(),
      buyer = randomUUID(),
      self = randomUUID(),
      program = "test-" + randomUUID(),
      code = ("TEST-" + randomUUID()).toUpperCase();
    for (const [id, kind] of [
      [fund, "fund"],
      [buyer, "startup"],
      [self, "startup"],
    ])
      await c.query(
        "INSERT INTO organizations(id,name,kind,slug) VALUES($1,$2,$3,$4)",
        [id, "Fixture affiliation", kind, id],
      );
    await c.query(
      "INSERT INTO members(organization_id,user_id,role) VALUES($1,'fixture-same-member','owner'),($2,'fixture-same-member','owner')",
      [fund, self],
    );
    await c.query(
      "INSERT INTO referral_programs(id,kind,version,rate_bps,discount_bps,months,hold_days,active) VALUES($1,'fund','terms-test-v1',2000,0,12,30,true)",
      [program],
    );
    await c.query(
      "INSERT INTO referral_codes(code,organization_id,program_id,approved) VALUES($1,$2,$3,true)",
      [code, fund, program],
    );
    await assert.rejects(attribute(c, self, code), /Auto-parrainage/);
    const terms = await attribute(c, buyer, code);
    assert.equal(terms.beneficiaryId, fund);
    await c.query(
      "UPDATE referral_programs SET rate_bps=500,version='terms-test-v2',active=false WHERE id=$1",
      [program],
    );
    assert.equal((await attribute(c, buyer, code)).rateBps, 2000);
    await assert.rejects(
      attribute(c, buyer, "DIFFERENT"),
      /attribution existe/,
    );
    const source = "payment-test-" + randomUUID();
    await reward(c, buyer, source, 10000);
    await reward(c, buyer, source, 10000);
    const rows = (
      await c.query("SELECT * FROM rewards WHERE source_id=$1", [source])
    ).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].amount_cents, 2000);
    assert.equal(rows[0].organization_id, fund);
    assert.equal(rows[0].terms_version, "terms-test-v1");
    assert.equal(rows[0].kind, "commission");
    const attribution = (
      await c.query(
        "SELECT started_at FROM attributions WHERE organization_id=$1",
        [buyer],
      )
    ).rows[0];
    assert.ok(attribution.started_at);
    await c.query(
      "INSERT INTO entitlements(organization_id,offer_id,status) VALUES($1,'dossier','active')",
      [buyer],
    );
    await assert.rejects(attribute(c, buyer, code), /nouveaux clients/);
  } finally {
    await c.query("ROLLBACK");
    c.release();
    await db.end();
  }
});
