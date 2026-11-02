// Présentations commerciales Fund Road (HTML aux couleurs du site, exportées en PDF)
// node docs/presentations/vente/generer.mjs  → <acteur>.html, <acteur>.pdf, apercus/<acteur>-NN.png
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ICI = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = await import(path.join(ICI, "../../../node_modules/playwright/index.mjs"));

const route = (cls = "") => `<svg class="route ${cls}" viewBox="0 0 600 560" fill="none" aria-hidden="true">
  <path d="M478 0C436 128 214 168 248 312S338 488 112 560" stroke="currentColor" stroke-width="7"/>
  <path d="M520 0C486 132 308 176 348 312S452 486 316 560" stroke="currentColor" stroke-width="7"/>
  <path d="M499 0C461 130 261 172 298 312S395 487 214 560" stroke="currentColor" stroke-opacity=".5" stroke-width="4" stroke-dasharray="18 16"/>
  <circle cx="298" cy="312" r="11" fill="currentColor"/></svg>`;
// Trait de pinceau du site sous le mot clé d'un titre : [[mot]]
const trait = (t) => t.replace(/\[\[(.+?)\]\]/g, `<span class="trait">$1<svg viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true"><path d="M3 15C88 6 176 4 262 7c48 2 92 6 135 11-82-3-170-4-258 1C92 21 46 22 4 22Z" fill="currentColor"/></svg></span>`);
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = (t) => trait(esc(t));

// Résultats réels des trois dossiers pilotes analysés en production (novembre 2026)
const PILOTES = [
  ["3", "dossiers pilotes analysés de bout en bout"],
  ["9 / 9", "rubriques renseignées sur le dossier moyen"],
  ["3", "contradictions relevées entre son deck et son business plan"],
];

