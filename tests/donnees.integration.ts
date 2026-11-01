// Droit à l'effacement, sur une base réelle : npx tsx --env-file=.env.local --test tests/donnees.integration.ts
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { db } from "../server/db.ts";
import { supprimerCompte, supprimerDossier } from "../server/donnees.ts";

const dossierComplet = async (org: string) => {
  const d = randomUUID(), v = randomUUID(), a = randomUUID();
  const fichier = path.join(mkdtempSync(path.join(tmpdir(), "fr-")), "doc");
  writeFileSync(fichier, "relevé bancaire");
  await db.query("INSERT INTO dossiers(id,organization_id,name,goal) VALUES($1,$2,'Test effacement','investment')", [d, org]);
  await db.query("INSERT INTO documents(id,dossier_id,name,sha256,path,bytes) VALUES($1,$2,'releve.pdf','x',$3,15)", [randomUUID(), d, fichier]);
  await db.query("INSERT INTO versions(id,dossier_id,revision,snapshot) VALUES($1,$2,1,'{}')", [v, d]);
  await db.query("INSERT INTO applications(id,dossier_id,version_id,recipient_email,status) VALUES($1,$2,$3,'fonds@exemple.fr','sent')", [a, d, v]);
  await db.query("INSERT INTO questions(id,dossier_id,body,application_id) VALUES($1,$2,'Q',$3)", [randomUUID(), d, a]);
  await db.query("INSERT INTO invitations(id,organization_id,dossier_id,email,role,token_hash,expires_at) VALUES($1,$2,$3,'x@exemple.fr','editor',$4,now())", [randomUUID(), org, d, randomUUID()]);
  return { d, fichier };
};
const orga = async () => {
  const id = randomUUID();
  await db.query("INSERT INTO organizations(id,name,kind,slug) VALUES($1,'Effacement test','startup',$2)", [id, "eff-" + id]);
  return id;
};

test("un dossier supprimé ne laisse ni ligne ni fichier", async () => {
  const org = await orga();
  const { d, fichier } = await dossierComplet(org);
  await supprimerDossier(d);
  for (const t of ["dossiers WHERE id", "documents WHERE dossier_id", "versions WHERE dossier_id", "applications WHERE dossier_id", "questions WHERE dossier_id", "invitations WHERE dossier_id"])
    assert.equal((await db.query(`SELECT 1 FROM ${t}=$1`, [d])).rowCount, 0, t);
  assert.equal(existsSync(fichier), false);
});

test("un compte supprimé efface ses dossiers et anonymise son organisation", async () => {
  const org = await orga();
  const uid = randomUUID(), email = `eff-${uid}@exemple.test`;
  await db.query('INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,\'Test\',$2,true,now(),now())', [uid, email]);
  await db.query("INSERT INTO members(organization_id,user_id,role) VALUES($1,$2,'owner')", [org, uid]);
  const { d, fichier } = await dossierComplet(org);
  assert.deepEqual(await supprimerCompte(email), { dossiers: 1, organisations: 1 });
  assert.equal((await db.query('SELECT 1 FROM "user" WHERE id=$1', [uid])).rowCount, 0);
  assert.equal((await db.query("SELECT 1 FROM dossiers WHERE id=$1", [d])).rowCount, 0);
  assert.equal((await db.query("SELECT name FROM organizations WHERE id=$1", [org])).rows[0].name, "Organisation supprimée");
  assert.equal(existsSync(fichier), false);
});

test.after(() => db.end());
