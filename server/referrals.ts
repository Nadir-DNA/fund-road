import { z } from "zod";
import type { PoolClient } from "pg";
import { randomUUID } from "node:crypto";
import { affiliateAmount } from "../shared/domain.ts";
import { fail } from "./access.ts";
export const termsSchema = z.object({
  version: z.string().min(3),
  kind: z.enum(["startup", "fund", "angel"]),
  beneficiaryId: z.string().uuid(),
  rateBps: z.number().int().min(0).max(5000),
  discountBps: z.number().int().min(0).max(5000),
  months: z.number().int().min(1).max(120),
  holdDays: z.number().int().min(0).max(365),
});
export type ReferralTerms = z.infer<typeof termsSchema>;
export function termsFromProgram(p: any): ReferralTerms {
  return termsSchema.parse({
    version: p.version,
    kind: p.kind,
    beneficiaryId: p.organization_id,
    rateBps: p.rate_bps,
    discountBps: p.discount_bps,
    months: p.months,
    holdDays: p.hold_days,
  });
}
export async function attribute(
  c: PoolClient,
  buyer: string,
  codeValue: string,
) {
  const code = codeValue.toUpperCase();
  await c.query("SELECT id FROM organizations WHERE id=$1 FOR UPDATE", [buyer]);
  if (
    (
      await c.query("SELECT 1 FROM entitlements WHERE organization_id=$1", [
        buyer,
      ])
    ).rowCount
  )
    fail(400, "Code réservé aux nouveaux clients");
  const existing = (
    await c.query("SELECT * FROM attributions WHERE organization_id=$1", [
      buyer,
    ])
  ).rows[0];
  if (existing) {
    if (existing.code !== code) fail(409, "Une attribution existe déjà");
    if (!existing.terms) fail(409, "Attribution historique à vérifier");
    return termsSchema.parse(existing.terms);
  }
  const program = (
    await c.query(
      "SELECT c.organization_id,p.* FROM referral_codes c JOIN referral_programs p ON p.id=c.program_id WHERE c.code=$1 AND c.approved=true AND p.active=true",
      [code],
    )
  ).rows[0];
  if (!program || program.organization_id === buyer)
    fail(400, "Code non éligible");
  const shared = (
    await c.query(
      "SELECT 1 FROM members a JOIN members b ON a.user_id=b.user_id WHERE a.organization_id=$1 AND b.organization_id=$2",
      [program.organization_id, buyer],
    )
  ).rowCount;
  if (shared) fail(400, "Auto-parrainage non autorisé");
  if (
    (
      await c.query("SELECT 1 FROM entitlements WHERE organization_id=$1", [
        buyer,
      ])
    ).rowCount
  )
    fail(400, "Code réservé aux nouveaux clients");
  const terms = termsFromProgram(program);
  await c.query(
    "INSERT INTO attributions(organization_id,code,terms) VALUES($1,$2,$3)",
    [buyer, code, terms],
  );
  return terms;
}
export async function reward(
  c: PoolClient,
  buyer: string,
  source: string,
  amount: number,
) {
  if (!Number.isSafeInteger(amount) || amount <= 0 || !source) return;
  const attribution = (
    await c.query(
      "SELECT a.* FROM attributions a JOIN referral_codes c ON c.code=a.code WHERE a.organization_id=$1 AND c.approved=true FOR UPDATE OF a",
      [buyer],
    )
  ).rows[0];
  if (!attribution?.terms) return;
  const terms = termsSchema.parse(attribution.terms);
  // A program edit affects future attributions only; the paid period begins at first collection.
  const active = (
    await c.query(
      "UPDATE attributions SET started_at=COALESCE(started_at,now()) WHERE organization_id=$1 AND (started_at IS NULL OR started_at+($2||' months')::interval>now()) RETURNING organization_id",
      [buyer, terms.months],
    )
  ).rowCount;
  if (!active) return;
  const rate = terms.kind === "startup" ? terms.discountBps : terms.rateBps;
  await c.query(
    "INSERT INTO rewards(id,source_id,organization_id,buyer_org,kind,paid_cents,amount_cents,rate_bps,available_at,terms_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,now()+($9||' days')::interval,$10) ON CONFLICT(source_id) DO NOTHING",
    [
      randomUUID(),
      source,
      terms.beneficiaryId,
      buyer,
      terms.kind === "startup" ? "discount" : "commission",
      amount,
      affiliateAmount(amount, 0, rate),
      rate,
      terms.holdDays,
      terms.version,
    ],
  );
}
