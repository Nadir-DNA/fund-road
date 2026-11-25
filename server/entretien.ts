import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db, transaction } from "./db.ts";
import { user, dossier, fail } from "./access.ts";
import { jugerReponse, type Jugement } from "./ai.ts";

// Plafond d'échanges d'entretien par dossier sur 24 heures : l'entretien ne consomme pas le quota d'analyses
const PLAFOND_JOUR = Number(process.env.ENTRETIEN_JOUR || 40);
// une question peut être relancée deux fois au plus (question, relance, seconde relance)
const RELANCES_MAX = 2;

export async function questionsEntretien(dossierId: string) {
  return (
    await db.query(
      "SELECT id,parent_id,rubrique,type,question,pourquoi,attendu,reponse,verdict,retour,created_at,repondu_at FROM entretien WHERE dossier_id=$1 ORDER BY created_at,id",
      [dossierId],
    )
  ).rows;
}

const reponseInput = z.object({ reponse: z.string().trim().min(3).max(4000) });

export async function registerEntretien(app: FastifyInstance) {
  app.post("/api/dossiers/:id/entretien/:question", async (req: any) => {
    const u = await user(req);
    const d = await dossier(
      u.id,
      z.string().uuid().parse(req.params.id),
      true,
    );
    const { reponse } = reponseInput.parse(req.body);
    const q = (
      await db.query("SELECT * FROM entretien WHERE id=$1 AND dossier_id=$2", [
        z.string().uuid().parse(req.params.question),
        d.id,
      ])
    ).rows[0];
    if (!q) fail(404, "Question introuvable");
    const echanges = Number(
      (
        await db.query(
          "SELECT count(*) FROM echanges WHERE dossier_id=$1 AND created_at>now()-interval '1 day'",
          [d.id],
        )
      ).rows[0].count,
    );
    if (echanges >= PLAFOND_JOUR)
      fail(
        429,
        `Vous avez atteint les ${PLAFOND_JOUR} échanges d’entretien de la journée pour ce dossier. Reprenez demain : vos réponses déjà données sont enregistrées.`,
      );
    await db.query("INSERT INTO echanges(id,dossier_id) VALUES($1,$2)", [
      randomUUID(),
      d.id,
    ]);
    // fil de la question : ses questions parentes et leurs réponses, de la plus ancienne à la plus récente
    const ancetres = (
      await db.query(
        `WITH RECURSIVE fil AS (
           SELECT id,parent_id,question,reponse,retour,0 AS profondeur FROM entretien WHERE id=$1
           UNION ALL
           SELECT e.id,e.parent_id,e.question,e.reponse,e.retour,f.profondeur+1 FROM entretien e JOIN fil f ON e.id=f.parent_id
         ) SELECT question,reponse,retour FROM fil WHERE profondeur>0 ORDER BY profondeur DESC`,
        [q.id],
      )
    ).rows;
    let jugement: (Jugement & { input: number; output: number }) | null = null;
    try {
      jugement = await jugerReponse({
        comprehension: d.state.comprehension,
        facts: d.state.facts,
        rubrique: q.rubrique,
        question: q.question,
        pourquoi: q.pourquoi,
        attendu: q.attendu,
        fil: ancetres,
        reponse,
      });
    } catch (e: any) {
      // la réponse est gardée même sans retour : elle sera lue à la prochaine analyse
      console.error("Jugement d’entretien indisponible :", e?.message);
    }
    await transaction(async (c) => {
      await c.query(
        "UPDATE entretien SET reponse=$2,verdict=$3,retour=$4,repondu_at=now() WHERE id=$1",
        [q.id, reponse, jugement?.verdict ?? null, jugement?.retour ?? null],
      );
      // une nouvelle réponse remplace la relance qui portait sur l'ancienne, si elle n'a pas encore été traitée
      await c.query(
        "DELETE FROM entretien WHERE parent_id=$1 AND reponse IS NULL",
        [q.id],
      );
      if (jugement?.relance && ancetres.length < RELANCES_MAX)
        await c.query(
          "INSERT INTO entretien(id,dossier_id,parent_id,rubrique,type,question,pourquoi,attendu) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
          [
            randomUUID(),
            d.id,
            q.id,
            q.rubrique,
            q.type,
            jugement.relance,
            "Relance sur votre réponse précédente.",
            q.attendu,
          ],
        );
      if (jugement)
        await c.query(
          "INSERT INTO usage(id,organization_id,input_tokens,output_tokens) VALUES($1,$2,$3,$4)",
          [randomUUID(), d.organization_id, jugement.input, jugement.output],
        );
    });
    return {
      jugement: jugement
        ? { verdict: jugement.verdict, retour: jugement.retour }
        : null,
      entretien: await questionsEntretien(d.id),
    };
  });
}
