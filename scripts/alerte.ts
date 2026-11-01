// Envoie une alerte d'exploitation aux administrateurs (ADMIN_EMAILS) par l'email de l'application
import { mail } from "../server/mail.ts";
const [sujet, texte = ""] = process.argv.slice(2);
if (!sujet) throw new Error("Usage : alerte.ts <sujet> [texte]");
const admins = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!admins.length) throw new Error("ADMIN_EMAILS vide : personne à prévenir");
for (const a of admins) await mail(a, "[Fund Road] " + sujet, texte);
console.log("Alerte envoyée à", admins.length, "administrateur(s)");
process.exit(0);
