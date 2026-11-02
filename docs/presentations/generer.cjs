// Génère une présentation commerciale Fund Road par acteur : node generer.cjs
// Prérequis : PPTX_SKILL (dossier du skill pptx) et NODE_PATH (modules globaux) pour apply_theme
// modules globaux : le React du projet est incompatible avec react-icons global
const G = require("child_process").execSync("npm root -g").toString().trim();
const pptxgen = require(G + "/pptxgenjs");
const React = require(G + "/react");
const { renderToStaticMarkup } = require(G + "/react-dom/server");
const sharp = require(G + "/sharp");
const fa = require(G + "/react-icons/fa6");
const path = require("path");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const BRAND = path.join(__dirname, "../../public/brand");
const VIS = path.join(__dirname, "visuels");
const THEME = {
  name: "Fund Road",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0A192C", lt1: "FFFFFF", dk2: "253343", lt2: "EEF2F6",
    accent1: "D9622B", accent2: "0E3F5C", accent3: "6B7785", accent4: "2A6F4E",
    accent5: "C8CFD8", accent6: "F6E3D8", hlink: "D9622B", folHlink: "0E3F5C",
  },
};
const HEX = THEME.colors;
// rapport largeur / hauteur des visuels (voir visuels/)
const RATIO = {
  "pipeline-fonds.jpg": 1800 / 1367, "pipeline-incubateur.jpg": 1800 / 1367, "portail.jpg": 1800 / 1367,
  "eligibilite.jpg": 1800 / 1367, "vue-ensemble.jpg": 1800 / 1367, "mon-dossier.jpg": 1800 / 1367,
  "dossier-recu.jpg": 1800 / 1125, "accueil.jpg": 1800 / 1125, "annuaire.jpg": 1800 / 1125, "financeurs.jpg": 1800 / 1125,
  "lecture.jpg": 1200 / 1328, "regard.jpg": 1200 / 1615, "route.png": 600 / 560,
};