const ACTEURS = [
  {
    id: "startups",
    pour: "Pour les startups",
    titre: "Votre dossier de levée, prêt pour [[le comité]].",
    sous: "Déposez deck, business plan et prévisionnel. Fund Road les met en cohérence et vous montre, avant l’envoi, ce qu’un investisseur va vous reprocher.",
    couverture: "mon-dossier.jpg",
    constat: "Le premier refus vient rarement du projet. Il vient du [[dossier]].",
    douleurs: [
      ["Trois documents, trois versions", "Le deck annonce un chiffre, le prévisionnel un autre. Le lecteur le voit en dix secondes."],
      ["Des critères devinés", "Chaque aide, chaque fonds a ses conditions, rarement écrites au même endroit."],
      ["Les questions qui fâchent", "Vous les découvrez en rendez-vous, quand il est trop tard pour corriger."],
    ],
    cout: { nombre: "0,06 %", libelle: "du montant que vous levez", calcul: "149 € ÷ 250 000 € recherchés = 0,06 %", note: "Exemple : le dossier pilote VéloCampus cherche 250 000 €." },
    demos: [
      { img: "lecture.jpg", titre: "Lisez votre dossier comme un investisseur.", repères: [[96, 18, "La synthèse d’un analyste : ce qui est démontré, ce qui ne l’est pas"], [96, 43, "Les trois priorités à traiter avant l’envoi"], [96, 66, "Les signaux d’alerte, nommés un par un"]] },
      { img: "regard.jpg", titre: "Chaque rubrique passée au crible.", repères: [[96, 29, "L’extrait exact du document qui justifie l’information"], [96, 52, "Démontré, partiel ou absent : 36 points de contrôle"], [96, 80, "Les questions qu’on vous posera, à préparer maintenant"]] },
    ],
    etapes: [["Ce soir", "Vous déposez vos documents, même en vrac."], ["Quelques minutes plus tard", "L’IA a rempli les 9 rubriques, sources citées."], ["Cette semaine", "Vous corrigez, levez les contradictions, partagez ou exportez."]],
    offre: [["Découverte", "0 €", "Une analyse IA par mois. Pour voir où en est votre dossier."], ["Dossier", "149 €", "Tous les 90 jours, résiliable en un clic. Analyses, éligibilité, exports, partages.", true]],
    appel: "Déposez votre deck ce soir.",
    appelSous: "Découverte gratuite, sans carte bancaire.",
    lien: "fund-road.com",
  },
  {
    id: "incubateurs",
    pour: "Pour les incubateurs et accélérateurs",
    titre: "Toute votre promotion prête pour [[le comité]].",
    sous: "Vos startups préparent leur dossier sur un portail à vos couleurs. Vous voyez qui est prêt, qui bloque, et pourquoi.",
    couverture: "pipeline-incubateur.jpg",
    constat: "Vos chargés d’affaires ne devraient pas passer leurs soirées à relire des [[business plans]].",
    douleurs: [
      ["Vingt formats différents", "Chaque startup présente son projet à sa façon. Impossible de comparer."],
      ["Un suivi à l’aveugle", "Savoir qui est prêt pour le comité suppose de tout relire."],
      ["Des comités dans l’urgence", "Les manques apparaissent la veille, jamais trois semaines avant."],
    ],
    cout: { nombre: "596 €", libelle: "reversés pour une promotion de 20 startups", calcul: "20 dossiers × 149 € × 20 % de commission = 596 €", note: "Si toute la promotion prend le dossier via votre code partenaire." },
    demos: [
      { img: "pipeline-incubateur.jpg", titre: "Votre promotion en un tableau.", repères: [[30, 36, "Startups suivies et complétude moyenne, en direct"], [3, 54, "Vos étapes : candidature, sélection, entretien, comité, programme"], [52, 73, "La complétude de chaque dossier, mise à jour à chaque dépôt"]] },
      { img: "portail.jpg", titre: "Un portail de candidature à vos couleurs.", repères: [[31, 30, "Votre nom, votre couleur, votre présentation"], [31, 77, "Vos critères : l’adéquation se calcule toute seule"], [85, 30, "Votre équipe invitée, rôles compris"]] },
    ],
    etapes: [["Jour 1", "Vous créez votre portail : couleurs, critères, pièces demandées."], ["Jour 2", "Vous envoyez le lien à votre promotion."], ["Semaine 1", "Les premiers dossiers arrivent, structurés et suivis."]],
    offre: [["Espace incubateur", "0 €", "Portail, critères, suivi de promotion, notes d’équipe."], ["Programme partenaire", "+20 %", "Environ 30 € reversés pour chaque startup qui prend son dossier.", true]],
    appel: "Testez-le sur votre prochaine promotion.",
    appelSous: "On configure votre portail avec vous.",
    lien: "fund-road.com/financeurs",
  },
  {
    id: "business-angels",
    pour: "Pour les business angels et les réseaux",
    titre: "Moins de decks. Plus de [[bons dossiers]].",
    sous: "Donnez votre ticket, vos secteurs, votre stade. Recevez des dossiers structurés, sourcés, confrontés à vos critères.",
    couverture: "dossier-recu.jpg",
    constat: "Lire trente decks pour en garder deux, c’est [[fini]].",
    douleurs: [
      ["Des decks dans tous les formats", "Dix pages ici, quarante là. Jamais les mêmes informations au même endroit."],
      ["Le tri vous prend vos soirées", "Vérifier qu’un projet colle à votre thèse demande de tout lire."],
      ["Les écarts arrivent tard", "Le chiffre du deck et celui du prévisionnel ne concordent pas. Vous le voyez en rendez-vous."],
    ],
    cout: { nombre: "10 h", libelle: "de lecture par mois, à reprendre", calcul: "30 decks × 20 minutes de premier tri = 10 heures", note: "Hypothèse à ajuster avec votre propre flux de dossiers." },
    demos: [
      { img: "dossier-recu.jpg", titre: "Un dossier lisible en cinq minutes.", repères: [[5, 41, "Toujours le même plan : équipe, marché, modèle, traction, finances"], [96, 40, "Les pièces jointes : deck et prévisionnel"], [96, 56, "Vos notes privées, partagées avec votre réseau"]] },
      { img: "pipeline-fonds.jpg", titre: "Tout votre réseau sur le même suivi.", repères: [[66, 72, "L’adéquation à vos critères, dossier par dossier"], [3, 54, "Nouveau, en revue, rendez-vous, due diligence"], [52, 73, "La complétude de chaque dossier"]] },
    ],
    etapes: [["Aujourd’hui", "Vous indiquez ticket, secteurs, stade, géographie."], ["Ensuite", "Les startups vous envoient leur dossier depuis l’annuaire ou votre lien."], ["À chaque dossier", "Complétude et adéquation sous les yeux : creuser ou passer."]],
    offre: [["Business angel", "0 €", "Profil, critères, dossiers reçus, suivi."], ["Réseau", "0 €", "Tout le réseau sur un même espace pendant le lancement.", true]],
    appel: "Créez votre espace aujourd’hui.",
    appelSous: "Gratuit pour les business angels.",
    lien: "fund-road.com/financeurs",
  },
  {
    id: "fonds",
    pour: "Pour les fonds d’investissement",
    titre: "Le premier tri de votre deal flow, fait [[avant vous]].",
    sous: "Chaque candidature arrive structurée, sourcée et confrontée à votre thèse. Vos analystes se concentrent sur les dossiers qui comptent.",
    couverture: "pipeline-fonds.jpg",
    constat: "Vos analystes valent mieux que le tri de [[pitch decks]].",
    douleurs: [
      ["Un flux majoritairement hors thèse", "La plupart des dossiers reçus ne correspondent pas à votre ticket ou votre stade."],
      ["Des formats incomparables", "Comparer deux startups suppose de tout remettre à plat."],
      ["Des écarts vus en due diligence", "Les incohérences entre deck et prévisionnel coûtent des semaines."],
    ],
    cout: { nombre: "50 h", libelle: "d’analyste par mois, à reprendre", calcul: "100 dossiers × 30 minutes de mise à plat = 50 heures", note: "Hypothèse à ajuster avec le volume réel de votre deal flow." },
    demos: [
      { img: "pipeline-fonds.jpg", titre: "Votre deal flow, trié et suivi.", repères: [[66, 72, "Stade, géographie, ticket : critère par critère"], [3, 54, "Nouveau, revue, rendez-vous, due diligence, portefeuille"], [52, 36, "Complétude moyenne et dossiers conformes, en direct"]] },
      { img: "portail.jpg", titre: "Votre lien de candidature, à vos couleurs.", repères: [[31, 30, "Votre thèse en clair : les startups savent si elles collent"], [31, 77, "Vos critères structurés, appliqués à chaque dossier"], [85, 30, "Vos associés et analystes invités"]] },
    ],
    etapes: [["Jour 1", "Vous paramétrez votre thèse : ticket, secteurs, stade, géographie."], ["Jour 2", "Vous placez votre lien de candidature sur votre site."], ["Ensuite", "Chaque dossier arrive trié, avec son adéquation."]],
    offre: [["Espace fonds", "0 €", "Pendant le lancement : portail, critères, pipeline, notes d’équipe.", true], ["Bientôt", "Questions à l’IA", "Interrogez un dossier et ses pièces, réponses citées."]],
    appel: "Branchez votre lien de candidature cette semaine.",
    appelSous: "Gratuit pendant le lancement.",
    lien: "fund-road.com/financeurs",
  },
  {
    id: "organismes-de-financement",
    pour: "Pour les organismes de subvention et de financement public",
    titre: "Des candidatures complètes [[avant leur dépôt]].",
    sous: "Vos critères et vos pièces deviennent un pré-contrôle automatique. Les porteurs savent ce qui manque avant de vous solliciter.",
    couverture: "eligibilite.jpg",
    constat: "Chaque dossier incomplet coûte une relance, un délai et un porteur [[découragé]].",
    douleurs: [
      ["Des pièces manquantes", "Une part des candidatures revient pour un document ou une information absente."],
      ["Des critères mal lus", "Des porteurs non éligibles candidatent quand même."],
      ["Des équipes noyées", "Le temps d’instruction part en relances plutôt qu’en analyse."],
    ],
    cout: { nombre: "100", libelle: "relances évitées par tranche de 300 dossiers", calcul: "300 dossiers × 1 sur 3 incomplet = 100 relances", note: "Exemple : remplacez par votre propre taux de dossiers incomplets." },
    demos: [
      { img: "eligibilite.jpg", titre: "Votre dispositif, critère par critère.", repères: [[6, 69, "Le dispositif choisi, avec son taux de critères vérifiés"], [92, 64, "Un verdict indicatif et le nombre de critères remplis"], [6, 95, "Les critères officiels et leurs sources datées"]] },
      { img: "dossier-recu.jpg", titre: "Un dossier homogène à l’arrivée.", repères: [[5, 41, "9 rubriques, quel que soit le porteur"], [5, 21, "Une version datée qui ne bouge plus"], [96, 40, "Les pièces choisies par le porteur"]] },
    ],
    etapes: [["Atelier", "Nous modélisons votre dispositif à partir de vos textes officiels."], ["Pilote", "Les porteurs vérifient leur éligibilité avant de déposer."], ["Bilan", "Vous comparez le taux de dossiers complets à l’arrivée."]],
    offre: [["Référencement", "0 €", "Votre dispositif évalué pour chaque porteur de projet."], ["Marque blanche", "Sur devis", "Un parcours de candidature à vos couleurs, selon votre référentiel.", true]],
    appel: "Modélisons ensemble l’un de vos dispositifs.",
    appelSous: "Un atelier, un pilote, un bilan chiffré.",
    lien: "contact@fund-road.com",
  },
];

