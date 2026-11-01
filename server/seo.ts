import type { FastifyInstance } from "fastify";
import { db } from "./db.ts";
import { config } from "./config.ts";
import { details, libelleCritere, resume } from "../shared/criteria.ts";
import {
  pageMeta,
  publicCopy,
  faq,
  financeursPage,
} from "../shared/content.ts";

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
  // fiches importées : critères structurés ; anciennes fiches : colonnes texte
  criteria: Object.keys(i.criteria || {}).length
    ? i.criteria
    : {
        sectors: (i.sectors || []).join(", "),
        stage: i.stage,
        geography: i.geography,
        ticket: i.ticket,
      },
  logo: i.logo,
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

// Page servie aux moteurs (Google et IA) : balises propres à l'adresse et contenu lisible sans JavaScript
type Page = {
  path: string;
  title: string;
  description: string;
  body: string;
  ld?: object[];
  image?: string;
  ogType?: string;
};
const abs = (path: string) => config.baseURL + path;
const crumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Accueil", "/"] as [string, string], ...items].map(
    ([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    }),
  ),
});
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fund Road",
  url: abs("/"),
  logo: abs("/brand/fundroad-logo.png"),
  description:
    "Plateforme française qui transforme les documents d’une startup en dossier de financement sourcé, signale ce qui manque face aux critères des financeurs et des aides publiques, et le partage avec business angels, fonds et incubateurs.",
};
export function renderPage(index: string, p: Page) {
  const url = abs(p.path);
  const image = p.image || abs("/brand/og.jpg");
  const head = `<title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:site_name" content="Fund Road" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:type" content="${esc(p.ogType || "website")}" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${p.ld?.length ? `<script type="application/ld+json">${JSON.stringify(p.ld).replace(/</g, "\\u003c")}</script>` : ""}`;
  return index
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
    .replace("</head>", head + "\n  </head>")
    .replace('<div id="root"></div>', `<div id="root">${p.body}</div>`);
}
const nav = `<nav><a href="/">Fund Road</a> · <a href="/entrepreneurs">Entrepreneurs</a> · <a href="/financeurs">Financeurs</a> · <a href="/annuaire">Annuaire des financeurs</a> · <a href="/tarifs">Tarifs</a> · <a href="/referentiel">Référentiel</a></nav>`;
const list = (t: string, xs?: string[]) =>
  xs?.length
    ? `<h2>${esc(t)}</h2><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
    : "";

export function renderProfile(index: string, p: any) {
  const name = p.theme?.name || p.name;
  const c = p.criteria || {};
  const r = resume(c);
  const kind = kinds[p.kind] || p.kind || "Financeur";
  const path = `/fonds/${p.slug}`;
  const title = `${name} : critères, ticket et candidature | Fund Road`;
  const facts = [
    ["Ticket", r.ticket],
    ["Stade", r.stage],
    ["Zone", r.geography],
    ["Secteurs", r.sectors],
  ].filter(([, v]) => v);
  const extra = details(p.kind, c).map((d) => [d.champ.label, d.texte]);
  const description = (
    `${name} (${kind.toLowerCase()}) : ` +
    (facts.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ") ||
      "critères d’investissement") +
    ". Pièces demandées et comment candidater avec Fund Road."
  )
    // Google tronque vers 160 caractères : on coupe sur un mot
    .replace(/^(.{0,157})\s.*$/s, "$1…");
  const logo = p.logo ? abs(`/api/${p.claimed ? "organizations" : "investors"}/${p.id}/logo`) : "";
  return renderPage(index, {
    path,
    title,
    description,
    ogType: "profile",
    ...(logo && { image: logo }),
    ld: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: title,
        url: abs(path),
        mainEntity: {
          "@type": "Organization",
          name,
          description: p.theme?.intro || description,
          ...(logo && { logo }),
          ...(p.sourceUrl && { sameAs: [p.sourceUrl] }),
        },
      },
      crumbs([
        ["Annuaire des financeurs", "/annuaire"],
        [name, path],
      ]),
    ],
    body: `<main>${nav}
    <h1>${esc(name)}</h1><p>${esc(kind)}</p>
    ${p.theme?.intro ? `<p>${esc(p.theme.intro)}</p>` : ""}
    <dl>${[...facts, ...extra].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    ${c.exclusions ? `<p>Hors périmètre : ${esc(c.exclusions)}</p>` : ""}
    ${list(`Pièces demandées par ${name}`, c.documents)}
    ${list(`Ils ont été accompagnés ou financés par ${name}`, c.notables)}
    ${list(
      "Sources",
      Object.entries<any>(c.sources || {}).map(([k, v]) => `${libelleCritere(p.kind, k)} : « ${v.citation} » (${v.url})`),
    )}
    ${list(`Questions de ${name}`, c.questions)}
    <h2>Comment candidater auprès de ${esc(name)}</h2>
    <p>Préparez votre dossier de financement sur Fund Road : vos documents sont structurés selon les critères de ${esc(name)} et vous voyez ce qui manque avant l’envoi.</p></main>`,
  });
}

const faqLd = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
// Pages publiques fixes : textes partagés avec l'interface (shared/content.ts)
async function staticPage(path: string): Promise<Page | null> {
  const meta = pageMeta[path];
  if (!meta) return null;
  const base = { path, ...meta };
  if (path === "/") {
    const offers = await priced();
    return {
      ...base,
      ld: [
        organization,
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Fund Road",
          url: abs("/"),
          inLanguage: "fr-FR",
        },
        software(offers),
        faqLd(faq),
      ],
      body: `<main>${nav}
      <h1>Votre dossier de levée, prêt pour le comité.</h1>
      <p>${esc(organization.description)}</p>
      <h2>Comment ça marche</h2>
      <ol><li>Déposez vos documents : business plan, deck, prévisionnel (PDF, Word, PowerPoint, Excel).</li>
      <li>Validez ce que l’IA a trouvé : chaque information cite le passage exact de votre document, rien n’est inventé.</li>
      <li>Partagez une version datée avec le financeur de votre choix, révocable à tout moment.</li></ol>
      <h2>Ce que vérifie un financeur</h2>
      <p>Neuf rubriques : entreprise, équipe, problème, marché, modèle économique, traction, finances, besoin de financement, utilisation des fonds. Fund Road confronte aussi le dossier aux critères publiés de programmes publics comme la Bourse French Tech, i-Lab ou le Pass PI de l’INPI : un critère n’est marqué rempli que s’il est cité dans vos documents, sinon il reste à vérifier.</p>
      <h2>Questions fréquentes</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
      <p><a href="/annuaire">Consulter l’annuaire des fonds, business angels et incubateurs</a> · <a href="/tarifs">Voir les tarifs</a></p></main>`,
    };
  }
  if (path === "/tarifs") {
    const offers = await priced();
    return {
      ...base,
      ld: [software(offers), crumbs([["Tarifs", path]])],
      body: `<main>${nav}<h1>Un prix simple, selon votre rôle.</h1>
      <ul>${offers.map((o) => `<li>${esc(o.name)} : ${o.price} €${o.unit}. ${esc(o.description)}</li>`).join("")}
      <li>Fonds, business angels et incubateurs : gratuit pendant le lancement.</li></ul>
      <p>Aucune commission sur les levées ni sur les subventions obtenues. TVA non applicable, article 293 B du CGI.</p></main>`,
    };
  }
  if (path === "/annuaire") {
    const profiles = await listProfiles();
    return {
      ...base,
      ld: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: meta.title,
          url: abs(path),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: profiles.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.theme?.name || p.name,
              url: abs("/fonds/" + p.slug),
            })),
          },
        },
        crumbs([["Annuaire des financeurs", path]]),
      ],
      body: `<main>${nav}<h1>Annuaire des fonds, business angels et incubateurs</h1>
      <p>Critères, tickets, pièces demandées et questions de chaque financeur, pour préparer votre candidature.</p>
      <ul>${profiles
        .map(
          (p) =>
            `<li><a href="/fonds/${esc(p.slug)}">${esc(p.theme?.name || p.name)}</a> · ${esc(kinds[p.kind] || p.kind || "Financeur")}${resume(p.criteria).ticket ? ` · ticket ${esc(resume(p.criteria).ticket)}` : ""}</li>`,
        )
        .join("")}</ul></main>`,
    };
  }
  if (path === "/financeurs") {
    const f = financeursPage;
    return {
      ...base,
      ld: [faqLd(f.faq), crumbs([["Financeurs", path]])],
      body: `<main>${nav}<h1>${esc(f.title)}</h1><p>${esc(f.intro)}</p>
      ${f.steps.map((x, i) => `<h2>${i + 1}. ${esc(x.t)}</h2><p>${esc(x.s)}</p><ul>${x.pts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`).join("")}
      ${f.features.map(([t, d]) => `<h2>${esc(t)}</h2><p>${esc(d)}</p>`).join("")}
      <h2>Questions fréquentes</h2>
      ${f.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
      <p><a href="/inscription">Créer mon espace financeur</a> · <a href="/annuaire">Voir l’annuaire</a></p></main>`,
    };
  }
  const key = path.slice(1);
  const copy = publicCopy[key];
  if (!copy) return null;
  const extra =
    key === "ressources"
      ? (
          await db.query(
            "SELECT slug,title,excerpt FROM content_pages ORDER BY published_at DESC",
          )
        ).rows
          .map(
            (r) =>
              `<li><a href="/ressources/${esc(r.slug)}">${esc(r.title)}</a> · ${esc(r.excerpt)}</li>`,
          )
          .join("")
      : "";
  return {
    ...base,
    ld: [crumbs([[copy.title, path]])],
    body: `<main>${nav}<h1>${esc(copy.title)}</h1><p>${esc(copy.intro)}</p>
    ${copy.items.map(([t, d]) => `<h2>${esc(t)}</h2><p>${esc(d)}</p>`).join("")}
    ${extra ? `<ul>${extra}</ul>` : ""}</main>`,
  };
}
// Offres affichées : Découverte gratuite + offre payante en base
async function priced() {
  const dossier = (
    await db.query("SELECT label,price_cents FROM offers WHERE id='dossier'")
  ).rows[0];
  return [
    {
      name: "Découverte",
      price: 0,
      unit: "",
      description:
        "Dossier même incomplet, dépôt des pièces, annuaire et envoi aux financeurs, une analyse IA offerte par mois.",
    },
    ...(dossier
      ? [
          {
            name: dossier.label,
            price: dossier.price_cents / 100,
            unit: " pour 90 jours",
            description:
              "Analyses IA, critères des aides et des financeurs, exports PDF et Word, partages révocables.",
          },
        ]
      : []),
  ];
}
const software = (offers: Awaited<ReturnType<typeof priced>>) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fund Road",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "fr-FR",
  url: abs("/"),
  offers: offers.map((o) => ({
    "@type": "Offer",
    name: o.name,
    price: o.price,
    priceCurrency: "EUR",
  })),
});

// Pages applicatives : jamais indexées
const privatePaths =
  /^\/(app|connexion|inscription|mot-de-passe|double-auth|partages|invitation|verification)(\/|$)/;
// Toutes les adresses connues de l'interface ; le reste est une vraie 404
const spaPaths =
  /^\/(app|connexion|inscription|mot-de-passe|double-auth|partages|invitation|verification|ressources)(\/|$)/;

export function registerSeo(app: FastifyInstance, index: string) {
  const html = (reply: any) =>
    reply.type("text/html; charset=utf-8").header("Cache-Control", "no-cache");
  for (const path of Object.keys(pageMeta))
    app.get(path, async (_req, reply) =>
      html(reply).send(renderPage(index, (await staticPage(path))!)),
    );
  app.get("/ressources/:slug", async (req: any, reply) => {
    const r = (
      await db.query(
        "SELECT slug,title,excerpt,body FROM content_pages WHERE slug=$1",
        [req.params.slug],
      )
    ).rows[0];
    html(reply);
    if (!r) return reply.code(404).send(index);
    const path = "/ressources/" + r.slug;
    return renderPage(index, {
      path,
      title: `${r.title} | Fund Road`,
      description: (r.excerpt || r.title).slice(0, 160),
      ogType: "article",
      ld: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: r.title,
          description: r.excerpt,
          inLanguage: "fr-FR",
          publisher: organization,
          mainEntityOfPage: abs(path),
        },
        crumbs([
          ["Guides", "/ressources"],
          [r.title, path],
        ]),
      ],
      body: `<main>${nav}<article><h1>${esc(r.title)}</h1><p>${esc(r.excerpt)}</p>${String(
        r.body,
      )
        .split(/\n{2,}/)
        .map((x) => `<p>${esc(x.replace(/^#+\s*/, ""))}</p>`)
        .join("")}</article></main>`,
    });
  });
  for (const route of ["/fonds/:slug", "/portail/:slug"])
    app.get(route, async (req: any, reply) => {
      const p = await findProfile(req.params.slug);
      html(reply);
      if (!p) return reply.code(404).send(index);
      // l'ancienne adresse /portail/ renvoie définitivement vers /fonds/
      if (route.startsWith("/portail"))
        return reply.redirect("/fonds/" + p.slug, 301);
      return renderProfile(index, p);
    });
  // Repli de l'interface : pages privées en noindex, adresses inconnues en 404
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith("/api/"))
      return reply.code(404).send({ error: "Route inconnue" });
    const path = req.url.split("?")[0];
    html(reply);
    const page = privatePaths.test(path)
      ? index.replace(
          "</head>",
          '<meta name="robots" content="noindex" />\n  </head>',
        )
      : index;
    return reply.code(spaPaths.test(path) ? 200 : 404).send(page);
  });
  app.get("/sitemap.xml", async (_req, reply) => {
    const pages = [
      ...Object.keys(pageMeta),
      ...(await listProfiles()).map((p) => "/fonds/" + p.slug),
      ...(
        await db.query("SELECT slug FROM content_pages ORDER BY slug")
      ).rows.map((r) => "/ressources/" + r.slug),
    ];
    // date de dernière vérification des fiches d'annuaire, pour que Google repasse sur les fiches mises à jour
    const verifiees = new Map<string, string>(
      (
        await db.query(
          "SELECT slug, verified_at FROM investors WHERE active=true AND slug IS NOT NULL AND verified_at IS NOT NULL",
        )
      ).rows.map((r) => ["/fonds/" + r.slug, new Date(r.verified_at).toISOString().slice(0, 10)]),
    );
    reply.type("application/xml");
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${esc(abs(p))}</loc>${verifiees.has(p) ? `<lastmod>${verifiees.get(p)}</lastmod>` : ""}</url>`).join("\n")}
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

Sitemap: ${abs("/sitemap.xml")}
`;
  });
  // Résumé pour les assistants IA (convention llms.txt)
  app.get("/llms.txt", async (_req, reply) => {
    const profiles = await listProfiles();
    reply.type("text/plain; charset=utf-8");
    return `# Fund Road

> ${organization.description}

Fund Road est édité en France. Le score mesure la complétude d’un dossier, pas ses chances de financement. Aucune commission n’est prise sur les levées ou subventions.

## Pages principales
${Object.entries(pageMeta)
  .map(([p, m]) => `- [${m.title}](${abs(p)}): ${m.description}`)
  .join("\n")}

## Annuaire des financeurs
${profiles.map((p) => `- [${p.theme?.name || p.name}](${abs("/fonds/" + p.slug)}): ${kinds[p.kind] || p.kind || "Financeur"}${resume(p.criteria).ticket ? `, ticket ${resume(p.criteria).ticket}` : ""}`).join("\n")}
`;
  });
}
