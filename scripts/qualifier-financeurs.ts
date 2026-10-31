// Qualifie les fiches de l'annuaire à partir de leur site officiel : critères cités mot pour mot, logo, références.
//   npx tsx --env-file=.env.local scripts/qualifier-financeurs.ts --limite 10            essai, rien n'est écrit
//   npx tsx --env-file=.env.local scripts/qualifier-financeurs.ts --slug kima-ventures   une fiche précise
//   ... --ecrire                                                                          enregistre en base
// Sans citation, la valeur existante est conservée ; les listes citées complètent les listes existantes.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "../server/db.ts";
import { callModel, ready } from "../server/ai.ts";
import { config } from "../server/config.ts";
import { consignes, lireSite, retenir, telechargerLogo } from "../server/financeurs.ts";
import { resume } from "../shared/criteria.ts";

const arg = (n: string) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : undefined);
const ecrire = process.argv.includes("--ecrire");
const limite = Number(arg("--limite") || 1000);
const slugs = arg("--slug")?.split(",");
ready();

const fiches = (
  await db.query(
    slugs
      ? "SELECT * FROM investors WHERE slug = ANY($1) ORDER BY name"
      : "SELECT * FROM investors WHERE active=true AND organization_id IS NULL ORDER BY verified_at NULLS FIRST, name LIMIT $1",
    [slugs ?? limite],
  )
).rows;

let jetons = 0;
for (const f of fiches) {
  const avant = resume(f.criteria);
  try {
    const { pages, logo } = await lireSite(f.website || f.source_url);
    if (!pages.length) {
      console.log(`✗ ${f.name} : site illisible`);
      continue;
    }
    const r = await callModel(consignes(f.kind), { financeur: f.name, pages });
    jetons += r.input + r.output;
    const { criteres, sources, notables } = retenir(f.kind, r.json, pages);
    // listes : les valeurs citées s'ajoutent aux existantes ; montants et détails : la valeur citée remplace
    const union = (k: string) =>
      Array.isArray(criteres[k]) ? { [k]: [...new Set([...(f.criteria[k] || []), ...criteres[k]])] } : {};
    const criteria = {
      ...f.criteria,
      ...criteres,
      ...union("sectors"),
      ...union("stages"),
      ...union("regions"),
      details: { ...(f.criteria.details || {}), ...criteres.details },
      sources: { ...(f.criteria.sources || {}), ...sources },
      ...(notables.length && { notables }),
    };
    const image = logo ? await telechargerLogo(logo).catch(() => null) : null;
    const apres = resume(criteria);
    console.log(`\n■ ${f.name} — ${pages.length} page(s) lue(s), ${Object.keys(sources).length} champ(s) cité(s)${image ? ", logo trouvé" : ""}`);
    for (const k of ["ticket", "stage", "geography", "sectors"] as const)
      if (avant[k] !== apres[k]) console.log(`  ${k} : « ${avant[k] || "—"} » → « ${apres[k]} »`);
    for (const [k, s] of Object.entries(sources)) console.log(`  [${k}] « ${s.citation.slice(0, 110)} »`);
    if (notables.length) console.log(`  références : ${notables.join(", ")}`);
    if (!ecrire) continue;
    let logoMeta = f.logo;
    if (image) {
      await mkdir(config.data, { recursive: true, mode: 0o700 });
      await writeFile(path.join(config.data, "logo-inv-" + f.id), image.bytes, { mode: 0o600 });
      logoMeta = { type: image.type, v: Date.now() };
    }
    await db.query(
      "UPDATE investors SET criteria=$2, logo=$3, stage=$4, geography=$5, ticket=$6, sectors=$7, verified_at=now() WHERE id=$1",
      [f.id, criteria, logoMeta, apres.stage, apres.geography, apres.ticket, Array.isArray(criteria.sectors) ? criteria.sectors : f.sectors],
    );
  } catch (e: any) {
    console.log(`✗ ${f.name} : ${e.message}`);
  }
}
await db.end();
console.log(`\n${fiches.length} fiche(s) traitée(s), ${jetons} jetons IA${ecrire ? ", enregistrées" : " (essai, rien d'écrit)"}.`);
