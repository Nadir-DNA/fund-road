// Importe un fichier JSON de financeurs (tableau de fiches, format décrit dans docs/RECHERCHE-FINANCEURS.md).
//   npx tsx --env-file=.env.local scripts/import-financeurs.ts financeurs.json            essai à blanc
//   npx tsx --env-file=.env.local scripts/import-financeurs.ts financeurs.json --ecrire   écrit en base
//   --confirmees noms.txt : fiches (un nom par ligne) dont la source a été vérifiée à la main,
//   pour les sites qui bloquent les robots ; elles sont signalées à part dans le rapport
// Chaque fiche valide est vérifiée sur sa source ; seules les fiches vérifiées sont publiées,
// les autres sont enregistrées masquées (avec --ecrire) et listées dans le rapport.
import { readFile, writeFile } from "node:fs/promises";
import { db } from "../server/db.ts";
import { enregistrer, lireFiche, verifierSource } from "../server/financeurs.ts";

const [fichier] = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--confirmees");
const ecrire = process.argv.includes("--ecrire");
const iConf = process.argv.indexOf("--confirmees");
const confirmees = new Set(
  iConf > 0
    ? (await readFile(process.argv[iConf + 1], "utf8")).split("\n").map((l) => l.trim().toLowerCase()).filter(Boolean)
    : [],
);
if (!fichier) throw new Error("Usage : import-financeurs.ts <fichier.json> [--ecrire]");
// la réponse copiée peut contenir du texte autour du tableau (ligne « SUITE : … ») : on garde le tableau
const texte = await readFile(fichier, "utf8");
const brut = JSON.parse(texte.slice(texte.indexOf("["), texte.lastIndexOf("]") + 1));
const lignes: unknown[] = Array.isArray(brut) ? brut : brut.financeurs;
if (!Array.isArray(lignes)) throw new Error("Le fichier doit contenir un tableau de fiches");

const rapport = {
  publiees: [] as string[],
  confirmees: [] as string[],
  masquees: [] as string[],
  rejetees: [] as string[],
};
const vus = new Set<string>();
// quelques requêtes en parallèle seulement, pour rester correct avec les sites interrogés
for (let i = 0; i < lignes.length; i += 5) {
  await Promise.all(
    lignes.slice(i, i + 5).map(async (l, j) => {
      const n = i + j + 1;
      const { fiche, erreur } = lireFiche(l);
      if (!fiche) return rapport.rejetees.push(`#${n} ${(l as any)?.nom ?? "?"} : ${erreur}`);
      const cle = fiche.nom.toLowerCase() + "|" + fiche.type;
      if (vus.has(cle)) return rapport.rejetees.push(`#${n} ${fiche.nom} : doublon dans le fichier`);
      vus.add(cle);
      const confirmee = confirmees.has(fiche.nom.toLowerCase());
      const probleme = confirmee ? null : await verifierSource(fiche.source_url, fiche.nom);
      if (ecrire) await enregistrer(fiche, !probleme);
      if (probleme) rapport.masquees.push(`#${n} ${fiche.nom} : ${probleme} (${fiche.source_url})`);
      else (confirmee ? rapport.confirmees : rapport.publiees).push(`#${n} ${fiche.nom}`);
    }),
  );
}
await db.end();
const sortie = fichier.replace(/\.json$/, "") + ".rapport.json";
// dossier en lecture seule (import monté dans le conteneur de production) : rapport affiché à l'écran
const ecrit = await writeFile(sortie, JSON.stringify(rapport, null, 2)).then(
  () => true,
  () => false,
);
if (!ecrit) console.log(JSON.stringify(rapport, null, 2));
console.log(
  `${ecrire ? "Import" : "Essai à blanc"} : ${rapport.publiees.length} vérifiées et ${rapport.confirmees.length} confirmées à la main${ecrire ? ", publiées" : ""}, ` +
    `${rapport.masquees.length} à vérifier à la main${ecrire ? " (masquées)" : ""}, ${rapport.rejetees.length} rejetées. ${ecrit ? `Détail : ${sortie}` : "Détail ci-dessus."}`,
);
