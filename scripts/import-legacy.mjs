import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import pg from "pg";
// Only public editorial tables are in this fixed allowlist. No accounts or dossiers.
const tables = {
  investors: "id,name,description,location,sectors,stage,ticket,type",
  articles: "id,slug,h1,meta_desc,content_md",
  resources: "id,title,excerpt,content",
  entrepreneur_resources:
    "id,title,description,course_content,file_url,resource_type",
};
const client = await readFile("src/integrations/supabase/client.ts", "utf8");
const url = client.match(/const SUPABASE_URL = "([^"]+)"/)?.[1];
const key = client.match(/const SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/)?.[1];
if (!url || !key)
  throw new Error("Configuration publique historique introuvable");
const claims = JSON.parse(
  Buffer.from(key.split(".")[1], "base64url").toString(),
);
if (claims.role !== "anon")
  throw new Error("Seule la clé publique anonyme est acceptée");
const fileIndex = process.argv.indexOf("--file");
const localExport =
  fileIndex >= 0
    ? JSON.parse(await readFile(process.argv[fileIndex + 1], "utf8"))
    : null;
if (
  localExport &&
  Object.keys(localExport).some((key) => !Object.hasOwn(tables, key))
)
  throw new Error("Export limité aux tables éditoriales autorisées");
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const [table, select] of Object.entries(tables)) {
    let count = 0;
    for (let offset = 0; offset < 100000; offset += 500) {
      const endpoint = new URL("/rest/v1/" + table, url);
      endpoint.searchParams.set("select", select);
      endpoint.searchParams.set("order", "id.asc");
      endpoint.searchParams.set("limit", "500");
      endpoint.searchParams.set("offset", String(offset));
      if (table === "articles" || table === "resources")
        endpoint.searchParams.set("published", "eq.true");
      let rows;
      if (localExport) {
        if (
          localExport[table] !== undefined &&
          !Array.isArray(localExport[table])
        )
          throw new Error("Table exportée invalide");
        rows = (localExport[table] || []).slice(offset, offset + 500);
      } else {
        const response = await fetch(endpoint, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok)
          throw new Error(
            `Lecture publique ${table} impossible (${response.status})`,
          );
        rows = await response.json();
      }
      if (!Array.isArray(rows)) throw new Error("Format source inattendu");
      for (const raw of rows) {
        if (
          !raw ||
          typeof raw.id !== "string" ||
          !raw.id ||
          raw.id.length > 200
        )
          throw new Error("Identifiant source invalide");
        const row = Object.fromEntries(
          select
            .split(",")
            .filter((key) => Object.hasOwn(raw, key))
            .map((key) => [key, raw[key]]),
        );
        if (JSON.stringify(row).length > 1000000)
          throw new Error("Contenu source trop long");
        const encoded = JSON.stringify(row);
        const hash = createHash("sha256").update(encoded).digest("hex");
        await db.query(
          `INSERT INTO legacy_content(id,source_kind,source_id,source_url,payload,source_hash) VALUES($1,$2,$3,$4,$5,$6)
    ON CONFLICT(source_kind,source_id) DO UPDATE SET payload=EXCLUDED.payload,source_hash=EXCLUDED.source_hash,imported_at=now(),status='pending',reviewed_at=NULL,reviewed_by=NULL
    WHERE legacy_content.source_hash<>EXCLUDED.source_hash`,
          [
            randomUUID(),
            table,
            row.id,
            new URL("/rest/v1/" + table, url).href,
            row,
            hash,
          ],
        );
        count++;
      }
      if (rows.length < 500) break;
    }
    console.log(
      `${table} : ${count} contenus récupérés dans la file de revue ; aucune publication automatique.`,
    );
  }
} finally {
  await db.end();
}
