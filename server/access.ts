import { db } from "./db.ts";
import { auth } from "./auth.ts";
export const fail = (statusCode: number, message: string): never => {
  throw Object.assign(new Error(message), { statusCode });
};
export async function user(req: any) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = await auth.api.getSession({ headers });
  if (!s) fail(401, "Connectez-vous pour continuer");
  return s!.user;
}
export async function member(uid: string, org: string, write = false) {
  const r = (
    await db.query(
      "SELECT * FROM members WHERE user_id=$1 AND organization_id=$2",
      [uid, org],
    )
  ).rows[0];
  if (!r || (write && r.role === "reviewer")) fail(403, "Accès non autorisé");
  return r;
}
export async function owner(uid: string, org: string) {
  const m = await member(uid, org);
  if (m.role !== "owner") fail(403, "Action réservée au propriétaire");
}
export async function dossier(uid: string, id: string, write = false) {
  const d = (await db.query("SELECT * FROM dossiers WHERE id=$1", [id]))
    .rows[0];
  if (!d) fail(404, "Dossier introuvable");
  const m = (
    await db.query(
      "SELECT role FROM members WHERE user_id=$1 AND organization_id=$2",
      [uid, d.organization_id],
    )
  ).rows[0];
  const c = (
    await db.query(
      "SELECT role FROM contributors WHERE user_id=$1 AND dossier_id=$2",
      [uid, id],
    )
  ).rows[0];
  if ((!m && !c) || (write && (m?.role || c?.role) === "reviewer"))
    fail(403, "Accès non autorisé");
  return d;
}
export function admin(u: any) {
  if (
    !(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .includes(u.email.toLowerCase()) ||
    !u.twoFactorEnabled
  )
    fail(403, "Administrateur avec double authentification requis");
}
