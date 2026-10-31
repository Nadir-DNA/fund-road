import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, Footer, AlignmentType, PageNumber } from "docx";
import { readFileSync } from "node:fs";
import { score, requirements, type DossierState } from "../shared/domain.ts";
import { programScore, type Program } from "../shared/programs.ts";

const verdicts: Record<string, string> = {
  eligible: "Éligible a priori : tous les critères connus sont remplis",
  eligible_missing_pieces: "Critères remplis, pièces à compléter",
  incomplete: "Informations manquantes pour conclure",
  ineligible: "Non éligible en l’état : un critère bloquant n’est pas rempli",
};
const statuts = { ok: "Rempli", ko: "Non rempli", unknown: "À vérifier" } as const;
const avertissement =
  "Dossier préparé avec Fund Road à partir des documents et déclarations du porteur de projet. Il ne garantit ni un financement ni l’éligibilité à une aide.";

// Contenu commun au PDF et au Word : un même dossier, deux formats
type Bloc =
  | { t: "titre"; texte: string }
  | { t: "sous-titre"; texte: string }
  | { t: "texte"; texte: string }
  | { t: "puce"; texte: string }
  | { t: "source"; texte: string };
function contenu(name: string, state: DossierState, docs: { id: string; name: string }[], programs: Program[], version?: number) {
  const s = score(state);
  const proposees = requirements.filter((r) => state.facts[r.id]).length;
  const nomDoc = (id: string) => docs.find((d) => d.id === id)?.name || "document fourni";
  const b: Bloc[] = [
    { t: "texte", texte: `Version ${version ?? "—"} · établi le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` },
    {
      t: "texte",
      texte: `Rubriques confirmées par le porteur : ${s.completed} sur ${s.total} · renseignées à partir des documents : ${proposees} sur ${s.total} · à compléter : ${s.total - proposees}`,
    },
  ];
  if (state.summary) b.push({ t: "titre", texte: "Synthèse" }, { t: "texte", texte: state.summary });
  for (const r of requirements) {
    const f = state.facts[r.id];
    b.push({ t: "titre", texte: r.label });
    if (!f) {
      b.push({ t: "texte", texte: "À compléter." });
      continue;
    }
    b.push({ t: "texte", texte: f.value });
    for (const d of f.details || []) b.push({ t: "puce", texte: d.value });
    const nature =
      f.kind === "hypothesis" ? "hypothèse du porteur" : f.kind === "declared" ? "déclaration du porteur" : "tiré des documents";
    b.push({
      t: "source",
      texte: `${f.confirmed ? "Confirmé" : "À confirmer"} · ${nature}${f.quote ? ` · ${nomDoc(f.source)} : « ${court(f.quote)} »` : ""}`,
    });
    for (const d of f.details || []) b.push({ t: "source", texte: `${nomDoc(d.source)} : « ${court(d.quote)} »` });
  }
  const elig = programs.filter((p) => state.eligibility?.[p.id]);
  if (elig.length) {
    b.push({ t: "titre", texte: "Aides et financeurs visés" });
    for (const p of elig) {
      const sc = programScore(p, state.eligibility![p.id]);
      b.push({ t: "sous-titre", texte: `${p.name} · ${p.operator}` }, { t: "texte", texte: `${verdicts[sc.verdict]} (${sc.ok} critère${sc.ok > 1 ? "s" : ""} sur ${sc.total})` });
      for (const row of sc.rows)
        b.push({ t: "puce", texte: `${statuts[row.result.status]} : ${row.label}${row.result.note ? ` — ${row.result.note}` : ""}` });
    }
  }
  b.push(
    { t: "titre", texte: "Points à clarifier" },
    { t: "texte", texte: state.conflicts.join("\n") || "Aucune contradiction relevée entre les documents." },
  );
  return b;
}

// Les polices standard du PDF ne couvrent que l'alphabet latin courant : symboles traduits, le reste retiré
const enClair = (t: string) =>
  t
    .replace(/≥/g, "supérieur ou égal à")
    .replace(/≤/g, "inférieur ou égal à")
    .replace(/→/g, "->")
    .replace(/[‐-―]/g, "-")
    .replace(/[^\x09\x0a\x0d\x20-\x7e\xa0-\xff€’‘“”«»…•œŒ]/g, "");