const icone = async (Icon, color) => {
  const svg = renderToStaticMarkup(React.createElement(Icon, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
};
const ombre = () => ({ type: "outer", color: "0A192C", blur: 18, offset: 4, angle: 90, opacity: 0.22 });

// Capture cadrée depuis le haut dans un cadre w × h
function capture(s, fichier, x, y, w, h, nom) {
  const hPleine = w / RATIO[fichier];
  s.addImage({
    path: path.join(VIS, fichier), x, y, w, h: hPleine,
    sizing: { type: "crop", x: 0, y: 0, w, h: Math.min(h, hPleine) },
    shadow: ombre(), altText: nom, objectName: nom,
  });
}

// Faits communs, tous vérifiés dans le produit
const CONFIANCE = [
  [fa.FaRobot, "IA signalée", "Chaque passage généré par IA est marqué, à l’écran comme dans les exports."],
  [fa.FaLock, "Partage maîtrisé", "Version datée, pièces choisies, accès révocable à tout moment."],
  [fa.FaQuoteLeft, "Sources citées", "Chaque information renvoie à l’extrait exact du document."],
  [fa.FaHandshake, "Zéro commission", "Rien n’est prélevé sur les fonds levés ni sur les aides obtenues."],
];

const ACTEURS = [
  {
    fichier: "fund-road-startups",
    cible: "STARTUPS",
    titre: "Votre dossier de levée, prêt pour le comité",
    sousTitre: "Déposez vos documents. Fund Road les structure, traque les incohérences et vous montre ce qu’un investisseur va vous reprocher.",
    couverture: "mon-dossier.jpg",
    punch: "Le premier refus vient rarement du projet. Il vient du dossier.",
    punchSous: "Chiffres qui se contredisent, rubriques vides, critères ignorés : c’est là que se perdent les rendez-vous.",
    avant: ["Trois documents, trois versions de vos chiffres", "Des critères d’aides devinés au hasard", "Les questions qui fâchent découvertes en rendez-vous"],
    apres: ["9 rubriques cohérentes, chaque chiffre sourcé", "Votre éligibilité vérifiée critère par critère", "Les questions des investisseurs anticipées avant l’envoi"],
    vitrines: [
      { img: "lecture.jpg", titre: "Lisez votre dossier comme un investisseur", points: [
        ["La synthèse d’un analyste", "Ce que votre dossier démontre, et ce qu’il ne démontre pas encore."],
        ["Les signaux d’alerte", "Chaque contradiction entre vos documents, nommée."],
        ["Vos priorités", "Les trois actions à mener avant d’envoyer quoi que ce soit."],
      ] },
      { img: "regard.jpg", titre: "Chaque rubrique passée au crible", points: [
        ["L’extrait source", "L’IA cite la phrase exacte de votre document."],
        ["36 points de contrôle", "Équipe, marché, traction, finances : démontré, partiel ou absent."],
        ["Les questions qu’on vous posera", "Préparez la réponse avant le rendez-vous."],
      ] },
      { img: "eligibilite.jpg", titre: "Votre éligibilité, avant de candidater", points: [
        ["Aides et financeurs", "Bourse French Tech, i-Nov, i-Lab, Initiative France, EIC…"],
        ["Critère par critère", "Rempli, manquant ou bloquant, avec la preuve tirée de vos documents."],
        ["Un verdict clair", "Éligible, pièces à compléter, informations manquantes ou non éligible."],
      ] },
    ],
    etapes: [
      ["Déposez", "PDF, Word, Excel, PowerPoint : l’IA range chaque information dans la bonne rubrique."],
      ["Corrigez", "Vous confirmez, chaque citation sous les yeux, et levez les contradictions."],
      ["Envoyez", "Export PDF et Word, ou partage daté et révocable avec un financeur."],
    ],
    chiffres: [["9", "rubriques d’un dossier complet"], ["36", "points de contrôle investisseur"], ["119", "financeurs dans l’annuaire"]],
    offre: [
      ["Découverte", "Gratuit", "Une analyse IA par mois pour voir où en est votre dossier."],
      ["Dossier", "149 €", "Tous les 90 jours. Résiliable en un clic depuis votre espace."],
    ],
    appel: "Créez votre dossier sur fund-road.com",
  },
  {
    fichier: "fund-road-incubateurs",
    cible: "INCUBATEURS ET ACCÉLÉRATEURS",
    titre: "Toute votre promotion prête pour le comité",
    sousTitre: "Vos startups préparent leur dossier sur un portail à vos couleurs. Vous voyez qui est prêt, qui bloque et pourquoi.",
    couverture: "pipeline-incubateur.jpg",
    punch: "Vos chargés d’affaires ne devraient pas passer leurs soirées à relire des business plans.",
    punchSous: "Fund Road fait le premier tri. Votre équipe accompagne.",
    avant: ["Des dossiers dans tous les formats", "Relire chaque startup pour savoir où elle en est", "Des comités préparés dans l’urgence"],
    apres: ["Un format unique pour toute la promotion", "La complétude de chaque startup, en direct", "Des dossiers prêts, contradictions déjà levées"],
    vitrines: [
      { img: "pipeline-incubateur.jpg", titre: "Votre promotion en un tableau", points: [
        ["Complétude en direct", "Le pourcentage de chaque dossier, mis à jour à chaque dépôt."],
        ["Vos étapes de programme", "Candidature, sélection, entretien, comité, en programme."],
        ["Notes d’équipe privées", "Vos remarques, invisibles des startups."],
      ] },
      { img: "portail.jpg", titre: "Un portail de candidature à vos couleurs", points: [
        ["Votre identité", "Votre nom, votre couleur, votre présentation."],
        ["Vos critères", "Secteurs, stades, zones : l’adéquation se calcule toute seule."],
        ["Vos questions", "Les pièces et compléments que vous exigez, demandés d’office."],
      ] },
    ],
    etapes: [
      ["Configurez", "Votre portail : couleurs, critères, pièces et questions."],
      ["Invitez", "Vos startups déposent leurs documents, l’IA structure chaque dossier."],
      ["Pilotez", "Complétude, adéquation et étapes du programme, startup par startup."],
    ],
    chiffres: [["0 €", "pour ouvrir votre espace incubateur"], ["20 %", "reversés sur chaque dossier payé via votre code"], ["≈ 600 €", "pour une promotion de 20 startups (exemple)"]],
    offre: [
      ["Espace incubateur", "Gratuit", "Portail, critères, suivi de promotion et notes d’équipe."],
      ["Programme partenaire", "+20 %", "Environ 30 € reversés pour chaque startup qui prend son dossier."],
    ],
    appel: "Ouvrez votre espace sur fund-road.com/financeurs",
  },
  {
    fichier: "fund-road-business-angels",
    cible: "BUSINESS ANGELS ET RÉSEAUX",
    titre: "Moins de decks. Plus de bons dossiers.",
    sousTitre: "Donnez votre ticket, vos secteurs, votre stade. Recevez des dossiers structurés, sourcés et triés selon vos critères.",
    couverture: "dossier-recu.jpg",
    punch: "Lire trente decks pour en garder deux, c’est fini.",
    punchSous: "Chaque dossier arrive au même format, avec son adéquation à vos critères.",
    avant: ["Des dizaines de decks dans tous les formats", "Des heures pour vérifier qu’un projet colle à votre thèse", "Des incohérences découvertes trop tard"],
    apres: ["9 rubriques identiques pour chaque dossier", "L’adéquation à vos critères, affichée d’office", "Les contradictions signalées avant votre lecture"],
    vitrines: [
      { img: "dossier-recu.jpg", titre: "Un dossier lisible en cinq minutes", points: [
        ["Toujours le même plan", "Équipe, marché, modèle, traction, finances, besoin."],
        ["Les pièces jointes", "Le deck et le prévisionnel, à portée de clic."],
        ["Vos notes privées", "Partagées avec votre réseau, jamais avec la startup."],
      ] },
      { img: "pipeline-fonds.jpg", titre: "Tout votre réseau sur le même suivi", points: [
        ["Adéquation à vos critères", "Ce qui colle, ce qui manque, ce qui bloque."],
        ["Des étapes partagées", "Nouveau, en revue, rendez-vous, due diligence."],
        ["Un seul espace", "Tous les membres du réseau, les mêmes dossiers."],
      ] },
    ],
    etapes: [
      ["Décrivez", "Ticket, secteurs, stade, géographie, pièces demandées."],
      ["Recevez", "Des dossiers en 9 rubriques, sources citées."],
      ["Tranchez", "Complétude et adéquation sous les yeux : creuser ou passer."],
    ],
    chiffres: [["0 €", "pour les business angels"], ["9", "rubriques par dossier"], ["36", "points de contrôle investisseur"]],
    offre: [
      ["Business angel", "Gratuit", "Profil, critères, dossiers reçus et suivi."],
      ["Réseau", "Gratuit", "Tout le réseau sur un même espace pendant le lancement."],
    ],
    appel: "Créez votre espace sur fund-road.com/financeurs",
  },
  {
    fichier: "fund-road-fonds",
    cible: "FONDS D’INVESTISSEMENT",
    titre: "Le premier tri de votre deal flow, fait avant que vous ouvriez le dossier",
    sousTitre: "Chaque candidature arrive structurée, sourcée et confrontée à votre thèse. Vos analystes se concentrent sur ceux qui comptent.",
    couverture: "pipeline-fonds.jpg",
    punch: "Vos analystes valent mieux que le tri de pitch decks.",
    punchSous: "Fund Road prend en charge la mise en forme et le premier filtre. Votre équipe garde le jugement.",
    avant: ["Un deal flow massif, majoritairement hors thèse", "Des formats impossibles à comparer", "Des écarts deck / prévisionnel vus en due diligence"],
    apres: ["L’adéquation à votre thèse dès la réception", "9 rubriques comparables d’un dossier à l’autre", "Les contradictions relevées avant la première lecture"],
    vitrines: [
      { img: "pipeline-fonds.jpg", titre: "Votre deal flow, trié et suivi", points: [
        ["Adéquation à votre thèse", "Stade, géographie, ticket : critère par critère."],
        ["Un pipeline d’équipe", "Nouveau, revue, rendez-vous, due diligence, portefeuille."],
        ["Mis à jour en continu", "Vous voyez quand une startup complète son dossier."],
      ] },
      { img: "portail.jpg", titre: "Votre lien de candidature, à vos couleurs", points: [
        ["Votre thèse en clair", "Les startups savent tout de suite si elles collent."],
        ["Vos pièces exigées", "Plus besoin de relancer pour un prévisionnel."],
        ["Votre équipe", "Invitez vos associés et vos analystes."],
      ] },
    ],
    etapes: [
      ["Paramétrez", "Ticket, secteurs, stade, géographie, pièces et questions."],
      ["Recevez", "Des dossiers en 9 rubriques, sources citées, contradictions relevées."],
      ["Priorisez", "Adéquation et complétude, puis suivi jusqu’à l’investissement."],
    ],
    chiffres: [["9", "rubriques comparables d’un dossier à l’autre"], ["36", "points de contrôle investisseur"], ["0 €", "pendant le lancement"]],
    offre: [
      ["Espace fonds", "Gratuit", "Pendant le lancement : portail, critères, pipeline et notes d’équipe."],
      ["Bientôt", "Questions à l’IA", "Interrogez un dossier et ses pièces, réponses citées."],
    ],
    appel: "Ouvrez votre espace sur fund-road.com/financeurs",
  },
  {
    fichier: "fund-road-organismes-de-financement",
    cible: "ORGANISMES DE SUBVENTION ET DE FINANCEMENT PUBLIC",
    titre: "Des candidatures complètes avant même leur dépôt",
    sousTitre: "Vos critères et vos pièces deviennent un pré-contrôle automatique. Les porteurs savent ce qui manque avant de vous solliciter.",
    couverture: "eligibilite.jpg",
    punch: "Chaque dossier incomplet coûte une relance, un délai et un porteur découragé.",
    punchSous: "Fund Road traite les manques en amont, pas dans votre file d’instruction.",
    avant: ["Des candidatures qui reviennent pour une pièce manquante", "Des porteurs non éligibles qui candidatent quand même", "Des chargés d’affaires noyés sous les relances"],
    apres: ["Les manques identifiés avant le dépôt", "L’éligibilité vérifiée critère par critère", "Des dossiers homogènes, sourcés et datés"],
    vitrines: [
      { img: "eligibilite.jpg", titre: "Votre dispositif, critère par critère", points: [
        ["Vos critères officiels", "Modélisés depuis vos sources, avec leur date de vérification."],
        ["Un verdict indicatif", "Éligible, pièces à compléter, informations manquantes, non éligible."],
        ["La preuve à l’appui", "Chaque critère renvoie au passage du dossier qui le justifie."],
      ] },
      { img: "dossier-recu.jpg", titre: "Un dossier homogène à l’arrivée", points: [
        ["Toujours le même plan", "9 rubriques, quel que soit le porteur."],
        ["Version datée", "Ce que vous recevez ne bouge plus."],
        ["Pièces jointes", "Les documents choisis par le porteur, téléchargeables."],
      ] },
    ],
    etapes: [
      ["Décrivez", "Critères d’éligibilité et pièces, avec leurs sources officielles."],
      ["Pré-contrôlez", "Le porteur voit ce qui est rempli, ce qui manque, ce qui bloque."],
      ["Recevez", "Un dossier homogène, sourcé, contradictions signalées."],
    ],
    chiffres: [["7", "dispositifs déjà modélisés (French Tech, i-Nov, i-Lab, EIC…)"], ["4", "verdicts d’éligibilité"], ["9", "rubriques par dossier"]],
    offre: [
      ["Référencement", "Gratuit", "Votre dispositif évalué pour chaque porteur de projet."],
      ["Marque blanche", "Sur devis", "Un parcours de candidature à vos couleurs, selon votre référentiel."],
    ],
    appel: "Écrivez-nous : contact@fund-road.com",
  },
];

async function deck(a) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Fund Road";
  pres.company = "Fund Road";
  pres.title = "Fund Road · " + a.cible.toLowerCase();
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const titre = { name: "title", type: "title", x: 0.6, y: 0.4, w: 8.8, h: 0.75, fontSize: 28, bold: true, align: "left", valign: "top", margin: 0 };

  pres.defineSlideMaster({ title: "Sombre", background: { color: C.text1 }, objects: [] });
  pres.defineSlideMaster({ title: "Accent", background: { color: C.accent1 }, objects: [] });
  for (const [nom, fond] of [["Clair", C.background1], ["Vitrine", C.background2]])
    pres.defineSlideMaster({
      title: nom,
      background: { color: fond },
      objects: [
        { image: { path: BRAND + "/fundroad-logo.png", x: 8.55, y: 5.08, w: 0.94, h: 0.4 } },
        { placeholder: { options: { ...titre, color: C.text1 }, text: "" } },
      ],
      slideNumber: { x: 0.6, y: 5.12, w: 0.5, h: 0.3, fontSize: 10, color: C.accent3 },
    });
  const route = (s, x, y, w, transparency = 0) =>
    s.addImage({ path: path.join(VIS, "route.png"), x, y, w, h: w / RATIO["route.png"], transparency, altText: "Route Fund Road", objectName: "Route" });
  const txt = (s, text, o) => s.addText(text, { margin: 0, valign: "top", isTextBox: true, ...o });
  const slide = (master, section) => {
    pres.addSection({ title: section });
    return pres.addSlide({ masterName: master, sectionTitle: section });
  };

  // 1. Couverture : promesse + produit
  let s = slide("Sombre", "Couverture");
  route(s, 5.6, -0.4, 4.6, 55);
  s.addImage({ path: BRAND + "/fundroad-logo-white.png", x: 0.6, y: 0.45, w: 1.29, h: 0.55 });
  txt(s, a.cible, { x: 0.6, y: 1.45, w: 4.6, h: 0.3, fontSize: 11, bold: true, charSpacing: 3, color: C.accent1 });
  txt(s, a.titre, { x: 0.6, y: 1.8, w: 4.6, h: 2.0, fontSize: 30, bold: true, color: C.background1, fit: "shrink" });
  txt(s, a.sousTitre, { x: 0.6, y: 3.9, w: 4.4, h: 1.2, fontSize: 13, color: C.accent5 });
  capture(s, a.couverture, 5.35, 1.25, 4.3, 3.6, "Capture du produit");

  // 2. Le coup de poing
  s = slide("Accent", "Constat");
  txt(s, "“", { x: 0.55, y: 0.35, w: 1.2, h: 1.2, fontSize: 96, bold: true, color: C.text1 });
  txt(s, a.punch, { x: 0.6, y: 1.45, w: 8.6, h: 2.2, fontSize: 34, bold: true, color: C.background1, valign: "middle" });
  txt(s, a.punchSous, { x: 0.6, y: 3.95, w: 7.6, h: 0.9, fontSize: 16, color: C.text1 });

  // 3. Avant / avec Fund Road
  s = slide("Clair", "Avant / après");
  s.addText("Ce qui change, concrètement", { placeholder: "title" });
  const croix = await icone(fa.FaXmark, HEX.accent3), coche = await icone(fa.FaCheck, HEX.accent1);
  for (const [i, [entete, items, fond, couleur, ic]] of [
    ["Aujourd’hui", a.avant, C.background2, C.text2, croix],
    ["Avec Fund Road", a.apres, C.text1, C.background1, coche],
  ].entries()) {
    const x = 0.6 + i * 4.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.35, w: 4.25, h: 3.45, rectRadius: 0.1, fill: { color: fond }, line: { type: "none" }, objectName: entete });
    txt(s, entete, { x: x + 0.35, y: 1.6, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: i ? C.accent1 : C.text1 });
    for (const [k, t] of items.entries()) {
      const y = 2.25 + k * 0.82;
      s.addImage({ data: ic, x: x + 0.35, y: y + 0.04, w: 0.24, h: 0.24 });
      txt(s, t, { x: x + 0.8, y, w: 3.2, h: 0.7, fontSize: 14, color: couleur });
    }
  }

  // 4+. Vitrines produit : capture + trois arguments, en alternance gauche / droite
  for (const [i, v] of a.vitrines.entries()) {
    s = slide("Vitrine", "Produit " + (i + 1));
    s.addText(v.titre, { placeholder: "title" });
    const haute = RATIO[v.img] < 1;
    const wImg = haute ? 3.3 : 4.8, hImg = 3.6;
    const gauche = i % 2 === 0;
    const xImg = gauche ? 0.6 : 9.4 - wImg;
    capture(s, v.img, xImg, 1.3, wImg, hImg, "Capture : " + v.titre);
    const xTxt = gauche ? xImg + wImg + 0.45 : 0.6;
    const wTxt = 9.4 - wImg - 0.45 - 0.6;
    for (const [k, [t, d]] of v.points.entries()) {
      const y = 1.4 + k * 1.15;
      s.addShape(pres.shapes.OVAL, { x: xTxt, y, w: 0.42, h: 0.42, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Point " + (k + 1) });
      txt(s, String(k + 1), { x: xTxt, y, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle" });
      txt(s, t, { x: xTxt + 0.6, y: y - 0.02, w: wTxt - 0.6, h: 0.35, fontSize: 14, bold: true, color: C.text1, fit: "shrink" });
      txt(s, d, { x: xTxt + 0.6, y: y + 0.35, w: wTxt - 0.6, h: 0.7, fontSize: 12, color: C.text2 });
    }
  }

  // Comment ça marche
  s = slide("Clair", "Fonctionnement");
  s.addText("Trois étapes, pas une de plus", { placeholder: "title" });
  for (const [i, [t, d]] of a.etapes.entries()) {
    const x = 0.6 + i * 3.0;
    s.addShape(pres.shapes.OVAL, { x, y: 1.55, w: 0.75, h: 0.75, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Étape " + (i + 1) });
    txt(s, String(i + 1), { x, y: 1.55, w: 0.75, h: 0.75, fontSize: 24, bold: true, color: C.background1, align: "center", valign: "middle" });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: x + 0.95, y: 1.925, w: 1.85, h: 0, line: { color: C.accent5, width: 1.5, dashType: "dash", endArrowType: "triangle" } });
    txt(s, t, { x, y: 2.55, w: 2.7, h: 0.5, fontSize: 22, bold: true, color: C.text1 });
    txt(s, d, { x, y: 3.1, w: 2.6, h: 1.5, fontSize: 14, color: C.text2 });
  }

  // Chiffres, sur fond sombre
  s = slide("Sombre", "Chiffres");
  txt(s, "En chiffres", { x: 0.6, y: 0.5, w: 8.8, h: 0.6, fontSize: 28, bold: true, color: C.background1 });
  for (const [i, [nb, l]] of a.chiffres.entries()) {
    const x = 0.6 + i * 3.0;
    txt(s, nb, { x, y: 1.8, w: 2.85, h: 1.2, fontSize: nb.length > 4 ? 48 : 64, bold: true, color: C.accent1, valign: "bottom" });
    txt(s, l, { x, y: 3.15, w: 2.5, h: 1.0, fontSize: 15, color: C.background1 });
  }

  // Confiance
  s = slide("Clair", "Confiance");
  s.addText("Des règles claires, écrites noir sur blanc", { placeholder: "title" });
  for (const [i, [Ic, t, d]] of CONFIANCE.entries()) {
    const x = 0.6 + (i % 2) * 4.5, y = 1.35 + Math.floor(i / 2) * 1.75;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.25, h: 1.5, rectRadius: 0.08, fill: { color: C.background2 }, line: { type: "none" }, objectName: "Règle " + (i + 1) });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.6, h: 0.6, fill: { color: C.accent2 }, line: { type: "none" } });
    s.addImage({ data: await icone(Ic, "FFFFFF"), x: x + 0.45, y: y + 0.45, w: 0.3, h: 0.3 });
    txt(s, t, { x: x + 1.15, y: y + 0.25, w: 2.9, h: 0.4, fontSize: 16, bold: true, color: C.text1 });
    txt(s, d, { x: x + 1.15, y: y + 0.65, w: 2.9, h: 0.75, fontSize: 12, color: C.text2 });
  }

  // Offre et appel à l'action
  s = slide("Sombre", "Offre");
  route(s, 7.2, 2.6, 3.0, 75);
  txt(s, "L’offre", { x: 0.6, y: 0.5, w: 8.8, h: 0.6, fontSize: 28, bold: true, color: C.background1 });
  for (const [i, [nom, prix, d]] of a.offre.entries()) {
    const x = 0.6 + i * 4.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.35, w: 4.2, h: 2.25, rectRadius: 0.1, fill: { color: C.text2 }, line: { type: "none" }, objectName: "Offre " + (i + 1) });
    txt(s, nom, { x: x + 0.35, y: 1.6, w: 3.5, h: 0.35, fontSize: 14, bold: true, color: C.accent5 });
    txt(s, prix, { x: x + 0.35, y: 1.95, w: 3.5, h: 0.75, fontSize: prix.length > 9 ? 24 : 34, bold: true, color: C.accent1, valign: "middle" });
    txt(s, d, { x: x + 0.35, y: 2.8, w: 3.5, h: 0.7, fontSize: 13, color: C.background1 });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.0, w: 6.3, h: 0.65, rectRadius: 0.32, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Appel à l’action" });
  txt(s, a.appel, { x: 0.85, y: 4.0, w: 5.9, h: 0.65, fontSize: 16, bold: true, color: C.background1, valign: "middle" });
  txt(s, "TVA non applicable, article 293 B du CGI.", { x: 0.6, y: 5.05, w: 6, h: 0.3, fontSize: 10, color: C.accent5 });
  s.addImage({ path: BRAND + "/fundroad-logo-white.png", x: 8.2, y: 4.85, w: 1.29, h: 0.55 });

  const out = path.join(__dirname, a.fichier + ".pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log(out);
}

(async () => {
  for (const a of ACTEURS) await deck(a);
})();
