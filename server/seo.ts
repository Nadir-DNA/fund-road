import type { FastifyInstance } from "fastify";
import { db } from "./db.ts";
import { config } from "./config.ts";
import { details, libelleCritere, resume } from "../shared/criteria.ts";
import { editorial } from "../shared/editorial.generated.ts";
import { profileTitle, profileDescription, slugify, showAidesLink } from "../shared/seo.ts";
import { programFaq, profileFaq } from "../shared/faq.ts";

export { slugify };

export { profileTitle, profileDescription };
import { programs, type Program } from "../shared/programs.ts";
import {
  pageMeta,
  publicCopy,
  faq,
  financeursPage,
} from "../shared/content.ts";

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
  robots?: string;
  /** Canonique imposée (fiche qui pointe vers sa page de référence). */
  canonical?: string;
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
  const url = abs(p.canonical || p.path);
  const image = p.image || abs("/brand/og.jpg");
  const head = `<title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />${p.robots ? `\n    <meta name="robots" content="${esc(p.robots)}" />` : ""}
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:site_name" content="Fund Road" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:type" content="${esc(p.ogType || "website")}" />
    <meta property="og:title" content="${esc(p.title)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(p.title)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    ${p.ld?.length ? `<script type="application/ld+json">${JSON.stringify(p.ld).replace(/</g, "\\u003c")}</script>` : ""}`;
  return index
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, "")
    .replace("</head>", head + "\n  </head>")
    .replace('<div id="root"></div>', `<div id="root">${p.body}</div>`);
}
const nav = `<nav><a href="/">Fund Road</a> · <a href="/entrepreneurs">Entrepreneurs</a> · <a href="/financeurs">Financeurs</a> · <a href="/referentiel">Le référentiel</a> · <a href="/annuaire">Annuaire</a> · <a href="/tarifs">Tarifs</a></nav>`;
const list = (t: string, xs?: string[]) =>
  xs?.length
    ? `<h2>${esc(t)}</h2><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
    : "";

type Offer = { name: string; price: number; unit: string; description: string };
/** Corps SSR de /tarifs : premier écran aligné sur le client, puis la liste des prix (hors écran). */
export function tarifsBody(offers: Offer[]) {
  return `${nav}<main class="section info-page"><h1>Un prix simple, selon votre rôle</h1>
    <p class="lede">Fund Road est gratuit pour commencer : l'offre Découverte (0 €) donne un dossier de financement complet et l'envoi aux financeurs. L'offre complète ajoute les exports PDF et Word, à 149 € tous les 90 jours, résiliable. Les fonds, business angels et incubateurs sont gratuits pendant le lancement, et Fund Road ne prend aucune commission sur les levées ni sur les subventions obtenues.</p>
      <p class="lead">Les startups commencent gratuitement : dossier complet, envoi aux financeurs et suivi. L’offre complète ajoute les exports PDF et Word, à 149 € tous les 90 jours, résiliable. Les financeurs et incubateurs sont gratuits pendant le lancement.</p>
      <h3>Découverte</h3><ul><li>Dossier de financement complet, envoi aux financeurs</li><li>Dépôt de vos pièces</li><li>Annuaire des financeurs</li><li>Une analyse IA offerte chaque mois</li><li>Partages révocables et suivi des étapes</li></ul>
      <h3>Offre complète</h3><p>Tout Découverte, plus :</p><ul><li>Exports PDF et Word de vos dossiers</li></ul>
      <h3>Fonds, business angels, incubateurs</h3><ul><li>Suivi de vos startups et de leur complétude</li><li>Vos critères, questions et pièces demandées</li><li>Adéquation calculée à chaque dossier reçu</li><li>Notes privées d’équipe</li></ul>
      <dl class="tarifs-offres">
        <dt>Découverte</dt><dd>0 €</dd>
        ${offers.filter((o) => o.name !== "Découverte").map((o) => `<dt>${esc(o.name)}</dt><dd>${o.price} €${esc(o.unit)}</dd>`).join("")}
        <dt>Fonds, business angels et incubateurs</dt><dd>0 € pendant le lancement</dd>
      </dl>
      <p>Le partage d’un dossier exige les neuf rubriques confirmées, sans contradiction ; les rubriques manquantes sont listées dans l’application.</p>
      <p>Paiement par carte. L’offre complète est à 149 € tous les 90 jours, renouvellement automatique, résiliable à tout moment ; à l’expiration, vos dossiers restent accessibles et partageables, seuls les exports sont désactivés.</p>
      <p>Aucune commission sur les levées ni sur les subventions obtenues. TVA non applicable, article 293 B du CGI.</p></main>`;
}

// Guide d'un programme public (critères vérifiés et sourcés) pour la page du financeur du même nom
function programGuide(prog: Program, name: string) {
  const conditions = prog.criteria.filter((c) => c.blocking).map((c) => c.label);
  const pieces = prog.criteria.filter((c) => !c.blocking).map((c) => `${c.label} : ${c.question}`);
  const faq: [string, string][] = programFaq(prog, name);
  const body = `<h2>Montant et nature de l’aide</h2><p>${esc(prog.kind)} · ${esc(prog.amount)}. ${esc(prog.summary)}</p>
    ${list(`Conditions d’éligibilité de ${name}`, conditions)}
    ${list(`Ce qu’il faut préparer pour ${name}`, pieces)}
    <p>Critères vérifiés le ${esc(prog.verifiedAt.split("-").reverse().join("/"))} auprès de : ${prog.sources.map((x) => `<a href="${esc(x.url)}" rel="nofollow noopener">${esc(x.label)}</a>`).join(", ")}.</p>
    <h2>Questions fréquentes sur ${esc(name)}</h2>
    ${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
    <p><a href="/aides">Guide complet des aides publiques</a> · <a href="/entrepreneurs">Préparer son dossier</a></p>`;
  return { body, faq };
}

export function renderProfile(index: string, p: any) {
  if (p?.slug && editorial[`/fonds/${p.slug}`]?.validated) return renderPage(index, editorialPage(`/fonds/${p.slug}`)!);
  const name = p.theme?.name || p.name;
  const prog = programs.find((x) => slugify(x.name) === p.slug || x.id.replace(/_/g, "-") === p.slug);
  const guide = prog && programGuide(prog, name);
  const c = p.criteria || {};
  const r = resume(c);
  const kind = kinds[p.kind] || p.kind || "Financeur";
  const path = `/fonds/${p.slug}`;
  const title = profileTitle(name);
  const facts = [
    ["Ticket", r.ticket],
    ["Stade", r.stage],
    ["Zone", r.geography],
    ["Secteurs", r.sectors],
  ].filter(([, v]) => v);
  const extra = details(p.kind, c).map((d) => [d.champ.label, d.texte]);
  const metaImposee = typeof c.meta === "string" && c.meta.trim() ? c.meta.trim() : "";
  const description = metaImposee || profileDescription(
    prog
      ? [`${name}.`, `Organisme : ${prog.operator}.`, `${prog.amount}.`, "Conditions et pièces détaillées sur la fiche."]
      : [
          `${name}.`,
          ...(facts.map(([k, v]) => `${k} : ${v}.`)),
          "Pièces demandées et conditions sur la fiche.",
        ],
  );
  const faq: [string, string][] = guide ? guide.faq : profileFaq(name, r, p.applicationUrl);
  const logo = p.logo ? abs(`/api/${p.claimed ? "organizations" : "investors"}/${p.id}/logo`) : "";
  return renderPage(index, {
    path,
    title,
    description,
    ogType: "profile",
    ...(typeof c.canonical === "string" && c.canonical ? { canonical: c.canonical } : {}),
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
      ...(faq.length ? [faqLd(faq)] : []),
    ],
    body: `<main>${nav}
    <h1>${esc(name)}</h1><p>${esc(kind)}</p>
    ${c.lien?.href ? `<p><a href="${esc(c.lien.href)}">${esc(c.lien.label || c.lien.href)}</a></p>` : ""}
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
    ${guide?.body ?? (faq.length ? `<h2>Questions fréquentes sur ${esc(name)}</h2>${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}` : "")}
    ${!guide && showAidesLink(p.kind, !!prog) ? `<p><a href="/aides">Guide complet des aides publiques</a> · <a href="/entrepreneurs">Préparer son dossier</a></p>` : ""}
    ${faq.some(([q]) => /candidater/i.test(q)) ? "" : `<h2>Comment candidater auprès de ${esc(name)}</h2>
    <p>Préparez votre dossier de financement sur Fund Road : vos documents sont structurés selon les critères de ${esc(name)} et vous voyez ce qui manque avant l’envoi.</p>`}</main>`,
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
/** Page éditoriale validée (contenus-seo) : HTML, FAQPage et fil d'Ariane. */
function editorialPage(path: string): Page | null {
  const e = editorial[path];
  if (!e?.validated) return null;
  const trail: [string, string][] = path.startsWith("/fonds/")
    ? [["Annuaire des financeurs", "/annuaire"], [e.h1, path]]
    : path.startsWith("/ressources/") ? [["Guides", "/ressources"], [e.h1, path]]
    : path === "/aides" ? [["Aides publiques", "/aides"]] : [["Aides publiques", "/aides"], [e.h1, path]];
  return {
    path,
    title: e.title,
    description: e.description,
    ogType: "article",
    ld: [...(e.faq ? [e.faq] : []), crumbs(trail)],
    body: `<main>${nav}<article><h1>${esc(e.h1)}</h1>${e.html}</article></main>`,
  };
}

/** Guides /ressources/* validés, dans l'ordre du fichier généré. */
const editorialGuides = () =>
  Object.entries(editorial).filter(([p, e]) => p.startsWith("/ressources/") && e.validated);

// Pages publiques fixes : textes partagés avec l'interface (shared/content.ts)
async function staticPage(path: string): Promise<Page | null> {
  const ed = editorialPage(path);
  if (ed) return ed;
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
      <h1>Votre dossier de levée, structuré pour le comité.</h1>
      <p class="lede">Fund Road transforme les documents d'une startup (business plan, deck, prévisionnel) en dossier de financement sourcé : chaque information cite le passage exact du document, et ce qui manque reste marqué « à compléter ». Le dossier est confronté aux critères publiés de programmes publics comme la Bourse French Tech, i-Lab ou le Pass PI, puis partagé avec le financeur de votre choix. Fund Road ne garantit pas un financement : le score mesure la complétude du dossier, pas vos chances.</p>
      <p>${esc(organization.description)}</p>
      <h2>Comment ça marche</h2>
      <ol><li>Déposez vos documents : business plan, deck, prévisionnel (PDF, Word, PowerPoint, Excel).</li>
      <li>Validez ce que l’IA a trouvé : chaque information cite le passage exact de votre document, rien n’est inventé.</li>
      <li>Partagez une version datée avec le financeur de votre choix, révocable à tout moment.</li></ol>
      <h2>Ce que vérifie un financeur</h2>
      <p>Neuf rubriques : entreprise, équipe, problème, marché, modèle économique, traction, finances, besoin de financement, utilisation des fonds. Fund Road confronte aussi le dossier aux critères publiés de programmes publics comme la Bourse French Tech, i-Lab ou le Pass PI de l’INPI : un critère n’est marqué rempli que s’il est cité dans vos documents, sinon il reste à vérifier.</p>
      <h2>Questions fréquentes</h2>
      ${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
      <h2>Aides et programmes</h2>
      <ul>
        <li><a href="/aides">Toutes les aides publiques</a></li>
        <li><a href="/fonds/bourse-french-tech">Bourse French Tech</a></li>
        <li><a href="/fonds/eic-accelerator">EIC Accelerator</a></li>
        <li><a href="/fonds/concours-i-lab">Concours i-Lab</a></li>
        <li><a href="/aides/subventions-bpifrance">Subventions Bpifrance</a></li>
      </ul>
      <p><a href="/annuaire">Consulter l’annuaire des fonds, business angels et incubateurs</a> · <a href="/tarifs">Voir les tarifs</a></p></main>`,
    };
  }
  if (path === "/tarifs") {
    const offers = await priced();
    return {
      ...base,
      ld: [software(offers), crumbs([["Tarifs", path]])],
      body: tarifsBody(offers),
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
      body: `<main>${nav}<h1>Annuaire des fonds, business angels et incubateurs</h1><p class="lede">L'annuaire de Fund Road recense des fonds d'investissement, des réseaux de business angels, des incubateurs et des organismes de financement, avec leurs critères, leur ticket quand il est publié, les pièces demandées et leurs questions. Il sert à repérer les financeurs dont le stade et le secteur correspondent au projet avant de candidater.</p>
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
      body: `${nav}<main class="home"><section class="hero"><div class="hero-inner"><div class="hero-copy"><h1>${esc(f.title)}</h1><div><p>${esc(f.intro)}</p><div class="hero-actions"><a class="button accent" href="/inscription?profil=financeur">Créer mon espace financeur</a> <a class="button ghost" href="/annuaire">Voir l’annuaire</a></div></div></div><ul class="hero-points">${f.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></section>
      ${f.steps.map((x) => `<h3>${esc(x.t)}</h3><p>${esc(x.s)}</p><ul>${x.pts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`).join("")}
      ${f.features.map(([t, d]) => `<h2>${esc(t)}</h2><p>${esc(d)}</p>`).join("")}
      <h2>Questions fréquentes</h2>
      ${f.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
      <p><a href="/inscription">Créer mon espace financeur</a></p><p><a href="/annuaire">Voir l’annuaire</a></p></main>`,
    };
  }
  const key = path.slice(1);
  const copy = publicCopy[key];
  if (!copy) return null;
  const resourceRows =
    key === "ressources"
      ? (
          await db.query(
            "SELECT slug,title,excerpt FROM content_pages WHERE validated=true ORDER BY published_at DESC",
          )
        ).rows
      : [];
  // Guides éditoriaux validés (contenus-seo) : listés sur /ressources avec ceux de la base
  const guides = key === "ressources" ? editorialGuides() : [];
  const extra = [
    ...guides.map(([p, e]) => `<li><a href="${p}">${esc(e.h1)}</a> · ${esc(e.description)}</li>`),
    ...resourceRows
    .map(
      (r: any) =>
        `<li><a href="/ressources/${esc(r.slug)}">${esc(r.title)}</a> · ${esc(r.excerpt)}</li>`,
    )
    ].join("");
  return {
    ...base,
    ...(key === "ressources" && resourceRows.length === 0 && guides.length === 0 ? { robots: "noindex,follow" } : {}),
    ld: [crumbs([[copy.title, path]])],
    body: `<main>${nav}<h1>${esc(copy.title)}</h1>${path === "/aides" ? `<p class="lede">${esc("Les aides à l'innovation se classent par étape du projet. Pour une société en création ou de moins de 2 ans, la Bourse French Tech va jusqu'à 30 000 € et la Bourse French Tech Émergence, pour une deeptech, jusqu'à 90 000 € ; le Concours i-Lab va jusqu'à 600 000 €, dans la limite de 60 % des dépenses éligibles. Les montants viennent de fiches Bpifrance lues le 10/11/2026 ; cette page ne remplace pas les fiches officielles.")}</p>` : path === "/referentiel" ? `<p class="lede">${esc("Le score de Fund Road mesure la complétude documentaire : neuf rubriques documentées et confirmées, avec les pièces et exigences applicables. Il ne mesure pas la probabilité d'obtenir un financement. L'attestation est datée, porte sur une version du dossier et un référentiel donnés, et ne certifie ni l'authenticité des documents ni la qualité d'un investissement.")}</p>` : ""}<p>${esc(copy.intro)}</p>
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
        "Dossier de financement complet, envoi aux financeurs, dépôt des pièces, annuaire, une analyse IA offerte chaque mois.",
    },
    ...(dossier
      ? [
          {
            name: "Offre complète",
            price: dossier.price_cents / 100,
            unit: " / 90 jours, résiliable",
            description:
              "Tout Découverte, plus : exports PDF et Word de vos dossiers.",
          },
        ]
      : []),
  ];
}
export const software = (offers: Awaited<ReturnType<typeof priced>>) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fund Road",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "fr-FR",
  url: abs("/"),
  offers: offers.map((o) => {
    // l'offre payante porte le nom et la description exacts affichés sur /tarifs
    const libelle = `Offre complète : exports PDF et Word, ${o.price} € tous les 90 jours`;
    return {
      "@type": "Offer",
      name: o.price > 0 ? libelle : o.name,
      ...(o.price > 0 ? { description: libelle } : {}),
      price: o.price,
      priceCurrency: "EUR",
    };
  }),
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
  // Casse et slash : 301 vers l'adresse canonique des pages publiques connues (jamais les routes privées)
  app.addHook("onRequest", async (req, reply) => {
    if (req.method !== "GET") return;
    const raw = req.raw.url?.split("?")[0] ?? "";
    const clean = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;
    const lower = clean.toLowerCase();
    const known = (x: string) => x in pageMeta || x in editorial;
    if (clean !== raw && known(lower)) return reply.redirect(lower + (req.raw.url?.includes("?") ? "?" + req.raw.url.split("?")[1] : ""), 301);
    if (raw !== lower && known(lower)) return reply.redirect(lower + (req.raw.url?.includes("?") ? "?" + req.raw.url.split("?")[1] : ""), 301);
  });
  for (const path of Object.keys(pageMeta))
    app.get(path, async (_req, reply) =>
      html(reply).send(renderPage(index, (await staticPage(path))!)),
    );
  // Pas de doublon indexable : l'ancienne URL de ressource renvoie vers le hub /aides
  app.get("/ressources/aides", async (_req, reply) => reply.redirect("/aides", 301));
  app.get("/ressources/:slug", async (req: any, reply) => {
    const guide = editorialPage("/ressources/" + req.params.slug);
    if (guide) return html(reply).send(renderPage(index, guide));
    const r = (
      await db.query(
        "SELECT slug,title,excerpt,body FROM content_pages WHERE slug=$1 AND validated=true",
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
    const notFound = index
      .replace(/<title>[\s\S]*?<\/title>/, "<title>Page introuvable | Fund Road</title>")
      .replace(
        '<div id="root"></div>',
        `<div id="root"><main>${nav}<h1>Page introuvable</h1><p>Cette adresse n’existe pas ou a changé.</p><p><a href="/">Accueil</a> · <a href="/annuaire">Annuaire des financeurs</a> · <a href="/aides">Aides publiques</a></p></main></div>`,
      );
    const privateTitles: [RegExp, string][] = [
      [/^\/app(\/|$)/, "Espace | Fund Road"],
      [/^\/connexion/, "Connexion | Fund Road"],
      [/^\/inscription/, "Créer un compte | Fund Road"],
      [/^\/mot-de-passe/, "Mot de passe | Fund Road"],
      [/^\/double-auth/, "Vérification en deux étapes | Fund Road"],
      [/^\/partages/, "Partage de dossier | Fund Road"],
      [/^\/invitation/, "Invitation | Fund Road"],
      [/^\/verification/, "Vérification | Fund Road"],
    ];
    const privateTitle = privateTitles.find(([re]) => re.test(path))?.[1];
    const page = privatePaths.test(path)
      ? index
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${privateTitle ?? "Fund Road"}</title>`)
          .replace(
            "</head>",
            '<meta name="robots" content="noindex" />\n  </head>',
          )
      : spaPaths.test(path) ? index : notFound;
    return reply.code(spaPaths.test(path) ? 200 : 404).send(page);
  });
  app.get("/sitemap.xml", async (_req, reply) => {
    const ressources = (
      await db.query("SELECT slug FROM content_pages WHERE validated=true ORDER BY slug")
    ).rows.map((r) => "/ressources/" + r.slug);
    const pages = [
      ...Object.keys(pageMeta).filter(
        (p) => (!editorial[p] || editorial[p].validated) && (p !== "/ressources" || ressources.length > 0 || editorialGuides().length > 0),
      ),
      ...(await listProfiles()).filter((p) => !p.criteria?.canonical).map((p) => "/fonds/" + p.slug),
      ...editorialGuides().map(([p]) => p),
      ...ressources,
    ];
    // date de dernière vérification des fiches d'annuaire, pour que Google repasse sur les fiches mises à jour
    const verifiees = new Map<string, string>(
      (
        await db.query(
          `SELECT slug, COALESCE((to_jsonb(i)->>'updated_at')::timestamptz, i.verified_at) AS modified
             FROM investors i
            WHERE active=true AND slug IS NOT NULL
              AND COALESCE((to_jsonb(i)->>'updated_at')::timestamptz, i.verified_at) IS NOT NULL`,
        )
      ).rows.map((r) => ["/fonds/" + r.slug, new Date(r.modified).toISOString().slice(0, 10)]),
    );
    const editorialDates = new Map(Object.entries(editorial).map(([p, e]) => [p, e.date]));
    reply.type("application/xml");
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => {
  const last = editorialDates.get(p) ?? verifiees.get(p);
  return `  <url><loc>${esc(abs(p))}</loc>${last ? `<lastmod>${last}</lastmod>` : ""}</url>`;
}).join("\n")}
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
