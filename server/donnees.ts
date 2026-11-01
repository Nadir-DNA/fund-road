// Suppression des données personnelles : un dossier (libre-service) ou tout un compte (sur demande).
// Les données de facturation (droits, paiements, commissions) sont conservées : obligation comptable.
import { unlink } from "node:fs/promises";
import type pg from "pg";
import { transaction } from "./db.ts";

// Efface un dossier et tout ce qui en dépend ; renvoie les fichiers à retirer du disque après validation
async function effacerDossier(c: pg.PoolClient, id: string) {
  const fichiers = (await c.query("SELECT path FROM documents WHERE dossier_id=$1", [id])).rows.map((r) => r.path);
  // invitations, questions et partages pointent vers le dossier sans suppression en cascade
  await c.query("DELETE FROM invitations WHERE dossier_id=$1", [id]);
  await c.query("DELETE FROM questions WHERE application_id IN (SELECT id FROM applications WHERE dossier_id=$1)", [id]);
  await c.query("DELETE FROM dossiers WHERE id=$1", [id]);
  return fichiers;
}
const retirer = (fichiers: string[]) => Promise.all(fichiers.map((f) => unlink(f).catch(() => {})));

export async function supprimerDossier(id: string) {
  await retirer(await transaction((c) => effacerDossier(c, id)));
}

// Compte : dossiers des organisations dont la personne est seule membre, appartenances, notes, puis le compte.
// Une organisation restée sans membre est anonymisée et retirée de l'annuaire, pas supprimée (facturation).
export async function supprimerCompte(email: string) {
  const bilan = { dossiers: 0, organisations: 0 };
  const fichiers = await transaction(async (c) => {
    const u = (await c.query('SELECT id FROM "user" WHERE lower(email)=lower($1)', [email])).rows[0];
    if (!u) throw new Error("Aucun compte avec cette adresse");
    const seules = (
      await c.query(
        "SELECT organization_id FROM members m WHERE user_id=$1 AND NOT EXISTS (SELECT 1 FROM members o WHERE o.organization_id=m.organization_id AND o.user_id<>$1)",
        [u.id],
      )
    ).rows.map((r) => r.organization_id);
    const aRetirer: string[] = [];
    for (const org of seules) {
      for (const d of (await c.query("SELECT id FROM dossiers WHERE organization_id=$1", [org])).rows) {
        aRetirer.push(...(await effacerDossier(c, d.id)));
        bilan.dossiers++;
      }
      await c.query("DELETE FROM invitations WHERE organization_id=$1", [org]);
      await c.query(
        "UPDATE organizations SET name='Organisation supprimée', theme='{}', criteria='{}', logo=NULL WHERE id=$1",
        [org],
      );
      bilan.organisations++;
    }
    await c.query("DELETE FROM notes WHERE author_id=$1", [u.id]);
    await c.query("DELETE FROM contributors WHERE user_id=$1", [u.id]);
    await c.query("DELETE FROM members WHERE user_id=$1", [u.id]);
    await c.query("DELETE FROM verification WHERE identifier=$1", [email.toLowerCase()]);
    // sessions, identifiants et double authentification suivent en cascade
    await c.query('DELETE FROM "user" WHERE id=$1', [u.id]);
    return aRetirer;
  });
  await retirer(fichiers);
  return bilan;
}
