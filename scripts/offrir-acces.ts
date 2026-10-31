// Offre « Pilote offert » (0 €, 50 analyses) aux organisations d'un compte, sans passer par Stripe.
//   npx tsx --env-file=.env.local scripts/offrir-acces.ts personne@exemple.fr [jours=90]
// Pour les pilotes et l'équipe ; l'attribution est visible dans la table entitlements et dans Facturation.
import { db } from "../server/db.ts";

const [email, jours = "90"] = process.argv.slice(2);
if (!email) throw new Error("Usage : offrir-acces.ts <email> [jours]");
const orgs = (
  await db.query(
    'SELECT o.id, o.name FROM organizations o JOIN members m ON m.organization_id=o.id JOIN "user" u ON u.id=m.user_id WHERE lower(u.email)=lower($1) AND m.role=\'owner\'',
    [email],
  )
).rows;
if (!orgs.length) throw new Error("Aucune organisation dont ce compte est propriétaire");
for (const o of orgs) {
  // une offre payée déjà active n'est jamais remplacée
  const r = await db.query(
    `INSERT INTO entitlements(organization_id,offer_id,status,expires_at) VALUES($1,'pilote','active',now()+make_interval(days => $2))
     ON CONFLICT(organization_id) DO UPDATE SET offer_id='pilote',status='active',expires_at=EXCLUDED.expires_at
     WHERE entitlements.offer_id='pilote' OR entitlements.status<>'active' OR entitlements.expires_at<now()`,
    [o.id, Number(jours)],
  );
  console.log(`${r.rowCount ? "✓" : "· offre payée active, inchangée :"} ${o.name}`);
}
await db.end();
