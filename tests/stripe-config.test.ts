import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
function validate(secret: string, context?: string) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      'await import("./server/config.ts")',
    ],
    {
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        DATABASE_URL: "postgres://unused",
        BETTER_AUTH_SECRET: "test-only-unused-secret-32-characters",
        STRIPE_SECRET_KEY: secret,
        ...(context ? { STRIPE_CONTEXT: context } : {}),
      },
    },
  );
}
test("clé organisation refusée sans compte cible explicite", () => {
  const result = validate("sk_org_fixture");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /STRIPE_CONTEXT requis/);
});
test("contexte Stripe ne permet pas de viser une organisation ou une chaîne de comptes", () => {
  assert.notEqual(validate("sk_org_fixture", "org_fixture").status, 0);
  assert.notEqual(validate("sk_org_fixture", "acct_one/acct_two").status, 0);
});
test("clé compte et clé organisation contextualisée acceptées", () => {
  assert.equal(validate("sk_test_fixture").status, 0);
  assert.equal(validate("sk_org_fixture", "acct_fixture").status, 0);
});