// Citation longue (tableur, page entière) : ramenée à une ligne lisible
const court = (q: string) => {
  const t = q.replace(/\s+/g, " ").trim();
  return t.length > 220 ? t.slice(0, 217).replace(/\s\S*$/, "") + "…" : t;
};
const logo = () => {
  try {
    return readFileSync(new URL("../public/brand/fundroad-logo.png", import.meta.url));
  } catch {
    return null;
  }
};

export async function exportDossier(
  name: string,
  state: DossierState,
  format: string,
  extra: { documents?: { id: string; name: string }[]; programs?: Program[]; version?: number } = {},
) {
  const blocs = contenu(name, state, extra.documents || [], extra.programs || [], extra.version);
  const image = logo();
  if (format === "docx")
    return Packer.toBuffer(
      new Document({
        sections: [
          {
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: avertissement + " · Page ", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], size: 16 })],
                  }),
                ],
              }),
            },
            children: [
              ...(image ? [new Paragraph({ children: [new ImageRun({ data: image, transformation: { width: 120, height: 51 }, type: "png" })] })] : []),
              new Paragraph({ text: name, heading: HeadingLevel.TITLE }),
              ...blocs.flatMap((x) =>
                x.t === "titre"
                  ? [new Paragraph({ text: x.texte, heading: HeadingLevel.HEADING_1 })]
                  : x.t === "sous-titre"
                    ? [new Paragraph({ text: x.texte, heading: HeadingLevel.HEADING_2 })]
                    : x.t === "puce"
                      ? [new Paragraph({ text: x.texte, bullet: { level: 0 } })]
                      : x.t === "source"
                        ? [new Paragraph({ children: [new TextRun({ text: x.texte, italics: true, size: 18, color: "6B7785" })] })]
                        : x.texte.split("\n").map((t) => new Paragraph(t)),
              ),
            ],
          },
        ],
      }),
    );
  return new Promise<Buffer>((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: 56, bufferPages: true, info: { Title: name, Producer: "Fund Road" } });
    const chunks: Buffer[] = [];
    pdf.on("data", (x) => chunks.push(x));
    pdf.on("error", reject);
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    const nuit = "#0a192c", encre = "#253343", gris = "#6b7785", orange = "#d9622b";
    const largeur = pdf.page.width - 112;
    if (image) pdf.image(image, 56, 44, { width: 96 });
    pdf.y = image ? 44 + 41 + 26 : pdf.y;
    pdf.fontSize(22).fillColor(nuit).font("Helvetica-Bold").text(enClair(name), 56, pdf.y, { width: largeur });
    pdf.moveTo(56, pdf.y + 6).lineTo(56 + 48, pdf.y + 6).lineWidth(2).strokeColor(orange).stroke();
    pdf.moveDown(1).font("Helvetica");
    for (const x of blocs) {
      if (pdf.y > pdf.page.height - 120) pdf.addPage();
      if (x.t === "titre") pdf.moveDown(0.9).font("Helvetica-Bold").fontSize(14).fillColor(nuit).text(enClair(x.texte)).moveDown(0.35).font("Helvetica");
      else if (x.t === "sous-titre") pdf.moveDown(0.4).font("Helvetica-Bold").fontSize(11.5).fillColor(encre).text(enClair(x.texte)).moveDown(0.15).font("Helvetica");
      else if (x.t === "puce") pdf.fontSize(10.5).fillColor(encre).text("•  " + enClair(x.texte), { indent: 10, width: largeur - 10 }).moveDown(0.15);
      else if (x.t === "source") pdf.fontSize(8.5).fillColor(gris).font("Helvetica-Oblique").text(enClair(x.texte), { width: largeur }).font("Helvetica").moveDown(0.15);
      else pdf.fontSize(10.5).fillColor(encre).text(enClair(x.texte), { width: largeur, lineGap: 1.5 }).moveDown(0.3);
    }
    // pied de page : avertissement et numéro sur chaque page
    const pages = pdf.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      pdf.switchToPage(pages.start + i);
      const bas = pdf.page.height - 40;
      pdf.page.margins.bottom = 0;
      pdf.fontSize(7.5).fillColor(gris).text(`${avertissement}  ·  ${i + 1}/${pages.count}`, 56, bas, { width: largeur, align: "center" });
    }
    pdf.end();
  });
}
