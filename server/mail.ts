import nodemailer from "nodemailer";
import { db } from "./db.ts";
export const mailReady = () =>
  Boolean(process.env.SMTP_URL && process.env.MAIL_FROM);
const signature =
  "\n\n--\nFund Road · dossiers de financement sourcés\nhttps://fund-road.com · contact@fund-road.com";
export async function mail(to: string, subject: string, text: string) {
  if (!mailReady())
    throw Object.assign(
      new Error("Email non configuré. Aucun message envoyé."),
      { statusCode: 503 },
    );
  await nodemailer
    .createTransport(process.env.SMTP_URL!)
    .sendMail({ from: process.env.MAIL_FROM, to, subject, text: text + signature });
}
// Prévient les membres d'une organisation ; une notification manquée ne bloque jamais l'action
export async function notifyOrg(orgId: string, subject: string, text: string) {
  if (!mailReady()) return;
  const rows = (
    await db.query(
      'SELECT u.email FROM members m JOIN "user" u ON u.id=m.user_id WHERE m.organization_id=$1',
      [orgId],
    )
  ).rows;
  await Promise.all(
    rows.map((r) =>
      mail(r.email, subject, text).catch((e) =>
        console.error("Notification non envoyée", e.message),
      ),
    ),
  );
}