const CSS = `
@font-face{font-family:Archivo;font-weight:400 800;src:url(../../../public/fonts/archivo-latin.woff2) format("woff2")}
@font-face{font-family:Archivo;font-weight:400 800;src:url(../../../public/fonts/archivo-latin-ext.woff2) format("woff2");unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:"JetBrains Mono";src:url(../../../public/fonts/jetbrains-mono-latin.woff2) format("woff2")}
:root{--nuit:oklch(20.5% .04 257);--nuit-2:oklch(25.5% .045 257);--nuit-texte:oklch(82% .018 255);--papier:oklch(99% .003 255);--papier-2:oklch(96.6% .008 255);
--encre:oklch(20.5% .04 257);--encre-2:oklch(41% .03 257);--encre-3:oklch(53% .022 257);--filet:oklch(91% .01 255);--accent:oklch(68.5% .165 46);--accent-2:oklch(54% .16 43);--teinte:oklch(95.5% .03 55)}
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#555}
body{font-family:Archivo,"Helvetica Neue",Arial,sans-serif;color:var(--encre);-webkit-font-smoothing:antialiased}
.slide{position:relative;width:1280px;height:720px;overflow:hidden;background:var(--papier);padding:64px 72px;break-after:page;margin:0 auto 24px}
.nuit{background:var(--nuit);color:#fff}.papier2{background:var(--papier-2)}.orange{background:var(--accent);color:var(--nuit)}
.label{font-family:"JetBrains Mono",monospace;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-2)}
.nuit .label{color:var(--accent)}.orange .label{color:var(--nuit)}
h1,h2{font-weight:750;letter-spacing:-.035em;line-height:1.02;margin:0}
h1{font-size:76px}h2{font-size:52px}
.trait{position:relative;white-space:nowrap;isolation:isolate}
.trait svg{position:absolute;left:-2%;bottom:-.14em;width:104%;height:.3em;color:var(--accent);z-index:-1}
.orange .trait svg{color:var(--nuit);opacity:.9}.orange .trait{color:#fff}
.sous{font-size:21px;line-height:1.5;color:var(--nuit-texte);max-width:480px;margin-top:28px}
.route{position:absolute;color:var(--accent);opacity:.9}
.logo{height:34px}.pied{position:absolute;left:72px;right:72px;bottom:34px;display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--encre-3)}
.nuit .pied{color:var(--nuit-texte)}.pied img{height:24px}
.capture{border-radius:14px;box-shadow:0 2px 4px oklch(20% .045 240/.08),0 30px 60px -20px oklch(20% .045 240/.35);overflow:hidden;border:1px solid var(--filet);background:#fff}
.capture img{display:block;width:100%}
/* couverture */
.couv .texte{position:relative;z-index:2;width:560px;margin-top:70px}
.couv .capture{position:absolute;right:-60px;top:150px;width:660px;transform:rotate(-2deg)}
.couv .route{right:280px;top:-60px;width:360px;opacity:.55}
/* constat */
.constat h2{font-size:64px;max-width:1000px;margin-top:40px}
.douleurs{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:70px}
.douleurs b{display:block;font-size:22px;margin:10px 0 8px;letter-spacing:-.01em}.douleurs p{margin:0;font-size:17px;line-height:1.5;color:var(--encre-2)}
.num{font-family:"JetBrains Mono",monospace;font-size:14px;color:var(--accent-2)}
/* coût */
.cout .grand{font-size:200px;font-weight:800;letter-spacing:-.06em;line-height:.9;color:var(--accent);margin-top:60px}
.cout .lib{font-size:30px;font-weight:650;margin-top:16px;max-width:760px}
.calcul{display:inline-block;margin-top:44px;font-family:"JetBrains Mono",monospace;font-size:18px;padding:14px 20px;border:1px solid var(--nuit-texte);border-radius:10px;color:#fff}
.note{margin-top:16px;font-size:15px;color:var(--nuit-texte)}
.cout .route{right:-40px;bottom:-120px;width:460px;opacity:.35}
/* parti pris */
.principes{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:56px}
.principe{background:#fff;border:1px solid var(--filet);border-radius:16px;padding:30px}
.principe b{display:block;font-size:26px;letter-spacing:-.02em;line-height:1.15;margin-bottom:14px}.principe p{margin:0;font-size:17px;line-height:1.5;color:var(--encre-2)}
/* démo */
.demo{display:grid;grid-template-columns:1fr 360px;gap:56px;align-items:start}
.demo.etroite{grid-template-columns:470px 1fr}
.demo.etroite .capture{max-height:560px}
.demo .visuel{position:relative}
.demo h2{font-size:44px;margin:14px 0 30px}
.repere{position:absolute;width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;font-weight:750;font-size:16px;display:grid;place-items:center;box-shadow:0 0 0 6px oklch(68.5% .165 46/.25);transform:translate(-50%,-50%)}
.legende{list-style:none;margin:0;padding:0;display:grid;gap:22px}
.legende li{display:grid;grid-template-columns:34px 1fr;gap:16px;font-size:18px;line-height:1.45;align-items:start}
.legende span{width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;font-weight:750;display:grid;place-items:center;font-size:16px}
/* preuves */
.preuves{display:grid;grid-template-columns:repeat(3,1fr);gap:36px;margin-top:70px}
.preuves b{display:block;font-size:84px;font-weight:800;letter-spacing:-.05em;color:var(--accent);line-height:1}
.preuves p{font-size:19px;line-height:1.45;color:var(--nuit-texte);margin:14px 0 0;max-width:300px}
.chiffres-produit{display:flex;gap:56px;margin-top:64px;padding-top:28px;border-top:1px solid var(--nuit-2);font-size:17px;color:var(--nuit-texte)}
.chiffres-produit b{color:#fff;font-size:28px;margin-right:8px}
/* étapes */
.etapes{display:grid;grid-template-columns:repeat(3,1fr);margin-top:80px;position:relative}
.etapes:before{content:"";position:absolute;left:0;right:0;top:18px;border-top:2px dashed var(--filet)}
.etape{position:relative;padding-right:40px}
.etape i{display:block;width:38px;height:38px;border-radius:50%;background:var(--accent);margin-bottom:30px}
.etape .label{display:block;margin-bottom:10px}.etape p{font-size:22px;line-height:1.4;margin:0;font-weight:600;letter-spacing:-.01em}
/* offre */
.offres{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:48px;max-width:900px}
.offre{border:1px solid var(--filet);border-radius:18px;padding:34px;background:#fff}
.offre.forte{background:var(--nuit);color:#fff;border-color:var(--nuit)}
.offre .prix{font-size:64px;font-weight:800;letter-spacing:-.04em;margin:8px 0 14px;line-height:1}
.offre.forte .prix{color:var(--accent)}.offre p{margin:0;font-size:17px;line-height:1.5;color:var(--encre-2)}.offre.forte p{color:var(--nuit-texte)}
.mention{position:absolute;left:72px;bottom:70px;font-size:13px;color:var(--encre-3)}
/* appel */
.appel h1{font-size:84px;max-width:1000px;margin-top:120px}
.appel .sous{color:var(--nuit);font-size:24px;max-width:700px}
.bouton{display:inline-flex;align-items:center;gap:14px;margin-top:44px;background:var(--nuit);color:#fff;border-radius:999px;padding:20px 34px;font-size:22px;font-weight:700}
.signature{position:absolute;right:72px;bottom:64px;text-align:right;font-size:17px;line-height:1.5}
.appel .route{right:-80px;top:-60px;width:420px;color:var(--nuit);opacity:.18}
`;

