import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db, transaction } from "./db.ts";
import { user, admin, fail } from "./access.ts";
import { uniqueSlug } from "./seo.ts";
const httpsURL = z
  .string()
  .url()
  .refine(
    (value) => new URL(value).protocol === "https:",
    "Une source HTTPS est requise",
  );
export async function registerContent(app: FastifyInstance) {
  app.get(
    "/api/resources",
    async () =>
      (
        await db.query(
          "SELECT slug,title,excerpt,published_at FROM content_pages ORDER BY published_at DESC",
        )
      ).rows,
  );
  app.get("/api/resources/:slug", async (req: any) => {
    const page = (
      await db.query(
        "SELECT slug,title,excerpt,body,source_url,published_at FROM content_pages WHERE slug=$1",
        [req.params.slug],
      )
    ).rows[0];
    if (!page) fail(404, "Ressource introuvable");
    return page;
  });
  app.get("/api/admin/content", async (req) => {
    const u = await user(req);
    admin(u);
    return (
      await db.query(
        "SELECT * FROM legacy_content ORDER BY imported_at DESC LIMIT 500",
      )
    ).rows;
  });
  app.post("/api/admin/content/:id/reject", async (req: any) => {
    const u = await user(req);
    admin(u);
    const row = await db.query(
      "UPDATE legacy_content SET status='rejected',reviewed_at=now(),reviewed_by=$2 WHERE id=$1 AND status='pending' RETURNING id",
      [req.params.id, u.id],
    );
    if (!row.rowCount) fail(409, "Contenu absent ou déjà traité");
    return { ok: true };
  });
  app.post("/api/admin/content/:id/publish", async (req: any) => {
    const u = await user(req);
    admin(u);
    const b = z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(150),
        title: z.string().trim().min(3).max(200),
        excerpt: z.string().max(1000),
        body: z.string().min(30).max(200000),
        sourceUrl: httpsURL,
        confirmed: z.literal(true),
      })
      .parse(req.body);
    return transaction(async (c) => {
      const row = (
        await c.query("SELECT * FROM legacy_content WHERE id=$1 FOR UPDATE", [
          req.params.id,
        ])
      ).rows[0];
      if (!row || row.source_kind === "investors")
        fail(400, "Ressource éditoriale requise");
      if (row.status !== "pending") fail(409, "Contenu déjà traité");
      await c.query(
        "INSERT INTO content_pages(id,legacy_id,slug,title,excerpt,body,source_url) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(legacy_id) DO UPDATE SET slug=$3,title=$4,excerpt=$5,body=$6,source_url=$7,updated_at=now()",
        [randomUUID(), row.id, b.slug, b.title, b.excerpt, b.body, b.sourceUrl],
      );
      await c.query(
        "UPDATE legacy_content SET status='published',reviewed_at=now(),reviewed_by=$2 WHERE id=$1",
        [row.id, u.id],
      );
      return { slug: b.slug };
    });
  });
  app.post("/api/admin/content/:id/investor", async (req: any) => {
    const u = await user(req);
    admin(u);
    const b = z
      .object({
        name: z.string().trim().min(2).max(200),
        kind: z.enum(["fund", "angel", "network", "grant", "incubator"]),
        description: z.string().max(5000),
        sectors: z.array(z.string().max(100)).max(30),
        stage: z.string().max(1000),
        geography: z.string().max(1000),
        ticket: z.string().max(1000),
        sourceUrl: httpsURL,
        applicationUrl: httpsURL.optional(),
        confirmed: z.literal(true),
      })
      .parse(req.body);
    // adresse publique de la fiche : /fonds/<slug>, conservée lors des mises à jour
    const slug = await uniqueSlug(b.name);
    return transaction(async (c) => {
      const row = (
        await c.query("SELECT * FROM legacy_content WHERE id=$1 FOR UPDATE", [
          req.params.id,
        ])
      ).rows[0];
      if (!row || row.source_kind !== "investors")
        fail(400, "Financeur requis");
      if (row.status !== "pending") fail(409, "Contenu déjà traité");
      await c.query(
        `INSERT INTO investors(id,name,kind,description,sectors,stage,geography,ticket,source_url,application_url,verified_at,active,slug) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),true,$11) ON CONFLICT(id) DO UPDATE SET name=$2,kind=$3,description=$4,sectors=$5,stage=$6,geography=$7,ticket=$8,source_url=$9,application_url=$10,verified_at=now(),active=true,slug=COALESCE(investors.slug,$11)`,
        [
          row.id,
          b.name,
          b.kind,
          b.description,
          b.sectors,
          b.stage,
          b.geography,
          b.ticket,
          b.sourceUrl,
          b.applicationUrl || null,
          slug,
        ],
      );
      await c.query(
        "UPDATE legacy_content SET status='published',reviewed_at=now(),reviewed_by=$2 WHERE id=$1",
        [row.id, u.id],
      );
      return { id: row.id };
    });
  });
}
