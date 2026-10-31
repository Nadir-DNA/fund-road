import { db, transaction } from "./db.ts";
import "./config.ts";
import { extract } from "./extract.ts";
import { analyze, evaluate } from "./ai.ts";
import { orgProgram } from "../shared/programs.ts";
import { resolvePrograms } from "./programs.ts";
import { randomUUID } from "node:crypto";
const extractOnly = process.argv.includes("--extract-only");
let stopping = false;
process.on("SIGTERM", () => {
  stopping = true;
});
process.on("SIGINT", () => {
  stopping = true;
});
// Only one worker owns this local queue. PostgreSQL releases this lock on crash.
const lease = await db.connect();
const acquired = (
  await lease.query("SELECT pg_try_advisory_lock(726381904) AS acquired")
).rows[0].acquired;
if (!acquired) {
  lease.release();
  await db.end();
  throw new Error("Un worker traite déjà cette file locale");
}
await db.query(
  "UPDATE documents SET status='failed',error='Extraction interrompue. Réessayez.' WHERE id IN (SELECT (payload->>'documentId')::uuid FROM jobs WHERE status='running' AND kind='extract')",
);
await db.query(
  "UPDATE jobs SET status='failed',error='Traitement interrompu. Relance nécessaire.' WHERE status='running'",
);
console.log(
  extractOnly
    ? "Worker Fund Road : extraction locale uniquement, aucun appel IA"
    : "Worker Fund Road prêt",
);
while (!stopping) {
  const job = await transaction(async (c) => {
    const r = await c.query(
      "SELECT * FROM jobs WHERE status='queued' AND ($1::boolean=false OR kind='extract') ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1",
      [extractOnly],
    );
    if (!r.rows[0]) return null;
    await c.query(
      "UPDATE jobs SET status='running',attempts=attempts+1,locked_at=now() WHERE id=$1",
      [r.rows[0].id],
    );
    return r.rows[0];
  });
  if (!job) {
    await new Promise((r) => setTimeout(r, 1500));
    continue;
  }
  try {
    if (job.kind === "extract") {
      const doc = (
        await db.query("SELECT * FROM documents WHERE id=$1", [
          job.payload.documentId,
        ])
      ).rows[0];
      if (!doc) throw new Error("Document supprimé");
      const text = await extract(doc.path, doc.name);
      await db.query(
        "UPDATE documents SET extracted=$2,status='ready',error=NULL WHERE id=$1",
        [doc.id, text],
      );
    } else if (job.kind === "evaluation") {
      // adéquation calculée sur la version et les pièces reçues par le financeur
      const a = (
        await db.query(
          "SELECT a.id,a.document_ids,a.version_id,v.snapshot,o.id AS org_id,o.name,o.kind,o.criteria FROM applications a JOIN versions v ON v.id=a.version_id JOIN organizations o ON o.id=a.recipient_org WHERE a.id=$1",
          [job.payload.applicationId],
        )
      ).rows[0];
      if (!a) throw new Error("Candidature supprimée");
      const program = orgProgram({ ...a, id: a.org_id });
      const docs = (
        await db.query(
          "SELECT id,name,extracted FROM documents WHERE id=ANY($1::uuid[]) AND status='ready'",
          [a.document_ids],
        )
      ).rows;
      if (!docs.length) throw new Error("Aucune pièce lisible");
      const r = await evaluate(a.snapshot.state, docs, program);
      await db.query(
        "UPDATE versions SET snapshot=jsonb_set(snapshot,'{state,eligibility}',COALESCE(snapshot->'state'->'eligibility','{}'::jsonb)||jsonb_build_object($2::text,$3::jsonb)) WHERE id=$1",
        [a.version_id, program.id, r.eligibility],
      );
      await db.query(
        "INSERT INTO usage(id,organization_id,job_id,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
        [randomUUID(), a.org_id, job.id, r.input, r.output],
      );
    } else {
      const d = (
        await db.query("SELECT * FROM dossiers WHERE id=$1", [job.dossier_id])
      ).rows[0];
      const docs = (
        await db.query(
          "SELECT id,name,extracted FROM documents WHERE dossier_id=$1 AND status='ready'",
          [d.id],
        )
      ).rows;
      if (!docs.length) throw new Error("Aucun document lisible");
      const result = await analyze(
        d.state,
        docs,
        await resolvePrograms(d.state.programs),
      );
      await transaction(async (c) => {
        const current = (
          await c.query(
            "SELECT revision FROM dossiers WHERE id=$1 FOR UPDATE",
            [d.id],
          )
        ).rows[0];
        if (current.revision !== d.revision)
          throw new Error(
            "Dossier modifié pendant l’analyse ; relance nécessaire",
          );
        result.state.checkedRevision = d.revision + 1;
        await c.query(
          "UPDATE dossiers SET state=$2,revision=revision+1,updated_at=now() WHERE id=$1",
          [d.id, result.state],
        );
        await c.query(
          "INSERT INTO usage(id,organization_id,job_id,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
          [
            randomUUID(),
            d.organization_id,
            job.id,
            result.input,
            result.output,
          ],
        );
      });
    }
    await db.query("UPDATE jobs SET status='done' WHERE id=$1", [job.id]);
  } catch (e) {
    const error = (
      e instanceof Error ? e.message : "Traitement impossible"
    ).slice(0, 400);
    await db.query("UPDATE jobs SET status='failed',error=$2 WHERE id=$1", [
      job.id,
      error,
    ]);
    if (job.kind === "extract")
      await db.query(
        "UPDATE documents SET status='failed',error=$2 WHERE id=$1",
        [job.payload.documentId, error],
      );
    console.error("Échec traitement", job.id, error);
  }
}
lease.release();
await db.end();