function deck(a) {
  const pied = (n, clair = false) => `<div class="pied"><span>${String(n).padStart(2, "0")} · ${esc(a.pour)}</span><img src="../../../public/brand/${clair ? "fundroad-logo-white" : "fundroad-logo"}.png" alt="Fund Road"></div>`;
  const demo = (d, n) => {
    const haute = /lecture|regard/.test(d.img);
    const visuel = `<div class="visuel"><div class="capture"><img src="../visuels/${d.img}" alt=""></div>${d.repères.map(([x, y], i) => `<div class="repere" style="left:${x}%;top:${y}%">${i + 1}</div>`).join("")}</div>`;
    const texte = `<div><div class="label">Dans le produit</div><h2>${html(d.titre)}</h2><ol class="legende">${d.repères.map(([, , t], i) => `<li><span>${i + 1}</span>${esc(t)}</li>`).join("")}</ol></div>`;
    return `<section class="slide ${n % 2 ? "papier2" : ""}"><div class="demo ${haute ? "etroite" : ""}" style="${haute ? "" : ""}">${haute ? visuel + texte : visuel + texte}</div>${pied(n)}</section>`;
  };
  let n = 1;
  const s = [];
  s.push(`<section class="slide nuit couv">${route()}<img class="logo" src="../../../public/brand/fundroad-logo-white.png" alt="Fund Road">
    <div class="texte"><div class="label">${esc(a.pour)}</div><h1 style="margin-top:22px">${html(a.titre)}</h1><p class="sous">${esc(a.sous)}</p></div>
    <div class="capture"><img src="../visuels/${a.couverture}" alt=""></div></section>`);
  s.push(`<section class="slide constat"><div class="label">Le constat</div><h2>${html(a.constat)}</h2>
    <div class="douleurs">${a.douleurs.map(([t, d], i) => `<div><span class="num">0${i + 1}</span><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("")}</div>${pied(++n)}</section>`);
  s.push(`<section class="slide nuit cout">${route()}<div class="label">Ce que ça représente</div><div class="grand">${esc(a.cout.nombre)}</div><div class="lib">${esc(a.cout.libelle)}</div>
    <div class="calcul">${esc(a.cout.calcul)}</div><div class="note">${esc(a.cout.note)}</div>${pied(++n, true)}</section>`);
  s.push(`<section class="slide papier2"><div class="label">Notre parti pris</div><h2 style="margin-top:20px;max-width:980px">${html("On ne note pas les projets. On rend les dossiers [[comparables]].")}</h2>
    <div class="principes">
      <div class="principe"><b>Chaque phrase a sa source.</b><p>L’IA cite l’extrait exact du document. Rien n’est inventé, tout se vérifie.</p></div>
      <div class="principe"><b>Les contradictions remontent.</b><p>Un chiffre différent entre deck et prévisionnel est signalé, pas lissé.</p></div>
      <div class="principe"><b>La décision reste humaine.</b><p>Fund Road prépare et trie. Il ne juge ni les personnes ni les chances de financement.</p></div>
    </div>${pied(++n)}</section>`);
  for (const d of a.demos) s.push(demo(d, ++n));
  s.push(`<section class="slide nuit"><div class="label">Ce que nous avons testé</div><h2 style="margin-top:20px;max-width:900px">${html("Testé sur de vrais documents, [[pas sur une maquette]].")}</h2>
    <div class="preuves">${PILOTES.map(([c, t]) => `<div><b>${esc(c)}</b><p>${esc(t)}</p></div>`).join("")}</div>
    <div class="chiffres-produit"><span><b>36</b>points de contrôle investisseur</span><span><b>119</b>financeurs référencés</span><span><b>7</b>dispositifs publics modélisés</span></div>${pied(++n, true)}</section>`);
  s.push(`<section class="slide"><div class="label">La mise en place</div><h2 style="margin-top:20px">${html("Trois étapes, [[pas une de plus]].")}</h2>
    <div class="etapes">${a.etapes.map(([q, t]) => `<div class="etape"><i></i><span class="label">${esc(q)}</span><p>${esc(t)}</p></div>`).join("")}</div>${pied(++n)}</section>`);
  s.push(`<section class="slide"><div class="label">L’offre</div><h2 style="margin-top:20px">${html("Simple, et [[sans commission]] sur vos financements.")}</h2>
    <div class="offres">${a.offre.map(([nom, prix, d, forte]) => `<div class="offre ${forte ? "forte" : ""}"><div class="label">${esc(nom)}</div><div class="prix">${esc(prix)}</div><p>${esc(d)}</p></div>`).join("")}</div>
    <div class="mention">TVA non applicable, article 293 B du CGI.</div>${pied(++n)}</section>`);
  s.push(`<section class="slide orange appel">${route()}<div class="label">La prochaine étape</div><h1>${html(a.appel)}</h1><p class="sous">${esc(a.appelSous)}</p>
    <div class="bouton">${esc(a.lien)} →</div><div class="signature"><b>Nadir Daoudi</b><br>Fondateur · contact@fund-road.com</div></section>`);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fund Road · ${esc(a.pour)}</title><style>${CSS}</style></head><body>${s.join("\n")}</body></html>`;
}

const b = await chromium.launch();
fs.mkdirSync(path.join(ICI, "apercus"), { recursive: true });
for (const a of ACTEURS) {
  const f = path.join(ICI, `fund-road-${a.id}.html`);
  fs.writeFileSync(f, deck(a));
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await p.goto(pathToFileURL(f).href, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: f.replace(/\.html$/, ".pdf"), width: "1280px", height: "720px", printBackground: true });
  const slides = await p.locator(".slide").all();
  for (const [i, el] of slides.entries()) await el.screenshot({ path: path.join(ICI, "apercus", `${a.id}-${String(i + 1).padStart(2, "0")}.png`) });
  console.log(a.id, slides.length, "diapositives");
  await p.close();
}
await b.close();
