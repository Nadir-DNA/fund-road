import { config } from "./config.ts";

type Requete = { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> };

export type Droit = {
  offer_id: string;
  label: string;
  cadence: string;
  quota: number;
  startups: number;
  status: string;
  expires_at: string | null;
  customer_id: string | null;
  // organisation qui porte l'achat (différente de l'organisation consultée si elle est couverte par une offre multi-startup)
  holder_org: string;
  holder_name: string;
  // payant : offre à prix non nul, abonnement en cours ou achat unique
  paid: boolean;
};

// Définition unique du droit actif d'une organisation :
// 1. son propre droit, actif et non expiré ;
// 2. sinon, une offre multi-startup achetée par l'un de ses propriétaires, qui couvre
//    ses startups dans la limite de l'offre (l'organisation qui a payé d'abord, puis par ancienneté).
const DROIT = `
SELECT e.offer_id,f.label,f.cadence,f.quota,f.startups,e.status,e.expires_at,e.customer_id,
       e.organization_id AS holder_org,h.name AS holder_name,
       (f.price_cents>0 AND (e.subscription_id IS NOT NULL OR f.cadence='once')) AS paid
  FROM entitlements e
  JOIN offers f ON f.id=e.offer_id
  JOIN organizations h ON h.id=e.organization_id
 WHERE e.status='active' AND (e.expires_at IS NULL OR e.expires_at>now())
   AND (e.organization_id=$1 OR (
        f.startups>1 AND e.buyer_user_id IS NOT NULL AND $1 IN (
          SELECT x.id FROM (
            SELECT o.id,row_number() OVER (ORDER BY (o.id=e.organization_id) DESC,o.created_at,o.id) AS rang
              FROM organizations o JOIN members m ON m.organization_id=o.id
             WHERE m.user_id=e.buyer_user_id AND m.role='owner' AND o.kind='startup'
          ) x WHERE x.rang<=f.startups)))
 ORDER BY (e.organization_id=$1) DESC
 LIMIT 1`;

export async function droitActif(q: Requete, organizationId: string): Promise<Droit | null> {
  return (await q.query(DROIT, [organizationId])).rows[0] || null;
}

// Startups couvertes par l'achat multi-startup que porte cette organisation (vide sinon)
export async function startupsCouvertes(q: Requete, holderOrg: string) {
  return (
    await q.query(
      `SELECT x.id,x.name FROM entitlements e JOIN offers f ON f.id=e.offer_id,
         LATERAL (
           SELECT o.id,o.name,row_number() OVER (ORDER BY (o.id=e.organization_id) DESC,o.created_at,o.id) AS rang
             FROM organizations o JOIN members m ON m.organization_id=o.id
            WHERE m.user_id=e.buyer_user_id AND m.role='owner' AND o.kind='startup'
         ) x
        WHERE e.organization_id=$1 AND f.startups>1 AND e.buyer_user_id IS NOT NULL
          AND e.status='active' AND (e.expires_at IS NULL OR e.expires_at>now())
          AND x.rang<=f.startups
        ORDER BY x.rang`,
      [holderOrg],
    )
  ).rows as { id: string; name: string }[];
}

// Quota d'analyses complètes par mois pour une startup : celui de son droit, sinon l'offre gratuite
export const quotaDe = (droit: Droit | null) =>
  droit?.quota ?? (config.production ? config.freeQuota : config.pilotQuota);

// Analyses complètes lancées ce mois-ci pour l'organisation (en cours ou réussies)
export async function analysesDuMois(q: Requete, organizationId: string) {
  return Number(
    (
      await q.query(
        "SELECT count(*) FROM jobs j JOIN dossiers d ON d.id=j.dossier_id WHERE d.organization_id=$1 AND j.kind='analysis' AND j.status IN ('queued','running','done') AND j.created_at>=date_trunc('month',now())",
        [organizationId],
      )
    ).rows[0].count,
  );
}

// Un prix Stripe doit correspondre à la cadence de l'offre : un abonnement trimestriel exige un prix récurrent tous les 3 mois
export function prixCompatible(
  cadence: string,
  price: { recurring?: { interval: string; interval_count: number } | null },
) {
  const r = price.recurring;
  if (cadence === "once") return !r;
  if (cadence === "month") return r?.interval === "month" && r.interval_count === 1;
  if (cadence === "quarter") return r?.interval === "month" && r.interval_count === 3;
  return false;
}
