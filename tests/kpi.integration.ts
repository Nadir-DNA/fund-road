// M1 : requêtes de mesure sur une BASE JETABLE (créée puis supprimée sur le serveur Postgres LOCAL de développement).
// Lancer : npm run test:kpi   (utilise DATABASE_URL de .env.local pour joindre le serveur local ; jamais la production).
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import pg from "pg";

const admin = process.env.DATABASE_URL!;
const dbName = "fr_kpi_" + randomUUID().slice(0, 8);
const urlFor = (name: string) => admin.replace(/\/[^/?]+(\?.*)?$/, `/${name}$1`);
const queries = Object.fromEntries(
  readFileSync(new URL("../docs/mesure/requetes.sql", import.meta.url), "utf8")
    .split(/^-- name: /m).slice(1)
    .map((b) => [b.split("\n")[0].trim(), b.split("\n").slice(1).filter((l) => !l.startsWith("--")).join("\n").trim().replace(/;$/, "")]),
) as Record<string, string>;

test("requêtes de mesure : définitions et exclusions (base jetable)", async (t) => {
  assert.ok(/127\.0\.0\.1|localhost/.test(admin), "refus : ce test ne s'exécute que sur un Postgres local");
  const root = new pg.Client({ connectionString: urlFor("postgres") }); await root.connect();
  await root.query(`CREATE DATABASE ${dbName}`);
  let c: pg.Client | null = null;
  // Nettoyage dans l'ordre : fermer la connexion de test, puis supprimer la base jetable.
  t.after(async () => { await c?.end().catch(() => {}); await root.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`); await root.end(); });
  execFileSync("npx", ["tsx", "server/migrate.ts"], { env: { ...process.env, DATABASE_URL: urlFor(dbName), BETTER_AUTH_SECRET: "t".repeat(40), APP_URL: "http://127.0.0.1:1" }, stdio: "pipe" });
  c = new pg.Client({ connectionString: urlFor(dbName) }); await c.connect();
  const db = c;
  const one = async (name: string, ...params: unknown[]) => { try { return Number((await db.query(queries[name], params)).rows[0].count); } catch (e) { throw new Error(`${name} : ${(e as Error).message}`); } };

  const org = async (name: string) => (await db.query("INSERT INTO organizations(id,name,kind,slug) VALUES($1,$2,'startup',$3) RETURNING id", [randomUUID(), name, name + randomUUID().slice(0, 4)])).rows[0].id as string;
  const user = async (verified: boolean) => { const id = randomUUID(); await db.query(`INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,'n',$2,$3,now(),now())`, [id, id + "@exemple.test", verified]); return id; };
  const entitle = (o: string, offer: string, status: string, sub: string | null) => db.query("INSERT INTO entitlements(organization_id,offer_id,status,subscription_id) VALUES($1,$2,$3,$4)", [o, offer, status, sub]);
  await db.query("INSERT INTO offers(id,label,price_cents,cadence,quota,active) VALUES ('pilote','Pilote',0,'once',99,true),('dossier','Dossier',14900,'quarter',10,true) ON CONFLICT(id) DO UPDATE SET price_cents=EXCLUDED.price_cents");
  const [pil, paye, sansAbo, annule] = [await org("pilote"), await org("paye"), await org("sans-abo"), await org("annule")];

  // M1 — sur base vide : 0 payant, 0 pilote.
  assert.equal(await one("clients_payants"), 0);
  assert.equal(await one("pilotes_actifs"), 0);
  // Une offre pilote active = 0 payant, 1 pilote (même avec un abonnement : l'offre est gratuite).
  await entitle(pil, "pilote", "active", null);
  assert.deepEqual([await one("clients_payants"), await one("pilotes_actifs")], [0, 1]);
  // Une offre payante SANS abonnement (attribution manuelle) = 0 payant.
  await entitle(sansAbo, "dossier", "active", null);
  assert.deepEqual([await one("clients_payants"), await one("pilotes_actifs")], [0, 1]);
  // Une offre payante résiliée = 0.
  await entitle(annule, "dossier", "cancelled", "sub_old");
  assert.equal(await one("clients_payants"), 0);
  // Une organisation avec abonnement payant actif = 1 payant.
  await entitle(paye, "dossier", "active", "sub_live");
  assert.deepEqual([await one("clients_payants"), await one("pilotes_actifs")], [1, 1]);

  // Exclusion de l'équipe PAR IDENTIFIANT : une organisation de même nom qu'une externe n'est pas exclue.
  const equipe = await org("equipe"), externe = await org("equipe");   // même nom, identifiants différents
  const today = new Date().toISOString().slice(0, 10);
  const day = (await db.query("SELECT (now() AT TIME ZONE 'Europe/Paris')::date::text AS d")).rows[0].d as string;
  const before = await one("organisations_externes_jour", day, [equipe]);
  assert.equal(before, 5, "5 organisations externes (pilote, paye, sans-abo, annule, externe), l'équipe exclue par identifiant");
  assert.equal(await one("organisations_externes_jour", day, [equipe, externe]), 4);
  void today;

  // Utilisateurs : l'équipe (membre d'une organisation d'équipe) est exclue, un utilisateur sans organisation compte.
  const uTeam = await user(true), uExt = await user(false), uExt2 = await user(true);
  await db.query("INSERT INTO members(organization_id,user_id,role) VALUES($1,$2,'owner')", [equipe, uTeam]);
  assert.equal(await one("comptes_utilisateurs_externes_jour", day, [equipe]), 2);
  assert.equal(await one("comptes_confirmes_jour", day, [equipe]), 1);

  // Dossiers : créés, analyse réussie, activés (≥ 5 faits confirmés avec source, 0 conflit, document prêt, compte vérifié).
  await db.query("INSERT INTO members(organization_id,user_id,role) VALUES($1,$2,'owner')", [externe, uExt2]);
  const dossier = async (orgId: string, facts: Record<string, unknown>, conflicts: string[]) => (await db.query("INSERT INTO dossiers(id,organization_id,name,goal,state) VALUES($1,$2,'d','grant',$3) RETURNING id", [randomUUID(), orgId, JSON.stringify({ facts, conflicts, summary: "" })])).rows[0].id as string;
  const fact = (confirmed: boolean, source = "doc-1") => ({ value: "x", source, confirmed, kind: "document" });
  const five = Object.fromEntries(["a", "b", "c", "d", "e"].map((k) => [k, fact(true)]));
  const dActive = await dossier(externe, five, []);
  const dQuatre = await dossier(externe, { ...five, e: fact(false) }, []);          // 4 confirmés seulement
  const dSansSource = await dossier(externe, { ...five, e: fact(true, "") }, []);    // un fait sans source
  const dConflit = await dossier(externe, five, ["contradiction"]);                 // un conflit
  const dEquipe = await dossier(equipe, five, []);                                    // organisation d'équipe
  for (const d of [dActive, dQuatre, dSansSource, dConflit, dEquipe]) await db.query("INSERT INTO documents(id,dossier_id,name,sha256,path,bytes,status) VALUES($1,$2,'doc',$3,'p',1,'ready')", [randomUUID(), d, randomUUID()]);
  assert.equal(await one("dossiers_crees_jour", day, [equipe]), 4);
  assert.equal(await one("dossiers_actives", [equipe]), 1, "un seul dossier remplit tout le critère d'activation");
  // Sans document prêt : non activé.
  await db.query("UPDATE documents SET status='failed' WHERE dossier_id=$1", [dActive]);
  assert.equal(await one("dossiers_actives", [equipe]), 0);
  // Analyse réussie : seulement un job « analysis » terminé, une fois par dossier même avec plusieurs jobs.
  await db.query("INSERT INTO jobs(id,dossier_id,kind,status) VALUES($1,$2,'analysis','done'),($3,$2,'analysis','done'),($4,$5,'analysis','failed'),($6,$7,'analysis','done')", [randomUUID(), dActive, randomUUID(), randomUUID(), dQuatre, randomUUID(), dEquipe]);
  assert.equal(await one("dossiers_analyse_reussie_jour", day, [equipe]), 1);

  // Lecture seule : aucune requête du fichier ne contient d'instruction d'écriture.
  for (const [name, sql] of Object.entries(queries)) assert.doesNotMatch(sql, /\b(insert|update|delete|drop|alter|create|truncate)\b/i, name);
  // Les requêtes ne sélectionnent jamais de nom, d'e-mail ni de contenu.
  for (const [name, sql] of Object.entries(queries)) assert.doesNotMatch(sql, /select[^;]*\b(email|extracted|quote|summary)\b/i, name);
});
