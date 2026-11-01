import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Document, Packer, Paragraph } from "docx";
import ExcelJS from "exceljs";
import AdmZip from "adm-zip";
process.env.DATABASE_URL ||= "postgres://unused";
process.env.BETTER_AUTH_SECRET ||= "test-only-unused-secret-32-characters";
const { extract } = await import("../server/extract.ts");
test("extraction Word conserve paragraphes, accents et chiffres", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-test-"));
  try {
    const file = path.join(dir, "test.docx");
    await writeFile(
      file,
      await Packer.toBuffer(
        new Document({
          sections: [
            {
              children: [
                new Paragraph("Équipe et stratégie"),
                new Paragraph("Revenu prévu : 120 000 EUR"),
              ],
            },
          ],
        }),
      ),
    );
    const text = await extract(file, "test.docx");
    assert.match(text, /Équipe et stratégie/);
    assert.match(text, /120 000 EUR/);
    assert.match(text, /stratégie\n/);
  } finally {
    await rm(dir, { recursive: true });
  }
});
test("extraction Excel inclut résultat et formule sans objet opaque", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-test-"));
  try {
    const file = path.join(dir, "test.xlsx");
    const b = new ExcelJS.Workbook();
    const s = b.addWorksheet("Prévision");
    s.addRow(["Chiffre d’affaires", 100, 200]);
    s.getCell("D1").value = { formula: "B1+C1", result: 300 };
    await b.xlsx.writeFile(file);
    const text = await extract(file, "test.xlsx");
    assert.match(text, /300 \[formule : B1\+C1\]/);
    assert.doesNotMatch(text, /\[object Object\]/);
  } finally {
    await rm(dir, { recursive: true });
  }
});
test("documents avec contenu actif refusés", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-test-"));
  try {
    const zip = new AdmZip();
    zip.addFile("word/vbaProject.bin", Buffer.from("test"));
    const file = path.join(dir, "bad.docx");
    await writeFile(file, zip.toBuffer());
    await assert.rejects(extract(file, "bad.docx"), /Contenu actif/);
  } finally {
    await rm(dir, { recursive: true });
  }
});
test("entités XML standard décodées, entités inconnues laissées telles quelles", async () => {
  const { decodeXml } = await import("../server/extract.ts");
  assert.equal(
    decodeXml("L&apos;équipe &amp; 5 &lt; 6 &#233;t&#xE9; &foo;"),
    "L'équipe & 5 < 6 été &foo;",
  );
});
