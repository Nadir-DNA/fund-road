import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import AdmZip from "adm-zip";
import { XMLParser } from "fast-xml-parser";
import { config } from "./config.ts";
const exec = promisify(execFile);
// Entités XML standard seulement : aucune entité DOCTYPE n’est développée
const xmlEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};
export const decodeXml = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
    e[0] === "#"
      ? String.fromCodePoint(
          parseInt(
            e[1].toLowerCase() === "x" ? e.slice(2) : e.slice(1),
            e[1].toLowerCase() === "x" ? 16 : 10,
          ),
        )
      : xmlEntities[e.toLowerCase()],
  );
export async function extract(file: string, name: string) {
  const ext = path.extname(name).toLowerCase();
  let text = "";
  if (ext === ".pdf") {
    const { stdout } = await exec("pdftotext", ["-layout", file, "-"], {
      timeout: 60000,
      maxBuffer: 2 * 1024 * 1024,
    });
    text = stdout;
    if (text.trim().length < 50) {
      const info = await exec("pdfinfo", [file], {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });
      const pages = Number(info.stdout.match(/Pages:\s*(\d+)/)?.[1]);
      if (!pages || pages > 100)
        throw new Error("OCR limité à 100 pages : découpez le document");
      const dir = await mkdtemp(path.join(tmpdir(), "fundroad-ocr-"));
      try {
        await exec(
          "pdftoppm",
          [
            "-f",
            "1",
            "-l",
            "100",
            "-r",
            "110",
            "-png",
            file,
            path.join(dir, "page"),
          ],
          { timeout: 120000, maxBuffer: 1024 * 1024 },
        );
        const { readdir } = await import("node:fs/promises");
        for (const image of (await readdir(dir)).sort()) {
          const r = await exec(
            "tesseract",
            [path.join(dir, image), "stdout", "-l", "fra+eng"],
            { timeout: 30000, maxBuffer: 1024 * 1024 },
          );
          text += "\n" + r.stdout;
        }
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    }
  } else {
    const bytes = await readFile(file);
    const zip = new AdmZip(bytes);
    const entries = zip.getEntries();
    if (
      entries.length > 5000 ||
      entries.reduce((n, e) => n + e.header.size, 0) > 100 * 1024 * 1024
    )
      throw new Error("Archive trop volumineuse après décompression");
    if (entries.some((e) => /vbaProject|embeddings\//i.test(e.entryName)))
      throw new Error("Contenu actif ou pièce embarquée non accepté");
    if (ext === ".docx") {
      const doc = zip.getEntry("word/document.xml");
      if (!doc) throw new Error("Document Word invalide");
      const parser = new XMLParser({
        preserveOrder: true,
        ignoreAttributes: true,
        processEntities: false,
      });
      function walk(nodes: any[]): string {
        return nodes
          .map((n) =>
            Object.entries(n)
              .map(([k, v]) => {
                if (k === "#text") return decodeXml(String(v));
                if (k === "w:tab") return "\t";
                if (k === "w:br") return "\n";
                return (
                  (Array.isArray(v) ? walk(v) : "") + (k === "w:p" ? "\n" : "")
                );
              })
              .join(""),
          )
          .join("");
      }
      text = walk(parser.parse(doc.getData().toString()));
    } else if (ext === ".xlsx") {
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(bytes as any);
      book.eachSheet((sheet) => {
        text += "\nFeuille : " + sheet.name + "\n";
        sheet.eachRow((row, i) => {
          const cells: string[] = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            const value = cell.value;
            cells.push(
              value && typeof value === "object" && "formula" in value
                ? `${cell.text} [formule : ${value.formula}]`
                : cell.text,
            );
          });
          text += `Ligne ${i}: ` + cells.join(" | ") + "\n";
        });
      });
    } else if (ext === ".pptx") {
      const parser = new XMLParser({ ignoreAttributes: true });
      function strings(o: any): string[] {
        if (typeof o === "string") return [o];
        if (!o || typeof o !== "object") return [];
        return Object.entries(o).flatMap(([k, v]) =>
          k === "a:t"
            ? Array.isArray(v)
              ? v.map(String)
              : [String(v)]
            : strings(v),
        );
      }
      for (const e of entries
        .filter((x) => /^ppt\/slides\/slide\d+\.xml$/.test(x.entryName))
        .sort((a, b) =>
          a.entryName.localeCompare(b.entryName, undefined, { numeric: true }),
        )) {
        text +=
          "\n" +
          e.entryName +
          "\n" +
          strings(parser.parse(e.getData().toString())).join(" ");
      }
    } else throw new Error("Format non pris en charge");
  }
  if (!text.trim()) throw new Error("Aucun texte lisible");
  if (text.length > config.maxExtracted)
    throw new Error("Document trop long pour cette version ; découpez-le");
  return text;
}
