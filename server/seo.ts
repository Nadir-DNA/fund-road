import type { FastifyInstance } from "fastify";
import { db } from "./db.ts";
import { config } from "./config.ts";

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "financeur";
// URL lisible (« /fonds/capital-demo ») ; suffixe numérique seulement en cas d'homonyme
export async function uniqueSlug(name: string) {
  const base = slugify(name);
  for (let i = 1; ; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const taken = (
      await db.query(
        "SELECT 1 FROM organizations WHERE slug=$1 UNION ALL SELECT 1 FROM investors WHERE slug=$1",
        [slug],
      )
    ).rowCount;
    if (!taken) return slug;
  }
}

// Un profil = un financeur inscrit (fiche revendiquée) ou une fiche d'annuaire vérifiée par l'équipe
const investorProfile = (i: any) => ({
  id: i.id,
  name: i.name,
  kind: i.kind,
  slug: i.slug,
  theme: { name: i.name, intro: i.description },
  criteria: {
    sectors: (i.sectors || []).join(", "),
    stage: i.stage,
    geography: i.geography,
    ticket: i.ticket,
  },
  logo: null,
  claimed: false,
  sourceUrl: i.source_url,
  applicationUrl: i.application_url,
  verifiedAt: i.verified_at,
});
export async function findProfile(slug: string) {
  const o = (
    await db.query(
      "SELECT id,name,kind,slug,theme,criteria,logo FROM organizations WHERE slug=$1 AND kind<>'startup'",
      [slug],
    )
  ).rows[0];
  if (o) return { ...o, claimed: true };
  const i = (
    await db.query(
      "SELECT * FROM investors WHERE slug=$1 AND active=true AND organization_id IS NULL",
      [slug],
    )
  ).rows[0];
  return i ? investorProfile(i) : null;
}
export async function listProfiles() {
  const orgs = (
    await db.query(
      "SELECT id,name,kind,slug,theme,criteria,logo FROM organizations WHERE kind<>'startup' AND criteria<>'{}'::jsonb ORDER BY name",
    )
  ).rows.map((o) => ({ ...o, claimed: true }));
  const investors = (
    await db.query(
      "SELECT * FROM investors WHERE active=true AND organization_id IS NULL AND slug IS NOT NULL ORDER BY name",
    )
  ).rows.map(investorProfile);
  return [...orgs, ...investors];
}

const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const kinds: Record<string, string> = {
  angel: "Business angel",
  fund: "Fonds d’investissement",
  network: "Réseau de business angels",
  grant: "Organisme de financement",
  incubator: "Incubateur",
};

// Page servie aux moteurs : balises propres au financeur et contenu lisible sans JavaScript
export function renderProfile(index: string, p: any) {
  const name = p.theme?.name || p.name;
  const c = p.criteria || {};
  const kind = kinds[p.kind] || p.kind || "Financeur";
  const url = `${config.baseURL}/fonds/${p.slug}`;
  const title = `${name} : critères, ticket et candidature | Fund Road`;
  const facts = [
    ["Ticket", c.ticket],
    ["Stade", c.stage],
    ["Zone", c.geography],
    ["Secteurs", c.sectors],
  ].filter(([, v]) => v);
  const description = (
    `${name} (${kind.toLowerCase()}) : ` +
    (facts.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ") ||
      "critères d’investissement") +
    ". Pièces demandées et questions pour candidater, dossier préparé avec Fund Road."
  ).slice(0, 300);
  const logo = p.logo ? `${config.baseURL}/api/organizations/${p.id}/logo` : "";
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: title,
      url,
      mainEntity: {
        "@type": "Organization",
        name,
        description: p.theme?.intro || description,
        ...(logo && { logo }),
        ...(p.sourceUrl && { sameAs: [p.sourceUrl] }),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        ["Accueil", config.baseURL + "/"],
        ["Annuaire des financeurs", config.baseURL + "/annuaire"],
        [name, url],
      ].map(([n, item], i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: n,
        item,
      })),
    },
  ];
  const head = `<title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    ${logo ? `<meta property="og:image" content="${esc(logo)}" />` : ""}
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  const list = (t: string, xs?: string[]) =>
    xs?.length
      ? `<h2>${esc(t)}</h2><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
      : "";
  const body = `<main><nav><a href="/annuaire">Annuaire des financeurs</a></nav>
    <h1>${esc(name)}</h1><p>${esc(kind)}</p>
    ${p.theme?.intro ? `<p>${esc(p.theme.intro)}</p>` : ""}
    <dl>${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    ${c.exclusions ? `<p>Hors périmètre : ${esc(c.exclusions)}</p>` : ""}
    ${list(`Pièces demandées par ${name}`, c.documents)}
    ${list(`Questions de ${name}`, c.questions)}
    <h2>Comment candidater auprès de ${esc(name)}</h2>
    <p>Préparez votre dossier de financement sur Fund Road : vos documents sont structurés selon les critères de ${esc(name)} et vous voyez ce qui manque avant l’envoi.</p></main>`;
  return index
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
    .replace("</head>", head + "\n  </head>")
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

export function registerSeo(app: FastifyInstance, index: string) {
  for (const route of ["/fonds/:slug", "/portail/:slug"])
    app.get(route, async (req: any, reply) => {
      const p = await findProfile(req.params.slug);
      reply.type("text/html; charset=utf-8");
      if (!p) return reply.code(404).send(index);
      // l'ancienne adresse /portail/ renvoie définitivement vers /fonds/
      if (route.startsWith("/portail"))
        return reply.redirect("/fonds/" + p.slug, 301);
      return renderProfile(index, p);
    });
  app.get("/sitemap.xml", async (_req, reply) => {
    const pages = [
      "/",
      "/annuaire",
      "/tarifs",
      "/entrepreneurs",
      "/financeurs",
      "/referentiel",
      ...(await listProfiles()).map((p) => "/fonds/" + p.slug),
    ];
    reply.type("application/xml");
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${esc(config.baseURL + p)}</loc></url>`).join("\n")}
</urlset>`;
  });
  app.get("/robots.txt", async (_req, reply) => {
    reply.type("text/plain");
    return `User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/
Disallow: /partages/
Disallow: /invitation/
Disallow: /verification/

Sitemap: ${config.baseURL}/sitemap.xml
`;
  });
}
