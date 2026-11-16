// Visites / visites engagées / trafic non confirmé d'un site, depuis une COPIE de la base du pixel Searchtide (lecture seule).
// Usage : node scripts/visites-engagees.mjs <copie.db> <domaine> <AAAA-MM-JJ> <AAAA-MM-JJ>
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

/** Calcule les trois nombres ; la base est ouverte en lecture seule. */
export function visites(dbPath, site, from, to) {
  const sql = readFileSync(new URL("../docs/mesure/visites.sql", import.meta.url), "utf8").replace(/^--.*$/gm, "");
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try { return db.prepare(sql).get({ site, from, to }); } finally { db.close(); }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const [dbPath, site, from, to] = process.argv.slice(2);
  if (!to) { console.error("Usage : node scripts/visites-engagees.mjs <copie.db> <domaine> <du> <au>"); process.exit(2); }
  console.log(JSON.stringify({ site, from, to, ...visites(dbPath, site, from, to) }));
}
