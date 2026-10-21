import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { db } from "../server/db.ts";
const exec = promisify(execFile);
test("import local idempotent, éditorial uniquement, aucune publication", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-import-"));
  const id = "fixture-" + randomUUID();
  try {
    const file = path.join(dir, "export.json");
    await writeFile(
      file,
      JSON.stringify({
        articles: [
          {
            id,
            slug: "fixture",
            h1: "Article de recette",
            content_md: "Contenu synthétique pour vérifier la reprise.",
            author_id: "must-not-import",
          },
        ],
      }),
    );
    for (let n = 0; n < 2; n++)
      await exec(process.execPath, [
        "scripts/import-legacy.mjs",
        "--file",
        file,
      ]);
    const rows = (
      await db.query("SELECT * FROM legacy_content WHERE source_id=$1", [id])
    ).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "pending");
    assert.equal(rows[0].payload.author_id, undefined);
    assert.equal(
      (
        await db.query("SELECT 1 FROM content_pages WHERE legacy_id=$1", [
          rows[0].id,
        ])
      ).rowCount,
      0,
    );
    await writeFile(file, JSON.stringify({ profiles: [] }));
    await assert.rejects(
      exec(process.execPath, ["scripts/import-legacy.mjs", "--file", file]),
      /tables éditoriales/,
    );
  } finally {
    await db.query("DELETE FROM legacy_content WHERE source_id=$1", [id]);
    await rm(dir, { recursive: true });
    await db.end();
  }
});
