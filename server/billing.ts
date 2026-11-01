import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { z } from "zod";
import { randomUUID, randomBytes } from "node:crypto";
import { db, transaction } from "./db.ts";
import { user, owner, member, admin, fail } from "./access.ts";
import { config } from "./config.ts";
import { attribute, reward } from "./referrals.ts";
import { netReceived, refundBalance } from "../shared/payments.ts";
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
// Clé d'organisation Stripe : le compte visé doit accompagner chaque requête v1 (l'option globale ne vaut que pour la v2)
const compte = process.env.STRIPE_CONTEXT
  ? { stripeContext: process.env.STRIPE_CONTEXT }
  : {};
export async function registerBilling(app: FastifyInstance) {
  app.get(
    "/api/offers",
    async () =>
      (
        await db.query(
          "SELECT id,label,price_cents,cadence,quota,active FROM offers ORDER BY price_cents",
        )
      ).rows,
  );
  app.get("/api/billing/:org", async (req: any) => {
    const u = await user(req);
    await owner(u.id, req.params.org);
    return {
      entitlement:
        (
          await db.query(
            "SELECT e.*,o.label AS offer_name,o.quota FROM entitlements e LEFT JOIN offers o ON o.id=e.offer_id WHERE e.organization_id=$1",
            [req.params.org],
          )
        ).rows[0] || null,
      usage: (
        await db.query(
          "SELECT count(*) AS analyses,coalesce(sum(input_tokens),0) AS input_tokens,coalesce(sum(output_tokens),0) AS output_tokens FROM usage WHERE organization_id=$1 AND created_at>=date_trunc('month',now())",
          [req.params.org],
        )
      ).rows[0],
    };
  });
  app.post("/api/billing/checkout", async (req) => {
    const u = await user(req);
    const b = z
      .object({
        organizationId: z.string().uuid(),
        offerId: z.string(),
        code: z.string().max(40).optional(),
      })
      .parse(req.body);
    await owner(u.id, b.organizationId);
    if (!stripe) fail(503, "Paiement non configuré");
    const offer = (
      await db.query("SELECT * FROM offers WHERE id=$1 AND active=true", [
        b.offerId,
      ])
    ).rows[0];
    if (!offer?.stripe_price_id)
      fail(409, "Cette offre est encore une hypothèse commerciale");
    let coupon: string | undefined;
    if (b.code) {
      const terms = await transaction((c) =>
        attribute(c, b.organizationId, b.code!),
      );
      if (terms.kind === "startup" && terms.discountBps > 0) {
        coupon = (
          await stripe!.coupons.create({
            percent_off: terms.discountBps / 100,
            duration: "once",
            name: "Parrainage Fund Road " + terms.version,
          }, compte)
        ).id;
      }
    }
    const metadata = { organizationId: b.organizationId, offerId: b.offerId };
    const session = await stripe!.checkout.sessions.create({
      mode: offer.cadence === "month" ? "subscription" : "payment",
      customer_email: u.email,
      line_items: [{ price: offer.stripe_price_id, quantity: 1 }],
      metadata,
      subscription_data: offer.cadence === "month" ? { metadata } : undefined,
      payment_intent_data: offer.cadence === "month" ? undefined : { metadata },
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: config.baseURL + "/app/facturation?success=1",
      cancel_url: config.baseURL + "/app/facturation",
    }, compte);
    return { url: session.url };
  });
  app.post("/api/billing/portal", async (req) => {
    const u = await user(req);
    const b = z.object({ organizationId: z.string().uuid() }).parse(req.body);
    await owner(u.id, b.organizationId);
    if (!stripe) fail(503, "Paiement non configuré");
    const e = (
      await db.query(
        "SELECT customer_id FROM entitlements WHERE organization_id=$1",
        [b.organizationId],
      )
    ).rows[0];
    if (!e?.customer_id) fail(409, "Aucun compte de facturation");
    return {
      url: (
        await stripe!.billingPortal.sessions.create({
          customer: e.customer_id,
          return_url: config.baseURL + "/app/facturation",
        }, compte)
      ).url,
    };
  });
  app.get("/api/partners/:org", async (req: any) => {
    const u = await user(req);
    await owner(u.id, req.params.org);
    return {
      codes: (
        await db.query(
          "SELECT c.*,p.kind,p.active,p.version,p.rate_bps,p.discount_bps FROM referral_codes c JOIN referral_programs p ON p.id=c.program_id WHERE c.organization_id=$1",
          [req.params.org],
        )
      ).rows,
      rewards: (
        await db.query(
          "SELECT id,kind,amount_cents,status,available_at,terms_version FROM rewards WHERE organization_id=$1 ORDER BY created_at DESC",
          [req.params.org],
        )
      ).rows,
    };
  });
  app.post("/api/partners/:org", async (req: any) => {
    const u = await user(req);
    await owner(u.id, req.params.org);
    const org = (
      await db.query("SELECT kind FROM organizations WHERE id=$1", [
        req.params.org,
      ])
    ).rows[0];
    const program =
      org.kind === "startup"
        ? "startup"
        : org.kind === "angel"
          ? "angel"
          : "fund";
    const existing = (
      await db.query(
        "SELECT code FROM referral_codes WHERE organization_id=$1 AND program_id=$2",
        [req.params.org, program],
      )
    ).rows[0];
    if (existing) return existing;
    const code =
      (program === "startup" ? "START-" : "FUND-") +
      randomBytes(5).toString("hex").toUpperCase();
    await db.query(
      "INSERT INTO referral_codes(code,organization_id,program_id) VALUES($1,$2,$3)",
      [code, req.params.org, program],
    );
    return { code };
  });
  app.put("/api/admin/offers/:id", async (req: any) => {
    const u = await user(req);
    admin(u);
    const b = z
      .object({
        priceCents: z.number().int().positive(),
        quota: z.number().int().positive().max(10000),
        stripePriceId: z.string().startsWith("price_"),
        active: z.boolean(),
      })
      .parse(req.body);
    if (!stripe) fail(503, "Stripe requis");
    const price = await stripe!.prices.retrieve(b.stripePriceId, {}, compte);
    if (price.currency !== "eur" || price.unit_amount !== b.priceCents)
      fail(400, "Prix Stripe différent");
    await db.query(
      "UPDATE offers SET price_cents=$2,quota=$3,stripe_price_id=$4,active=$5 WHERE id=$1",
      [req.params.id, b.priceCents, b.quota, b.stripePriceId, b.active],
    );
    return { ok: true };
  });
  app.post("/api/admin/partners/:code/approve", async (req: any) => {
    const u = await user(req);
    admin(u);
    await db.query("UPDATE referral_codes SET approved=true WHERE code=$1", [
      req.params.code,
    ]);
    return { ok: true };
  });
  app.put("/api/admin/programs/:id", async (req: any) => {
    const u = await user(req);
    admin(u);
    const b = z
      .object({
        version: z.string().min(3),
        rateBps: z.number().int().min(0).max(5000),
        discountBps: z.number().int().min(0).max(5000),
        active: z.boolean(),
      })
      .parse(req.body);
    await db.query(
      "UPDATE referral_programs SET version=$2,rate_bps=$3,discount_bps=$4,active=$5 WHERE id=$1",
      [req.params.id, b.version, b.rateBps, b.discountBps, b.active],
    );
    return { ok: true };
  });
  await app.register(async (scope) => {
    scope.removeContentTypeParser("application/json");
    scope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body),
    );
    scope.post("/api/billing/webhook", async (req: any, reply) => {
      if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET)
        fail(503, "Webhook non configuré");
      let event: Stripe.Event;
      try {
        event = stripe!.webhooks.constructEvent(
          req.body,
          req.headers["stripe-signature"],
          process.env.STRIPE_WEBHOOK_SECRET!,
        );
      } catch {
        return reply.code(400).send({ error: "Signature invalide" });
      }
      await transaction(async (c) => {
        const inserted = await c.query(
          "INSERT INTO payment_events(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id",
          [event.id],
        );
        if (!inserted.rowCount) return;
        const object = event.data.object as any;
        if (
          event.type === "checkout.session.completed" &&
          object.payment_status === "paid"
        ) {
          const m = object.metadata;
          if (!m?.organizationId || !m?.offerId)
            throw new Error("Métadonnées paiement manquantes");
          const offer = (
            await c.query("SELECT * FROM offers WHERE id=$1", [m.offerId])
          ).rows[0];
          await c.query(
            "INSERT INTO entitlements(organization_id,offer_id,status,customer_id,subscription_id,expires_at) VALUES($1,$2,'active',$3,$4,now()+interval '90 days') ON CONFLICT(organization_id) DO UPDATE SET offer_id=$2,status='active',customer_id=$3,subscription_id=$4,expires_at=EXCLUDED.expires_at",
            [m.organizationId, m.offerId, object.customer, object.subscription],
          );
          if (offer.cadence === "once")
            await reward(
              c,
              m.organizationId,
              object.payment_intent,
              object.amount_total - (object.total_details?.amount_tax || 0),
            );
        }
        if (event.type === "invoice.paid") {
          const subscriptionId =
            object.subscription ||
            object.parent?.subscription_details?.subscription;
          const sub = subscriptionId
            ? await stripe!.subscriptions.retrieve(subscriptionId, {}, compte)
            : null;
          const m = sub?.metadata;
          if (m?.organizationId) {
            const period = object.lines?.data?.[0]?.period?.end;
            await c.query(
              "UPDATE entitlements SET status='active',expires_at=to_timestamp($2) WHERE organization_id=$1",
              [
                m.organizationId,
                period || Math.floor(Date.now() / 1000) + 86400 * 30,
              ],
            );
            await reward(
              c,
              m.organizationId,
              object.payment_intent || object.id,
              netReceived(
                object.amount_paid,
                object.total,
                object.total_taxes?.reduce(
                  (sum: number, t: any) => sum + t.amount,
                  0,
                ) ||
                  object.tax ||
                  0,
              ),
            );
          }
        }
        if (event.type === "customer.subscription.deleted")
          await c.query(
            "UPDATE entitlements SET status='cancelled',expires_at=now() WHERE subscription_id=$1",
            [object.id],
          );
        if (event.type === "invoice.payment_failed")
          await c.query(
            "UPDATE entitlements SET status='past_due' WHERE customer_id=$1",
            [object.customer],
          );
        if (event.type === "charge.refunded") {
          const rows = (
            await c.query(
              "SELECT * FROM rewards WHERE source_id=$1 FOR UPDATE",
              [object.payment_intent],
            )
          ).rows;
          for (const r of rows) {
            const balance = refundBalance(
              r.paid_cents,
              r.refunded_cents,
              object.amount,
              object.amount_refunded,
              r.rate_bps,
            );
            await c.query(
              "UPDATE rewards SET amount_cents=$2,refunded_cents=$3,status=CASE WHEN $2=0 THEN 'cancelled' ELSE status END WHERE id=$1",
              [r.id, balance.amount, balance.refundedNet],
            );
          }
        }
      });
      return { received: true };
    });
  });
}
