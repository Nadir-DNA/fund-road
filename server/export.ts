import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { score, requirements, type DossierState } from "../shared/domain.ts";
export async function exportDossier(
  name: string,
  state: DossierState,
  format: string,
) {
  const parts = [
    {
      title: name,
      text: `Dossier de financement — Complétude ${score(state).percent} %\nDéclarations et documents fournis ; aucune garantie de financement.`,
    },
    ...requirements.map((r) => ({
      title: r.label,
      text: state.facts[r.id]
        ? `${state.facts[r.id].value}\n\nStatut : ${state.facts[r.id].confirmed ? "confirmé" : "à confirmer"} · ${state.facts[r.id].kind === "document" ? "document fourni" : state.facts[r.id].kind === "hypothesis" ? "hypothèse" : "déclaration"}${state.facts[r.id].quote ? "\nExtrait source : " + state.facts[r.id].quote : ""}`
        : "À compléter",
    })),
    {
      title: "Points à clarifier",
      text:
        state.conflicts.join("\n") ||
        "Aucune contradiction signalée dans les contrôles disponibles.",
    },
  ];
  if (format === "docx")
    return Packer.toBuffer(
      new Document({
        sections: [
          {
            children: parts.flatMap((p) => [
              new Paragraph({ text: p.title, heading: HeadingLevel.HEADING_1 }),
              ...p.text.split("\n").map((text) => new Paragraph(text)),
            ]),
          },
        ],
      }),
    );
  return new Promise<Buffer>((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: 52 });
    const chunks: Buffer[] = [];
    pdf.on("data", (x) => chunks.push(x));
    pdf.on("error", reject);
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    for (const p of parts) {
      if (pdf.y > 680) pdf.addPage();
      pdf.fontSize(17).fillColor("#163c65").text(p.title).moveDown(0.5);
      pdf.fontSize(11).fillColor("#253343").text(p.text).moveDown(1.5);
    }
    pdf.end();
  });
}
