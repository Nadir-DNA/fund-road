// Génère une présentation Fund Road par acteur : node generer.cjs (NODE_PATH = modules globaux)
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

const icone = async (Icon, color) => {
  const svg = renderToStaticMarkup(React.createElement(Icon, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
};

// Faits communs, tous vérifiés dans le produit
const CONFIANCE = [
  [fa.FaRobot, "IA signalée", "Chaque passage généré par IA est indiqué comme tel, à l’écran et dans les exports."],
  [fa.FaLock, "Partage maîtrisé", "Un dossier se partage par version datée, avec les pièces choisies, et se révoque à tout moment."],
  [fa.FaFileLines, "Sources citées", "Chaque information renvoie à l’extrait du document dont elle vient."],
  [fa.FaHandshake, "Aucune commission", "Fund Road ne prélève rien sur les fonds levés ni sur les aides obtenues."],
];

const ACTEURS = [
  {
    fichier: "fund-road-startups",
    cible: "STARTUPS",
    titre: "Un dossier de financement prêt à envoyer",
    sousTitre: "Déposez vos documents, Fund Road les range, les vérifie et vous dit ce qui manque avant qu’un financeur ne le voie.",
    douleurs: [
      [fa.FaFolderOpen, "Des pièces éparpillées", "Deck, business plan et prévisionnel racontent chacun une version différente."],
      [fa.FaCircleQuestion, "Des critères flous", "Chaque aide et chaque fonds a ses exigences, rarement écrites au même endroit."],
      [fa.FaHourglassHalf, "Des allers-retours", "Les questions arrivent après l’envoi, quand il est trop tard pour corriger."],
    ],
    etapes: [
      ["Déposez", "PDF, Word ou Excel : le texte est extrait et l’IA range chaque information dans la bonne rubrique."],
      ["Vérifiez", "Vous confirmez ce que l’IA propose, avec la citation source, et corrigez les contradictions."],
      ["Partagez", "Export PDF et Word, ou partage daté et révocable avec un financeur."],
    ],
    gains: [
      [fa.FaListCheck, "9 rubriques attendues", "Équipe, marché, modèle, traction, finances, besoin et usage des fonds."],
      [fa.FaMagnifyingGlass, "Le regard d’un investisseur", "36 points de contrôle, les faiblesses et les questions qu’on vous posera."],
      [fa.FaBullseye, "Votre éligibilité", "Bourse French Tech, i-Nov, i-Lab, Initiative France, EIC… critère par critère."],
      [fa.FaAddressBook, "Les bons financeurs", "Un annuaire de 119 financeurs avec leurs tickets, secteurs et pièces demandées."],
    ],
    chiffres: [["9", "rubriques d’un dossier complet"], ["36", "points de contrôle investisseur"], ["119", "financeurs référencés"]],
    offre: [
      ["Découverte", "Gratuit", "Une analyse IA par mois pour voir où en est votre dossier."],
      ["Dossier", "149 €", "Renouvelé tous les 90 jours, résiliable en un clic depuis votre espace."],
    ],
    appel: "Créez votre dossier sur fund-road.com",
  },
  {
    fichier: "fund-road-incubateurs",
    cible: "INCUBATEURS ET ACCÉLÉRATEURS",
    titre: "Votre promotion prête à lever, sans relire chaque dossier",
    sousTitre: "Vos startups préparent leur dossier sur un portail à vos couleurs. Vous suivez leur avancement d’un coup d’œil.",
    douleurs: [
      [fa.FaLayerGroup, "Des dossiers hétérogènes", "Chaque startup présente son projet à sa façon, difficile à comparer."],
      [fa.FaClock, "Un suivi chronophage", "Savoir qui est prêt pour un comité demande de tout relire."],
      [fa.FaChartLine, "Des résultats attendus", "Vous êtes jugé sur les levées et les aides obtenues par vos startups."],
    ],
    etapes: [
      ["Configurez", "Votre portail : nom, couleur, critères, pièces demandées et questions."],
      ["Invitez", "Vos startups déposent leurs documents ; l’IA structure chaque dossier."],
      ["Suivez", "Complétude, adéquation à vos critères et étapes du programme, startup par startup."],
    ],
    gains: [
      [fa.FaPalette, "Un portail à vos couleurs", "Vos critères et vos questions, sous votre nom."],
      [fa.FaTableList, "Un tableau de promotion", "Le pourcentage de complétude et l’étape de chaque startup."],
      [fa.FaNoteSticky, "Des notes d’équipe privées", "Vos chargés d’affaires partagent leurs remarques, invisibles des startups."],
      [fa.FaCoins, "Un revenu pour vous", "Une commission sur chaque dossier payé par une startup que vous amenez."],
    ],
    chiffres: [["9", "rubriques identiques pour toute la promotion"], ["36", "points de contrôle investisseur"], ["20 %", "de commission sur chaque dossier payé"]],
    offre: [
      ["Espace incubateur", "Gratuit", "Portail, critères, suivi de promotion et notes d’équipe."],
      ["Programme partenaire", "+20 %", "Vous touchez 20 % de chaque dossier payé via votre code, soit environ 30 € par startup."],
    ],
    appel: "Ouvrez votre espace sur fund-road.com/financeurs",
  },
  {
    fichier: "fund-road-business-angels",
    cible: "BUSINESS ANGELS ET RÉSEAUX",
    titre: "Des dossiers lisibles, triés selon vos critères",
    sousTitre: "Indiquez votre ticket, vos secteurs et votre stade. Recevez des dossiers structurés et sourcés, sans relire chaque deck.",
    douleurs: [
      [fa.FaInbox, "Trop de decks", "Des dizaines de présentations par mois, dans tous les formats."],
      [fa.FaFilter, "Peu de temps pour trier", "Vérifier qu’un projet correspond à votre thèse prend du temps."],
      [fa.FaTriangleExclamation, "Des chiffres à recouper", "Les incohérences entre deck et prévisionnel se découvrent tard."],
    ],
    etapes: [
      ["Décrivez", "Ticket, secteurs, stade, géographie et pièces que vous demandez."],
      ["Recevez", "Les startups vous envoient un dossier structuré en 9 rubriques, avec ses sources."],
      ["Décidez", "Complétude et adéquation à vos critères affichées, pour creuser ou passer."],
    ],
    gains: [
      [fa.FaListCheck, "Un format unique", "Les 9 mêmes rubriques pour chaque dossier reçu."],
      [fa.FaBullseye, "L’adéquation à vos critères", "Ce qui correspond, ce qui manque et ce qui bloque."],
      [fa.FaQuoteLeft, "Des sources vérifiables", "Chaque information renvoie à l’extrait du document."],
      [fa.FaUsers, "Le travail en réseau", "Notes partagées et étapes de suivi pour tout le réseau."],
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
    titre: "Le premier tri de votre deal flow, fait pour vous",
    sousTitre: "Chaque dossier arrive structuré, sourcé et évalué par rapport à votre thèse. Votre équipe se concentre sur ceux qui comptent.",
    douleurs: [
      [fa.FaInbox, "Un deal flow massif", "Vos analystes passent des heures sur des dossiers hors thèse."],
      [fa.FaShuffle, "Des formats disparates", "Impossible de comparer deux startups sans tout remettre à plat."],
      [fa.FaTriangleExclamation, "Des incohérences cachées", "Les écarts entre deck et prévisionnel apparaissent en due diligence."],
    ],
    etapes: [
      ["Paramétrez", "Votre thèse : ticket, secteurs, stade, géographie, pièces et questions."],
      ["Recevez", "Des dossiers en 9 rubriques, sources citées, contradictions relevées."],
      ["Priorisez", "Complétude et adéquation à vos critères, puis suivi par étape jusqu’à l’investissement."],
    ],
    gains: [
      [fa.FaBullseye, "Adéquation à votre thèse", "Critère par critère, à la réception de chaque dossier."],
      [fa.FaUsers, "Un pipeline d’équipe", "Étapes, notes privées et accès pour tous vos associés."],
      [fa.FaPalette, "Un lien de candidature", "Un portail à vos couleurs avec vos propres questions."],
      [fa.FaComments, "Questions à l’IA (bientôt)", "Interroger un dossier et ses pièces, réponses citées."],
    ],
    chiffres: [["9", "rubriques comparables d’un dossier à l’autre"], ["36", "points de contrôle investisseur"], ["0 €", "pendant le lancement"]],
    offre: [
      ["Espace fonds", "Gratuit", "Gratuit pendant le lancement : portail, critères, pipeline et notes d’équipe."],
      ["Programme partenaire", "+20 %", "Une commission sur chaque dossier payé par une startup que vous orientez."],
    ],
    appel: "Ouvrez votre espace sur fund-road.com/financeurs",
  },
  {
    fichier: "fund-road-organismes-de-financement",
    cible: "ORGANISMES DE SUBVENTION ET DE FINANCEMENT PUBLIC",
    titre: "Des candidatures complètes avant même leur dépôt",
    sousTitre: "Vos critères et vos pièces deviennent un pré-contrôle automatique : les porteurs savent ce qui manque avant de vous solliciter.",
    douleurs: [
      [fa.FaFileCircleXmark, "Des dossiers incomplets", "Une part des candidatures revient pour des pièces ou informations manquantes."],
      [fa.FaCircleQuestion, "Des critères mal compris", "Les porteurs candidatent à des dispositifs auxquels ils ne sont pas éligibles."],
      [fa.FaUserClock, "Des chargés d’affaires saturés", "Le temps d’instruction part en relances plutôt qu’en analyse."],
    ],
    etapes: [
      ["Décrivez", "Les critères d’éligibilité et les pièces de votre dispositif, avec leurs sources officielles."],
      ["Pré-contrôlez", "Le porteur voit, critère par critère, ce qui est rempli, ce qui manque et ce qui bloque."],
      ["Recevez", "Un dossier homogène, sourcé et daté, avec les contradictions déjà signalées."],
    ],
    gains: [
      [fa.FaCircleCheck, "Moins de dossiers incomplets", "Les manques sont traités avant le dépôt."],
      [fa.FaScaleBalanced, "Un verdict indicatif", "Éligible, pièces à compléter, informations manquantes ou non éligible."],
      [fa.FaFileLines, "Un format homogène", "9 rubriques et les sources de chaque information."],
      [fa.FaPalette, "En marque blanche", "Un parcours de candidature sous votre nom et votre référentiel."],
    ],
    chiffres: [["7", "dispositifs déjà modélisés (French Tech, i-Nov, i-Lab, EIC…)"], ["4", "verdicts d’éligibilité"], ["9", "rubriques par dossier"]],
    offre: [
      ["Référencement", "Gratuit", "Votre dispositif et ses critères évalués pour chaque porteur de projet."],
      ["Marque blanche", "Sur devis", "Parcours de candidature à vos couleurs, selon votre référentiel."],
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

  pres.defineSlideMaster({
    title: "Sombre",
    background: { color: C.text1 },
    objects: [
      { image: { path: BRAND + "/fundroad-logo-white.png", x: 0.6, y: 0.5, w: 1.29, h: 0.55 } },
    ],
  });
  pres.defineSlideMaster({
    title: "Contenu",
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.5, 0.6],
    objects: [
      { image: { path: BRAND + "/fundroad-logo.png", x: 8.55, y: 5.08, w: 0.94, h: 0.4 } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 8.8, h: 0.7, fontSize: 28, bold: true, color: C.text1, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 0.6, y: 5.12, w: 0.5, h: 0.3, fontSize: 10, color: C.accent3 },
  });

  const sec = (t) => pres.addSection({ title: t });

  // 1. Couverture
  sec("Couverture");
  let s = pres.addSlide({ masterName: "Sombre", sectionTitle: "Couverture" });
  s.addText(a.cible, { x: 0.6, y: 1.75, w: 8.8, h: 0.35, fontSize: 12, bold: true, charSpacing: 3, color: C.accent1, margin: 0, isTextBox: true });
  s.addText(a.titre, { x: 0.6, y: 2.15, w: 8.2, h: 1.5, fontSize: 36, bold: true, color: C.background1, valign: "top", margin: 0, isTextBox: true });
  s.addText(a.sousTitre, { x: 0.6, y: 3.8, w: 7.4, h: 0.9, fontSize: 15, color: C.accent5, valign: "top", margin: 0, isTextBox: true });

  // 2. Le constat
  sec("Constat");
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Constat" });
  s.addText("Ce qui coince aujourd’hui", { placeholder: "title" });
  for (const [i, [Ic, t, d]] of a.douleurs.entries()) {
    const x = 0.6 + i * 3.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.45, w: 2.75, h: 2.75, rectRadius: 0.08, fill: { color: C.background2 }, line: { type: "none" }, objectName: "Carte " + (i + 1) });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.75, w: 0.62, h: 0.62, fill: { color: C.accent6 }, line: { type: "none" } });
    s.addImage({ data: await icone(Ic, HEX.accent1), x: x + 0.45, y: 1.9, w: 0.32, h: 0.32 });
    s.addText(t, { x: x + 0.3, y: 2.6, w: 2.2, h: 0.65, fontSize: 16, bold: true, color: C.text1, valign: "top", margin: 0, isTextBox: true });
    s.addText(d, { x: x + 0.3, y: 3.3, w: 2.2, h: 1.2, fontSize: 13, color: C.text2, valign: "top", margin: 0, isTextBox: true });
  }

  // 3. Comment ça marche
  sec("Fonctionnement");
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Fonctionnement" });
  s.addText("Comment ça marche", { placeholder: "title" });
  for (const [i, [t, d]] of a.etapes.entries()) {
    const x = 0.6 + i * 3.0;
    s.addShape(pres.shapes.OVAL, { x, y: 1.55, w: 0.7, h: 0.7, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Étape " + (i + 1) });
    s.addText(String(i + 1), { x, y: 1.55, w: 0.7, h: 0.7, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: x + 0.9, y: 1.9, w: 1.9, h: 0, line: { color: C.accent5, width: 1.5, dashType: "dash", endArrowType: "triangle" } });
    s.addText(t, { x, y: 2.5, w: 2.7, h: 0.45, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true });
    s.addText(d, { x, y: 3.0, w: 2.6, h: 1.6, fontSize: 14, color: C.text2, valign: "top", margin: 0, isTextBox: true });
  }

  // 4. Ce que vous y gagnez
  sec("Bénéfices");
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Bénéfices" });
  s.addText("Ce que vous y gagnez", { placeholder: "title" });
  for (const [i, [Ic, t, d]] of a.gains.entries()) {
    const x = 0.6 + (i % 2) * 4.5, y = 1.45 + Math.floor(i / 2) * 1.6;
    s.addShape(pres.shapes.OVAL, { x, y, w: 0.62, h: 0.62, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "Icône " + (i + 1) });
    s.addImage({ data: await icone(Ic, "FFFFFF"), x: x + 0.15, y: y + 0.15, w: 0.32, h: 0.32 });
    s.addText(t, { x: x + 0.85, y, w: 3.4, h: 0.4, fontSize: 16, bold: true, color: C.text1, margin: 0, isTextBox: true });
    s.addText(d, { x: x + 0.85, y: y + 0.42, w: 3.4, h: 0.9, fontSize: 13, color: C.text2, valign: "top", margin: 0, isTextBox: true });
  }

  // 5. En chiffres
  sec("Chiffres");
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Chiffres" });
  s.addText("Fund Road en chiffres", { placeholder: "title" });
  for (const [i, [n, l]] of a.chiffres.entries()) {
    const x = 0.6 + i * 3.0;
    s.addText(n, { x, y: 1.75, w: 2.75, h: 1.2, fontSize: 60, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(l, { x, y: 3.0, w: 2.5, h: 0.9, fontSize: 15, color: C.text2, valign: "top", margin: 0, isTextBox: true });
  }

  // 6. Confiance
  sec("Confiance");
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Confiance" });
  s.addText("Des règles claires", { placeholder: "title" });
  for (const [i, [Ic, t, d]] of CONFIANCE.entries()) {
    const y = 1.35 + i * 0.88;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.55, h: 0.55, fill: { color: C.background2 }, line: { type: "none" }, objectName: "Règle " + (i + 1) });
    s.addImage({ data: await icone(Ic, HEX.accent2), x: 0.735, y: y + 0.135, w: 0.28, h: 0.28 });
    s.addText([
      { text: t + "  ", options: { bold: true, color: C.text1 } },
      { text: d, options: { color: C.text2 } },
    ], { x: 1.4, y, w: 8.0, h: 0.55, fontSize: 14, valign: "middle", margin: 0, isTextBox: true });
  }

  // 7. Offre et prochaine étape
  sec("Offre");
  s = pres.addSlide({ masterName: "Sombre", sectionTitle: "Offre" });
  s.addText("L’offre", { x: 0.6, y: 1.35, w: 8.8, h: 0.6, fontSize: 28, bold: true, color: C.background1, margin: 0, isTextBox: true });
  for (const [i, [nom, prix, d]] of a.offre.entries()) {
    const x = 0.6 + i * 4.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.1, w: 4.2, h: 2.15, rectRadius: 0.08, fill: { color: C.text2 }, line: { type: "none" }, objectName: "Offre " + (i + 1) });
    s.addText(nom, { x: x + 0.3, y: 2.3, w: 3.6, h: 0.35, fontSize: 14, bold: true, color: C.accent5, margin: 0, isTextBox: true });
    s.addText(prix, { x: x + 0.3, y: 2.65, w: 3.6, h: 0.7, fontSize: 32, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(d, { x: x + 0.3, y: 3.4, w: 3.6, h: 0.75, fontSize: 13, color: C.background1, valign: "top", margin: 0, isTextBox: true });
  }
  s.addText(a.appel, { x: 0.6, y: 4.55, w: 8.8, h: 0.45, fontSize: 18, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText("TVA non applicable, article 293 B du CGI.", { x: 0.6, y: 5.05, w: 8.8, h: 0.3, fontSize: 10, color: C.accent5, margin: 0, isTextBox: true });

  const out = path.join(__dirname, a.fichier + ".pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log(out);
}

(async () => {
  for (const a of ACTEURS) await deck(a);
})();
