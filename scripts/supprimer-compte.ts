// Suppression d'un compte sur demande (droit à l'effacement), par un administrateur.
//   npx tsx --env-file=.env.local scripts/supprimer-compte.ts personne@exemple.fr --confirmer
// Efface les dossiers et documents des organisations dont la personne est seule membre, ses appartenances,
// ses notes et son compte. Les données de facturation sont conservées (obligation comptable).
import { db } from "../server/db.ts";
import { supprimerCompte } from "../server/donnees.ts";

const [email] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!email || !process.argv.includes("--confirmer"))
  throw new Error("Usage : supprimer-compte.ts <email> --confirmer (suppression définitive)");
const b = await supprimerCompte(email);
await db.end();
console.log(`Compte supprimé : ${b.dossiers} dossier(s) effacé(s), ${b.organisations} organisation(s) anonymisée(s).`);
