import Fastify from "fastify";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import serveStatic from "@fastify/static";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { mkdir, writeFile, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { z, ZodError } from "zod";
import { config } from "./config.ts";
import { auth } from "./auth.ts";
import { db, transaction, audit } from "./db.ts";
import { user, member, owner, dossier, fail, admin } from "./access.ts";
import { mail, mailReady, notifyOrg } from "./mail.ts";
import {
  score,
  canAttest,
  emptyState,
  requirements,
  dossierInput,
  organizationInput,
  themeInput,
  factSchema,
} from "../shared/domain.ts";
import { exportDossier } from "./export.ts";
import { programScore, orgProgram } from "../shared/programs.ts";
import { allPrograms, resolvePrograms } from "./programs.ts";
import { registerContent } from "./content.ts";
import { registerBilling } from "./billing.ts";
import { registerSeo, uniqueSlug, findProfile, listProfiles } from "./seo.ts";
const app = Fastify({
  logger: { redact: ["req.headers.cookie", "req.headers.authorization"] },
  bodyLimit: 1024 * 1024,
});
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
await app.register(multipart, {
  limits: { fileSize: config.maxBytes, files: 1 },
});
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
});
app.setErrorHandler((e: any, _req, reply) => {
  if (e instanceof ZodError)
    return reply.code(400).send({
      error: "Données invalides",
      details: e.issues.map((x) => x.path.join(".") + ": " + x.message),
    });
  const status = e.statusCode || 500;
  if (status >= 500) app.log.error({ message: e.message }, "Erreur serveur");
  reply.code(status).send({
    error:
      status === 500
        ? "Erreur interne. Réessayez ou contactez le support."
        : e.message,
  });
});
app.addHook("onRequest", async (req, reply) => {
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.url !== "/api/billing/webhook"
  ) {
    const origin = req.headers.origin;
    if (origin && origin !== new URL(config.baseURL).origin)
      return reply.code(403).send({ error: "Origine non autorisée" });
  }
});
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  handler: async (req, reply) => {
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers))
      if (v) headers.set(k, Array.isArray(v) ? v.join(",") : String(v));
    const request = new Request(new URL(req.url, config.baseURL), {
      method: req.method,
      headers,
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });
    const response = await auth.handler(request);
    reply.code(response.status);
    response.headers.forEach((v, k) => {
      if (k !== "set-cookie") reply.header(k, v);
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) reply.header("set-cookie", cookies);
    reply.send(await response.text());
  },
});
app.get("/api/health", async () => {
  await db.query("SELECT 1");
  return { ok: true };
});
app.get("/api/config", async () => ({
  aiReady: Boolean(config.apiKey && config.model),
  mailReady: mailReady(),
  billingReady: Boolean(process.env.STRIPE_SECRET_KEY),
  advisorOrg: config.advisorOrg || null,
  pilot: !config.production,
  requirements,
}));
app.get("/api/me", async (req) => {
  const u = await user(req);
  const orgs = (
    await db.query(
      "SELECT o.*,m.role FROM organizations o JOIN members m ON m.organization_id=o.id WHERE m.user_id=$1 ORDER BY o.created_at",
      [u.id],
    )
  ).rows;
  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      twoFactorEnabled: (u as any).twoFactorEnabled,
    },
    organizations: orgs,
  };
});
app.post("/api/organizations", async (req) => {
  const u = await user(req);
  const b = organizationInput.parse(req.body);
  const id = randomUUID(),
    slug = await uniqueSlug(b.name);
  await transaction(async (c) => {
    await c.query(
      "INSERT INTO organizations(id,name,kind,slug) VALUES($1,$2,$3,$4)",
      [id, b.name, b.kind, slug],
    );
    await c.query("INSERT INTO members VALUES($1,$2,'owner')", [id, u.id]);
  });
  return { id };
});
app.put("/api/organizations/:id", async (req: any) => {
  const u = await user(req);
  await owner(u.id, req.params.id);
  const b = z
    .object({
      theme: themeInput,
      criteria: z.object({
        sectors: z.string().max(2000),
        stage: z.string().max(1000),
        geography: z.string().max(1000),
        ticket: z.string().max(1000),
        exclusions: z.string().max(2000),
        questions: z.array(z.string().max(1000)).max(30),
        documents: z.array(z.string().max(300)).max(30).default([]),
      }),
    })
    .parse(req.body);
  await db.query("UPDATE organizations SET theme=$2,criteria=$3 WHERE id=$1", [
    req.params.id,
    b.theme,
    b.criteria,
  ]);
  await audit(u.id, req.params.id, "organization.updated", req.params.id);
  return { ok: true };
});
// Logo du portail : images matricielles seulement (un SVG peut embarquer du script)
const logoTypes: Record<string, [string, (b: Buffer) => boolean]> = {
  png: ["image/png", (b) => b.readUInt32BE(0) === 0x89504e47],
  jpg: ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8],
  jpeg: ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8],
  webp: ["image/webp", (b) => b.subarray(8, 12).toString() === "WEBP"],
};
app.post("/api/organizations/:id/logo", async (req: any) => {
  const u = await user(req);
  await owner(u.id, req.params.id);
  const part = await req.file();
  if (!part) fail(400, "Choisissez une image");
  const ext = path.extname(part.filename).slice(1).toLowerCase();
  const bytes = await part.toBuffer();
  if (!logoTypes[ext] || !logoTypes[ext][1](bytes))
    fail(400, "Formats acceptés : PNG, JPEG, WebP");
  if (bytes.length > 1024 * 1024) fail(413, "Logo limité à 1 Mo");
  await mkdir(config.data, { recursive: true, mode: 0o700 });
  await writeFile(path.join(config.data, "logo-" + req.params.id), bytes, {
    mode: 0o600,
  });
  await db.query("UPDATE organizations SET logo=$2 WHERE id=$1", [
    req.params.id,
    { type: logoTypes[ext][0], v: Date.now() },
  ]);
  return { ok: true };
});
app.get("/api/organizations/:id/logo", async (req: any, reply) => {
  const o = (
    await db.query(
      "SELECT logo FROM organizations WHERE id=$1 AND logo IS NOT NULL",
      [z.string().uuid().parse(req.params.id)],
    )
  ).rows[0];
  if (!o) fail(404, "Logo introuvable");
  reply
    .type(o.logo.type)
    .header("Cache-Control", "public, max-age=86400")
    .send(await readFile(path.join(config.data, "logo-" + req.params.id)));
});
// Annuaire : un financeur y figure dès qu'il publie des critères sur son portail
app.get("/api/directory", async () =>
  (await listProfiles()).filter(
    (o) => !o.claimed || orgProgram(o).criteria.length,
  ),
);
app.get("/api/portals/:slug", async (req: any) => {
  const o = await findProfile(req.params.slug);
  if (!o) fail(404, "Portail introuvable");
  return o;
});
app.get("/api/dossiers", async (req) => {
  const u = await user(req);
  const rows = (
    await db.query(
      "SELECT DISTINCT d.* FROM dossiers d LEFT JOIN members m ON m.organization_id=d.organization_id LEFT JOIN contributors c ON c.dossier_id=d.id WHERE m.user_id=$1 OR c.user_id=$1 ORDER BY d.updated_at DESC",
      [u.id],
    )
  ).rows;
  return rows.map((d) => ({ ...d, score: score(d.state) }));
});
app.post("/api/dossiers", async (req) => {
  const u = await user(req);
  const b = dossierInput.parse(req.body);
  await member(u.id, b.organizationId, true);
  const id = randomUUID();
  await transaction(async (c) => {
    const org = (
      await c.query("SELECT * FROM organizations WHERE id=$1", [
        b.organizationId,
      ])
    ).rows[0];
    const recipientId =
      b.recipientOrg || (org.kind !== "startup" ? org.id : null);
    const recipient = recipientId
      ? (
          await c.query(
            "SELECT * FROM organizations WHERE id=$1 AND kind<>'startup'",
            [recipientId],
          )
        ).rows[0]
      : null;
    if (recipientId && !recipient)
      fail(400, "Portail destinataire introuvable");
    const criteria = recipient
      ? {
          ...recipient.criteria,
          recipientName: recipient.theme.name || recipient.name,
        }
      : {};
    await c.query(
      "INSERT INTO dossiers(id,organization_id,name,goal,state,recipient_org,criteria_snapshot) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [
        id,
        b.organizationId,
        b.name,
        b.goal,
        emptyState(),
        recipientId,
        criteria,
      ],
    );
    for (const question of criteria.questions || [])
      await c.query(
        "INSERT INTO questions(id,dossier_id,organization_id,body) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, recipientId, question],
      );
  });
  await audit(u.id, b.organizationId, "dossier.created", id);
  return { id };
});
app.get("/api/dossiers/:id", async (req: any) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id);
  const docs = (
    await db.query(
      "SELECT id,name,bytes,status,error,created_at FROM documents WHERE dossier_id=$1 ORDER BY created_at",
      [d.id],
    )
  ).rows;
  const jobs = (
    await db.query(
      "SELECT id,kind,status,error,created_at FROM jobs WHERE dossier_id=$1 ORDER BY created_at DESC LIMIT 20",
      [d.id],
    )
  ).rows;
  const questions = (
    await db.query(
      "SELECT * FROM questions WHERE dossier_id=$1 ORDER BY created_at",
      [d.id],
    )
  ).rows;
  return {
    ...d,
    score: score(d.state),
    documents: docs,
    jobs,
    questions,
    recipientProgress: {
      completed: questions.filter(
        (q) => !q.application_id && q.answer?.trim().length >= 10,
      ).length,
      total: questions.filter((q) => !q.application_id).length,
    },
    attestable: canAttest(
      d.state,
      d.revision,
      docs.filter((x) => x.status === "ready").length,
    ),
    evaluations: (await resolvePrograms(d.state.programs)).map((program) => ({
      program,
      score: programScore(program, d.state.eligibility?.[program.id]),
    })),
  };
});
app.get("/api/programs", async () => allPrograms());
// Suivi financeur : candidatures reçues (version partagée) et dossiers ouverts pour une startup invitée
const stages = [
  "new",
  "review",
  "meeting",
  "diligence",
  "invested",
  "declined",
] as const;
const stageNames: Record<(typeof stages)[number], string> = {
  new: "Reçu",
  review: "En revue",
  meeting: "Rendez-vous",
  diligence: "Due diligence",
  invested: "En portefeuille",
  declined: "Non retenu",
};
app.get("/api/organizations/:id/pipeline", async (req: any) => {
  const u = await user(req);
  await member(u.id, req.params.id);
  const org = (
    await db.query("SELECT * FROM organizations WHERE id=$1", [req.params.id])
  ).rows[0];
  const fit = orgProgram(org);
  const evaluate = (state: any) => ({
    score: score(state),
    fit: fit.criteria.length
      ? programScore(fit, state.eligibility?.[fit.id])
      : null,
  });
  const received = (
    await db.query(
      // dernière version reçue par dossier
      `SELECT * FROM (
         SELECT DISTINCT ON (a.dossier_id) a.id,a.stage,a.status,a.created_at,d.name,
                d.revision>v.revision AS updated_since,v.snapshot,d.state AS live,s.name AS startup
           FROM applications a JOIN versions v ON v.id=a.version_id
           JOIN dossiers d ON d.id=a.dossier_id JOIN organizations s ON s.id=d.organization_id
          WHERE a.recipient_org=$1 AND a.revoked_at IS NULL
          ORDER BY a.dossier_id, a.created_at DESC) x ORDER BY created_at DESC`,
      [org.id],
    )
  ).rows.map(({ snapshot, live, ...a }) => ({
    ...a,
    // seul le pourcentage du dossier en cours est exposé, pas son contenu
    progress: score(live).percent,
    source: "application",
    href: "/partages/" + a.id,
    ...evaluate(snapshot.state),
  }));
  const invited = (
    await db.query(
      `SELECT d.id,d.name,d.state,d.updated_at AS created_at,
              (SELECT string_agg(u.name, ', ') FROM contributors c JOIN "user" u ON u.id=c.user_id WHERE c.dossier_id=d.id) AS startup
         FROM dossiers d WHERE d.organization_id=$1 ORDER BY d.updated_at DESC`,
      [org.id],
    )
  ).rows.map(({ state, ...d }) => ({
    ...d,
    source: "invitation",
    stage: "new",
    href: "/app/dossiers/" + d.id,
    ...evaluate(state),
  }));
  return { criteria: fit.criteria.length, rows: [...received, ...invited] };
});
app.put("/api/applications/:id/stage", async (req: any) => {
  const u = await user(req);
  const { stage } = z.object({ stage: z.enum(stages) }).parse(req.body);
  const a = (
    await db.query(
      "SELECT a.recipient_org,a.stage,d.organization_id,d.name,r.name AS recipient FROM applications a JOIN dossiers d ON d.id=a.dossier_id JOIN organizations r ON r.id=a.recipient_org WHERE a.id=$1",
      [req.params.id],
    )
  ).rows[0];
  if (!a?.recipient_org) fail(404, "Candidature introuvable");
  await member(u.id, a.recipient_org, true);
  await db.query("UPDATE applications SET stage=$2 WHERE id=$1", [
    req.params.id,
    stage,
  ]);
  if (a.stage !== stage)
    notifyOrg(
      a.organization_id,
      `${a.recipient} a fait avancer votre dossier « ${a.name} »`,
      `Nouvelle étape : ${stageNames[stage]}\n\n${config.baseURL}/app/candidatures`,
    ).catch(() => {});
  await audit(u.id, a.recipient_org, "application.stage", req.params.id);
  return { ok: true };
});
// Programme visé et déclarations du porteur : versionnés comme le reste du dossier
async function updateState(req: any, change: (state: any) => any) {
  const u = await user(req);
  const { revision } = z
    .object({ revision: z.number().int() })
    .passthrough()
    .parse(req.body);
  const d = await dossier(u.id, req.params.id, true);
  if (revision !== d.revision) fail(409, "Le dossier a changé. Rechargez-le.");
  const r = await db.query(
    "UPDATE dossiers SET state=$2,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$3",
    [d.id, change(d.state), revision],
  );
  if (!r.rowCount) fail(409, "Modification concurrente");
  return { ok: true };
}
app.put("/api/dossiers/:id/programs/:program", async (req: any) => {
  const [program] = await resolvePrograms([req.params.program]);
  if (!program) fail(400, "Programme ou financeur inconnu");
  return updateState(req, (state) => ({
    ...state,
    programs: [...new Set([...(state.programs || []), program.id])].slice(
      0,
      20,
    ),
  }));
});
app.delete("/api/dossiers/:id/programs/:program", async (req: any) =>
  updateState(req, (state) => {
    const { [req.params.program]: _, ...eligibility } = state.eligibility || {};
    return {
      ...state,
      programs: (state.programs || []).filter(
        (p: string) => p !== req.params.program,
      ),
      eligibility,
    };
  }),
);
app.put("/api/dossiers/:id/declarations/:criterion", async (req: any) => {
  const { answer } = z
    .object({ answer: z.string().trim().max(4000) })
    .parse(req.body);
  const selected = await resolvePrograms(
    (await dossier((await user(req)).id, req.params.id)).state.programs,
  );
  if (
    !selected.some((p) => p.criteria.some((c) => c.id === req.params.criterion))
  )
    fail(400, "Critère inconnu pour les programmes visés");
  return updateState(req, (state) => {
    return {
      ...state,
      declarations: { ...state.declarations, [req.params.criterion]: answer },
    };
  });
});
app.put("/api/dossiers/:id/facts/:key", async (req: any) => {
  const u = await user(req);
  const b = z
    .object({ fact: factSchema, revision: z.number().int() })
    .parse(req.body);
  if (!requirements.some((r) => r.id === req.params.key))
    fail(400, "Rubrique inconnue");
  const d = await dossier(u.id, req.params.id, true);
  if (b.revision !== d.revision)
    fail(409, "Le dossier a changé. Rechargez-le.");
  const previous = d.state.facts[req.params.key];
  const fact =
    previous?.kind === "document" && previous.value === b.fact.value
      ? { ...previous, confirmed: b.fact.confirmed }
      : {
          ...b.fact,
          source: "declaration:" + u.id,
          quote: undefined,
          kind: "declared",
        };
  const state = {
    ...d.state,
    facts: { ...d.state.facts, [req.params.key]: fact },
  };
  delete state.checkedRevision;
  const r = await db.query(
    "UPDATE dossiers SET state=$2,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$3",
    [d.id, state, b.revision],
  );
  if (!r.rowCount) fail(409, "Modification concurrente");
  return { ok: true };
});
app.post("/api/dossiers/:id/documents", async (req: any) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id, true);
  const part = await req.file();
  if (!part) fail(400, "Choisissez un fichier");
  const name = path.basename(part.filename).slice(0, 180);
  if (!/\.(pdf|docx|pptx|xlsx)$/i.test(name))
    fail(400, "Formats acceptés : PDF, DOCX, PPTX, XLSX");
  const bytes = await part.toBuffer();
  if (part.file.truncated) fail(413, "Fichier limité à 20 Mo");
  const magic = bytes.subarray(0, 4).toString();
  if (
    /\.pdf$/i.test(name)
      ? magic !== "%PDF"
      : bytes[0] !== 0x50 || bytes[1] !== 0x4b
  )
    fail(400, "Le contenu ne correspond pas au format");
  const hash = createHash("sha256").update(bytes).digest("hex");
  const existing = (
    await db.query(
      "SELECT id FROM documents WHERE dossier_id=$1 AND sha256=$2",
      [d.id, hash],
    )
  ).rows[0];
  if (existing) return { id: existing.id, duplicate: true };
  const id = randomUUID();
  await mkdir(config.data, { recursive: true, mode: 0o700 });
  const file = path.join(config.data, id);
  await writeFile(file, bytes, { mode: 0o600 });
  try {
    await transaction(async (c) => {
      await c.query("SELECT id FROM dossiers WHERE id=$1 FOR UPDATE", [d.id]);
      const count = Number(
        (
          await c.query("SELECT count(*) FROM documents WHERE dossier_id=$1", [
            d.id,
          ])
        ).rows[0].count,
      );
      if (count >= 30) fail(413, "Limite de 30 documents par dossier");
      await c.query(
        "INSERT INTO documents(id,dossier_id,name,sha256,path,bytes) VALUES($1,$2,$3,$4,$5,$6)",
        [id, d.id, name, hash, file, bytes.length],
      );
      await c.query(
        "INSERT INTO jobs(id,dossier_id,kind,payload) VALUES($1,$2,'extract',$3)",
        [randomUUID(), d.id, { documentId: id }],
      );
      await c.query(
        "UPDATE dossiers SET state=state-'checkedRevision',revision=revision+1 WHERE id=$1",
        [d.id],
      );
    });
  } catch (e) {
    await unlink(file);
    throw e;
  }
  return { id };
});
app.post("/api/documents/:id/retry", async (req: any) => {
  const u = await user(req);
  return transaction(async (c) => {
    const doc = (
      await c.query("SELECT * FROM documents WHERE id=$1 FOR UPDATE", [
        req.params.id,
      ])
    ).rows[0];
    if (!doc) fail(404, "Document introuvable");
    await dossier(u.id, doc.dossier_id, true);
    if (doc.status !== "failed")
      fail(409, "Ce document ne nécessite pas de reprise");
    await c.query(
      "UPDATE documents SET status='queued',error=NULL WHERE id=$1",
      [doc.id],
    );
    await c.query(
      "INSERT INTO jobs(id,dossier_id,kind,payload) VALUES($1,$2,'extract',$3)",
      [randomUUID(), doc.dossier_id, { documentId: doc.id }],
    );
    return { ok: true };
  });
});
app.get("/api/documents/:id", async (req: any, reply) => {
  const u = await user(req);
  const doc = (
    await db.query("SELECT * FROM documents WHERE id=$1", [req.params.id])
  ).rows[0];
  if (!doc) fail(404, "Document introuvable");
  await dossier(u.id, doc.dossier_id);
  reply
    .header(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    )
    .type("application/octet-stream");
  return readFile(doc.path);
});
app.post("/api/dossiers/:id/analyze", async (req: any) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id, true);
  if (!config.apiKey || !config.model)
    fail(
      503,
      "L’analyse IA nécessite la configuration du fournisseur et du modèle",
    );
  return transaction(async (c) => {
    await c.query("SELECT id FROM organizations WHERE id=$1 FOR UPDATE", [
      d.organization_id,
    ]);
    const entitlement = (
      await c.query(
        "SELECT o.quota FROM entitlements e JOIN offers o ON o.id=e.offer_id WHERE e.organization_id=$1 AND e.status='active' AND (e.expires_at IS NULL OR e.expires_at>now())",
        [d.organization_id],
      )
    ).rows[0];
    const quota =
      entitlement?.quota ??
      (config.production ? config.freeQuota : config.pilotQuota);
    const n = Number(
      (
        await c.query(
          "SELECT count(*) FROM jobs j JOIN dossiers d ON d.id=j.dossier_id WHERE d.organization_id=$1 AND j.kind='analysis' AND j.status IN ('queued','running','done') AND j.created_at>=date_trunc('month',now())",
          [d.organization_id],
        )
      ).rows[0].count,
    );
    if (n >= quota) fail(402, "Quota d’analyses atteint ou offre inactive");
    const pending = Number(
      (
        await c.query(
          "SELECT count(*) FROM documents WHERE dossier_id=$1 AND status<>'ready'",
          [d.id],
        )
      ).rows[0].count,
    );
    if (pending) fail(409, "Attendez ou corrigez les extractions de documents");
    const id = randomUUID();
    try {
      await c.query(
        "INSERT INTO jobs(id,dossier_id,kind) VALUES($1,$2,'analysis')",
        [id, d.id],
      );
    } catch (e: any) {
      if (e.code === "23505") fail(409, "Une analyse est déjà en cours");
      throw e;
    }
    return { id };
  });
});
app.get("/api/dossiers/:id/export/:format", async (req: any, reply) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id);
  const format = z.enum(["pdf", "docx"]).parse(req.params.format);
  reply
    .type(
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    .header("Content-Disposition", `attachment; filename="fundroad.${format}"`);
  return exportDossier(d.name, d.state, format);
});
app.post("/api/dossiers/:id/attest", async (req: any) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id, true);
  return transaction(async (c) => {
    const current = (
      await c.query("SELECT * FROM dossiers WHERE id=$1 FOR UPDATE", [d.id])
    ).rows[0];
    const n = Number(
      (
        await c.query(
          "SELECT count(*) FROM documents WHERE dossier_id=$1 AND status='ready'",
          [d.id],
        )
      ).rows[0].count,
    );
    if (!canAttest(current.state, current.revision, n))
      fail(
        409,
        "Complétez, confirmez puis faites analyser la version actuelle du dossier",
      );
    const vid = randomUUID(),
      id = randomUUID();
    await c.query(
      "INSERT INTO versions(id,dossier_id,revision,snapshot) VALUES($1,$2,$3,$4)",
      [
        vid,
        d.id,
        current.revision,
        { name: current.name, state: current.state },
      ],
    );
    await c.query("INSERT INTO attestations(id,version_id) VALUES($1,$2)", [
      id,
      vid,
    ]);
    return { id, url: `${config.baseURL}/verification/${id}` };
  });
});
app.get("/api/attestations/:id", async (req: any) => {
  const a = (
    await db.query(
      "SELECT a.id,a.reference,a.created_at,a.revoked_at,v.revision,d.revision AS current_revision FROM attestations a JOIN versions v ON v.id=a.version_id JOIN dossiers d ON d.id=v.dossier_id WHERE a.id=$1",
      [req.params.id],
    )
  ).rows[0];
  if (!a) fail(404, "Attestation introuvable");
  return {
    ...a,
    label:
      "Dossier complet selon le référentiel Fundroad — contrôles automatisés",
    limitation:
      "Complétude documentaire uniquement ; aucune vérification d’authenticité ni garantie de financement.",
  };
});
app.get(
  "/api/investors",
  async () =>
    (await db.query("SELECT * FROM investors WHERE active=true ORDER BY name"))
      .rows,
);
app.get("/api/applications", async (req) => {
  const u = await user(req);
  return (
    await db.query(
      "SELECT DISTINCT a.*,d.name,COALESCE(i.name,r.theme->>'name',r.name) AS investor_name FROM applications a JOIN dossiers d ON d.id=a.dossier_id JOIN versions v ON v.id=a.version_id LEFT JOIN investors i ON i.id=a.investor_id LEFT JOIN organizations r ON r.id=a.recipient_org LEFT JOIN members m ON m.organization_id=d.organization_id OR m.organization_id=a.recipient_org LEFT JOIN contributors c ON c.dossier_id=d.id WHERE (m.user_id=$1 OR c.user_id=$1 OR lower(a.recipient_email)=lower($2)) AND a.revoked_at IS NULL ORDER BY a.created_at DESC",
      [u.id, u.email],
    )
  ).rows;
});
app.post("/api/dossiers/:id/applications", async (req: any) => {
  const u = await user(req);
  const d = await dossier(u.id, req.params.id, true);
  const b = z
    .object({
      investorId: z.string().uuid().optional(),
      recipientOrg: z.string().uuid().optional(),
      recipientEmail: z.string().email().optional(),
      message: z.string().max(5000).default(""),
      documentIds: z.array(z.string().uuid()).max(30),
      confirmed: z.literal(true),
    })
    .parse(req.body);
  const inv = b.investorId
    ? (
        await db.query("SELECT * FROM investors WHERE id=$1 AND active=true", [
          b.investorId,
        ])
      ).rows[0]
    : null;
  const org = inv?.organization_id || b.recipientOrg || null;
  if (!org && !b.recipientEmail)
    fail(
      400,
      "Destinataire requis ; utilisez le canal officiel pour ce financeur",
    );
  if (org && b.recipientEmail) fail(400, "Choisissez un seul destinataire");
  if (org) {
    const exists = (
      await db.query(
        "SELECT id FROM organizations WHERE id=$1 AND kind<>'startup'",
        [org],
      )
    ).rows[0];
    if (!exists) fail(400, "Organisation destinataire invalide");
  }
  const docs = (
    await db.query(
      "SELECT id FROM documents WHERE dossier_id=$1 AND id=ANY($2::uuid[])",
      [d.id, b.documentIds],
    )
  ).rows;
  if (docs.length !== b.documentIds.length)
    fail(400, "Sélection documentaire invalide");
  if (b.recipientEmail && !mailReady()) fail(503, "Email non configuré");
  const id = randomUUID(),
    vid = randomUUID();
  await transaction(async (c) => {
    const current = (
      await c.query("SELECT * FROM dossiers WHERE id=$1 FOR UPDATE", [d.id])
    ).rows[0];
    await c.query(
      "INSERT INTO versions(id,dossier_id,revision,snapshot) VALUES($1,$2,$3,$4)",
      [
        vid,
        d.id,
        current.revision,
        { name: current.name, state: current.state },
      ],
    );
    await c.query(
      // une mise à jour envoyée au même financeur garde l'étape de suivi
      "INSERT INTO applications(id,dossier_id,version_id,investor_id,recipient_org,recipient_email,document_ids,message,status,stage) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE((SELECT stage FROM applications WHERE dossier_id=$2 AND recipient_org=$5 ORDER BY created_at DESC LIMIT 1),'new'))",
      [
        id,
        d.id,
        vid,
        inv?.id || null,
        org,
        b.recipientEmail || null,
        b.documentIds,
        b.message,
        b.recipientEmail ? "prepared" : "submitted",
      ],
    );
    if (org) {
      const criteria =
        current.recipient_org === org
          ? current.criteria_snapshot
          : (
              await c.query("SELECT criteria FROM organizations WHERE id=$1", [
                org,
              ])
            ).rows[0].criteria;
      const prepared = (
        await c.query(
          "SELECT body,answer FROM questions WHERE dossier_id=$1 AND organization_id=$2 AND application_id IS NULL",
          [d.id, org],
        )
      ).rows;
      await c.query(
        "UPDATE applications SET criteria_snapshot=$2 WHERE id=$1",
        [id, criteria],
      );
      for (const question of criteria.questions || [])
        await c.query(
          "INSERT INTO questions(id,dossier_id,organization_id,body,application_id,answer) VALUES($1,$2,$3,$4,$5,$6)",
          [
            randomUUID(),
            d.id,
            org,
            question,
            id,
            prepared.find((q) => q.body === question)?.answer || null,
          ],
        );
    }
  });
  if (org) {
    const o = (await db.query("SELECT * FROM organizations WHERE id=$1", [org]))
      .rows[0];
    // le financeur voit son adéquation sans attendre que la startup lance l'évaluation
    if (config.apiKey && orgProgram(o).criteria.length && b.documentIds.length)
      await db.query(
        "INSERT INTO jobs(id,dossier_id,kind,payload) VALUES($1,$2,'evaluation',$3)",
        [randomUUID(), d.id, { applicationId: id }],
      );
    notifyOrg(
      org,
      "Nouveau dossier reçu : " + d.name,
      `${b.message}\n\nConsulter le dossier : ${config.baseURL}/partages/${id}`,
    ).catch(() => {});
  }
  if (b.recipientEmail) {
    try {
      await mail(
        b.recipientEmail,
        "Un dossier de financement vous est partagé",
        `${b.message}\n\nAccès nominatif après connexion avec cette adresse : ${config.baseURL}/partages/${id}`,
      );
      await db.query("UPDATE applications SET status='submitted' WHERE id=$1", [
        id,
      ]);
    } catch {
      await db.query(
        "UPDATE applications SET status='send_failed' WHERE id=$1",
        [id],
      );
      fail(502, "Le dossier est enregistré, mais l’email n’a pas été envoyé");
    }
  }
  return { id };
});
app.get("/api/applications/:id", async (req: any) => {
  const u = await user(req);
  const a = (
    await db.query(
      "SELECT a.*,v.snapshot FROM applications a JOIN versions v ON v.id=a.version_id WHERE a.id=$1",
      [req.params.id],
    )
  ).rows[0];
  if (!a || a.revoked_at) fail(404, "Partage indisponible");
  const m = a.recipient_org
    ? (
        await db.query(
          "SELECT role FROM members WHERE organization_id=$1 AND user_id=$2",
          [a.recipient_org, u.id],
        )
      ).rows[0]
    : null;
  let source = false;
  try {
    await dossier(u.id, a.dossier_id);
    source = true;
  } catch {}
  if (
    !m &&
    !source &&
    a.recipient_email?.toLowerCase() !== u.email.toLowerCase()
  )
    fail(403, "Ce partage est nominatif");
  await audit(u.id, a.recipient_org || "", "application.viewed", a.id).catch(
    () => {},
  );
  const docs = (
    await db.query(
      "SELECT id,name,bytes FROM documents WHERE id=ANY($1::uuid[])",
      [a.document_ids],
    )
  ).rows;
  const notes = m
    ? (
        await db.query(
          "SELECT id,body,created_at FROM notes WHERE application_id=$1 AND organization_id=$2 ORDER BY created_at",
          [a.id, a.recipient_org],
        )
      ).rows
    : [];
  const questions = (
    await db.query(
      "SELECT id,body,answer,created_at FROM questions WHERE application_id=$1 ORDER BY created_at",
      [a.id],
    )
  ).rows;
  return {
    ...a,
    documents: docs,
    notes,
    questions,
    canReview: Boolean(m),
    canRevoke: source,
  };
});
app.post("/api/applications/:id/revoke", async (req: any) => {
  const u = await user(req);
  const a = (
    await db.query("SELECT * FROM applications WHERE id=$1", [req.params.id])
  ).rows[0];
  if (!a) fail(404, "Partage introuvable");
  await dossier(u.id, a.dossier_id, true);
  await db.query(
    "UPDATE applications SET revoked_at=now(),status='revoked' WHERE id=$1",
    [a.id],
  );
  return { ok: true };
});
app.post("/api/applications/:id/notes", async (req: any) => {
  const u = await user(req);
  const a = (
    await db.query(
      "SELECT * FROM applications WHERE id=$1 AND revoked_at IS NULL",
      [req.params.id],
    )
  ).rows[0];
  if (!a?.recipient_org) fail(404, "Candidature introuvable");
  await member(u.id, a.recipient_org);
  const b = z
    .object({ body: z.string().trim().min(1).max(5000) })
    .parse(req.body);
  await db.query(
    "INSERT INTO notes(id,application_id,organization_id,author_id,body) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), a.id, a.recipient_org, u.id, b.body],
  );
  return { ok: true };
});
app.post("/api/invitations", async (req) => {
  const u = await user(req);
  const b = z
    .object({
      organizationId: z.string().uuid(),
      dossierId: z.string().uuid().optional(),
      email: z.string().email(),
      role: z.enum(["editor", "reviewer"]).default("editor"),
    })
    .parse(req.body);
  await owner(u.id, b.organizationId);
  if (b.dossierId) {
    const d = await dossier(u.id, b.dossierId, true);
    if (d.organization_id !== b.organizationId)
      fail(403, "Organisation invalide");
  }
  if (!mailReady()) fail(503, "Email non configuré");
  const token = randomBytes(32).toString("hex"),
    id = randomUUID();
  await db.query(
    "INSERT INTO invitations(id,organization_id,dossier_id,email,role,token_hash,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '7 days')",
    [
      id,
      b.organizationId,
      b.dossierId || null,
      b.email,
      b.role,
      createHash("sha256").update(token).digest("hex"),
    ],
  );
  try {
    await mail(
      b.email,
      "Invitation Fundroad",
      `Vous êtes invité à collaborer : ${config.baseURL}/invitation/${token}`,
    );
  } catch (e) {
    await db.query("DELETE FROM invitations WHERE id=$1", [id]);
    throw e;
  }
  return { id };
});
app.post("/api/invitations/:token/accept", async (req: any) => {
  const u = await user(req);
  return transaction(async (c) => {
    const i = (
      await c.query(
        "SELECT * FROM invitations WHERE token_hash=$1 AND accepted_at IS NULL AND expires_at>now() FOR UPDATE",
        [createHash("sha256").update(req.params.token).digest("hex")],
      )
    ).rows[0];
    if (!i || i.email.toLowerCase() !== u.email.toLowerCase())
      fail(403, "Invitation expirée ou destinée à une autre adresse");
    if (i.dossier_id)
      await c.query(
        "INSERT INTO contributors(dossier_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [i.dossier_id, u.id, i.role],
      );
    else
      await c.query(
        "INSERT INTO members VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [i.organization_id, u.id, i.role],
      );
    await c.query("UPDATE invitations SET accepted_at=now() WHERE id=$1", [
      i.id,
    ]);
    return { ok: true };
  });
});
app.get("/api/organizations/:id/members", async (req: any) => {
  const u = await user(req);
  await member(u.id, req.params.id);
  return (
    await db.query(
      'SELECT m.user_id,m.role,u.name,u.email FROM members m JOIN "user" u ON u.id=m.user_id WHERE m.organization_id=$1',
      [req.params.id],
    )
  ).rows;
});
app.delete("/api/organizations/:id/members/:user", async (req: any) => {
  const u = await user(req);
  await owner(u.id, req.params.id);
  if (req.params.user === u.id)
    fail(400, "Le propriétaire ne peut pas se retirer ici");
  await db.query(
    "DELETE FROM members WHERE organization_id=$1 AND user_id=$2 AND role<>'owner'",
    [req.params.id, req.params.user],
  );
  return { ok: true };
});
app.post("/api/applications/:id/questions", async (req: any) => {
  const u = await user(req);
  const a = (
    await db.query(
      "SELECT * FROM applications WHERE id=$1 AND revoked_at IS NULL",
      [req.params.id],
    )
  ).rows[0];
  if (!a?.recipient_org) fail(404, "Candidature indisponible");
  await member(u.id, a.recipient_org);
  const b = z.object({ body: z.string().min(5).max(2000) }).parse(req.body);
  await db.query(
    "INSERT INTO questions(id,dossier_id,organization_id,body,application_id) VALUES($1,$2,$3,$4,$5)",
    [randomUUID(), a.dossier_id, a.recipient_org, b.body, a.id],
  );
  const startup = (
    await db.query("SELECT organization_id,name FROM dossiers WHERE id=$1", [
      a.dossier_id,
    ])
  ).rows[0];
  notifyOrg(
    startup.organization_id,
    "Une question sur votre dossier « " + startup.name + " »",
    `${b.body}\n\nRépondre : ${config.baseURL}/partages/${a.id}`,
  ).catch(() => {});
  return { ok: true };
});
app.put("/api/questions/:id", async (req: any) => {
  const u = await user(req);
  const q = (
    await db.query("SELECT * FROM questions WHERE id=$1", [req.params.id])
  ).rows[0];
  if (!q) fail(404, "Question introuvable");
  await dossier(u.id, q.dossier_id, true);
  const b = z.object({ answer: z.string().min(1).max(5000) }).parse(req.body);
  await db.query("UPDATE questions SET answer=$2 WHERE id=$1", [
    q.id,
    b.answer,
  ]);
  return { ok: true };
});
app.get("/api/applications/:id/documents/:doc", async (req: any, reply) => {
  const u = await user(req);
  const a = (
    await db.query(
      "SELECT * FROM applications WHERE id=$1 AND revoked_at IS NULL",
      [req.params.id],
    )
  ).rows[0];
  if (!a || !a.document_ids.includes(req.params.doc))
    fail(404, "Pièce non partagée");
  let allowed = a.recipient_email?.toLowerCase() === u.email.toLowerCase();
  if (a.recipient_org) {
    const m = (
      await db.query(
        "SELECT 1 FROM members WHERE organization_id=$1 AND user_id=$2",
        [a.recipient_org, u.id],
      )
    ).rowCount;
    allowed = allowed || Boolean(m);
  }
  if (!allowed) {
    try {
      await dossier(u.id, a.dossier_id);
      allowed = true;
    } catch {}
  }
  if (!allowed) fail(403, "Accès non autorisé");
  const doc = (
    await db.query("SELECT * FROM documents WHERE id=$1 AND dossier_id=$2", [
      req.params.doc,
      a.dossier_id,
    ])
  ).rows[0];
  if (!doc) fail(404, "Document indisponible");
  reply
    .type("application/octet-stream")
    .header(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
    );
  return readFile(doc.path);
});
await registerBilling(app);
await registerContent(app);
try {
  await stat(path.resolve("dist"));
  await app.register(serveStatic, {
    root: path.resolve("dist"),
    wildcard: false,
  });
  registerSeo(app, await readFile(path.resolve("dist/index.html"), "utf8"));
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith("/api/"))
      return reply.code(404).send({ error: "Route inconnue" });
    return reply.sendFile("index.html");
  });
} catch {}
await mkdir(config.data, { recursive: true, mode: 0o700 });
await app.listen({ port: config.port, host: "127.0.0.1" });
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, async () => {
    await app.close();
    await db.end();
    process.exit(0);
  });
