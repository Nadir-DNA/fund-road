import { details, resume, types, type TypeFinanceur } from "./criteria.ts";
// Référentiels de programmes de financement : critères publics, sources et date de vérification.
// Ces règles évoluent : toute mise à jour change `verifiedAt` et la liste `sources`.
export type Criterion = {
  id: string;
  label: string;
  // bloquant : critère d'éligibilité ; sinon pièce ou information attendue
  blocking: boolean;
  question: string;
};
export type Program = {
  id: string;
  name: string;
  operator: string;
  kind: "Subvention" | "Prêt" | "Concours" | "Subvention et fonds propres";
  amount: string;
  summary: string;
  verifiedAt: string;
  confidence: "officielle" | "secondaire";
  sources: { label: string; url: string }[];
  criteria: Criterion[];
  // dossier transmis ensuite à un conseiller Fund Road qui accompagne la démarche
  handoff?: boolean;
};

const notInDifficulty: Criterion = {
  id: "not_in_difficulty",
  label: "Entreprise non en difficulté",
  blocking: true,
  question:
    "L’entreprise n’est pas « en difficulté » au sens européen (capitaux propres non réduits de plus de moitié par les pertes, pas de procédure collective) ?",
};
const frenchCompany: Criterion = {
  id: "registered_france",
  label: "Immatriculée en France",
  blocking: true,
  question: "L’entreprise est-elle immatriculée au RCS en France ?",
};

export const programs: Program[] = [
  {
    id: "bft",
    name: "Bourse French Tech",
    operator: "Bpifrance",
    kind: "Subvention",
    amount: "Jusqu’à 30 000 €, 70 % des dépenses éligibles au plus",
    summary:
      "Subvention pour les très jeunes entreprises innovantes en phase de maturation du projet.",
    verifiedAt: "2026-10-21",
    confidence: "secondaire",
    sources: [
      {
        label: "Fiche Bpifrance · les-aides.fr",
        url: "https://les-aides.fr/aide/M3OP3w/bpifrance.bourse-french-tech.pdf",
      },
      {
        label: "Conditions détaillées · Hayot Expertise",
        url: "https://hayot-expertise.fr/blog/bourse-french-tech-bpifrance-conditions",
      },
    ],
    criteria: [
      {
        id: "age_lt_1y",
        label: "Créée depuis un an au plus",
        blocking: true,
        question:
          "Date d’immatriculation de l’entreprise : moins d’un an à la date de la demande ?",
      },
      frenchCompany,
      {
        id: "headcount_lt_50",
        label: "Moins de 50 salariés",
        blocking: true,
        question: "Effectif inférieur à 50 salariés ?",
      },
      {
        id: "revenue_lt_10m",
        label: "Chiffre d’affaires ou bilan < 10 M€",
        blocking: true,
        question: "Chiffre d’affaires ou total de bilan inférieur à 10 M€ ?",
      },
      {
        id: "innovation",
        label: "Projet innovant",
        blocking: true,
        question:
          "En quoi le projet est-il innovant (technologie, usage, procédé) par rapport à l’existant ?",
      },
      {
        id: "equity_covers_aid",
        label: "Fonds propres ≥ aide demandée",
        blocking: true,
        question:
          "Les fonds propres de l’entreprise sont-ils au moins égaux au montant d’aide demandé ?",
      },
      {
        id: "expense_budget",
        label: "Budget des dépenses du programme",
        blocking: false,
        question:
          "Budget détaillé : frais internes (personnel, frais généraux) et frais externes (prestations, propriété intellectuelle, études de faisabilité, juridique, design).",
      },
      {
        id: "cofunding_30",
        label: "Cofinancement d’au moins 30 %",
        blocking: false,
        question:
          "Plan de financement montrant comment l’entreprise finance au moins 30 % des dépenses.",
      },
    ],
  },
  {
    id: "bft_emergence",
    name: "Bourse French Tech Emergence",
    operator: "Bpifrance",
    kind: "Subvention",
    amount: "Jusqu’à 90 000 €, 70 % des dépenses éligibles au plus",
    summary:
      "Variante deeptech de la Bourse French Tech, pour un projet à fort contenu technologique.",
    verifiedAt: "2026-10-21",
    confidence: "secondaire",
    sources: [
      {
        label: "Fiche Bpifrance · les-aides.fr (mise à jour 11/08/2026)",
        url: "https://les-aides.fr/aide/VCEv3w/bpifrance.bourse-french-tech-emergence.pdf",
      },
    ],
    criteria: [
      {
        id: "age_lt_1y",
        label: "Immatriculée depuis moins d’un an",
        blocking: true,
        question: "Date d’immatriculation : moins d’un an ?",
      },
      frenchCompany,
      {
        id: "deeptech",
        label: "Fort contenu technologique (deeptech)",
        blocking: true,
        question:
          "Le projet repose-t-il sur une technologie de rupture ou issue de la recherche ? Laquelle ?",
      },
      {
        id: "program_12_18m",
        label: "Programme de 12 à 18 mois",
        blocking: false,
        question:
          "Durée et jalons du programme de travail (12 mois, 18 au plus).",
      },
      {
        id: "expense_budget",
        label: "Budget des dépenses du programme",
        blocking: false,
        question: "Budget détaillé des dépenses internes et externes.",
      },
      {
        id: "cofunding_30",
        label: "Cofinancement d’au moins 30 %",
        blocking: false,
        question: "Plan de financement couvrant au moins 30 % des dépenses.",
      },
    ],
  },
  {
    id: "pret_amorcage",
    name: "Prêt d’amorçage",
    operator: "Bpifrance",
    kind: "Prêt",
    amount:
      "50 000 à 100 000 €, limité aux fonds propres ; sans garantie personnelle",
    summary:
      "Prêt pour préparer une levée de fonds, après une première aide à l’innovation.",
    verifiedAt: "2026-10-21",
    confidence: "secondaire",
    sources: [
      {
        label: "Bpifrance Création",
        url: "https://bpifrance-creation.fr/encyclopedie/financements/lemprunt/pret-damorcage-bpifrance",
      },
      {
        label: "Fiche Bpifrance · les-aides.fr",
        url: "https://les-aides.fr/aide/OEhf3w/bpifrance.pret-d-amorcage-investissement.pdf",
      },
    ],
    criteria: [
      {
        id: "age_lt_5y",
        label: "PME de moins de 5 ans",
        blocking: true,
        question: "L’entreprise a-t-elle moins de 5 ans ?",
      },
      {
        id: "prior_innovation_aid",
        label: "Aide à l’innovation déjà obtenue",
        blocking: true,
        question:
          "L’entreprise a-t-elle déjà bénéficié d’une aide à l’innovation (Bourse French Tech, aide Bpifrance, i-Lab…) ? Laquelle ?",
      },
      {
        id: "no_dividends",
        label: "Aucun bénéfice distribué",
        blocking: true,
        question: "L’entreprise a-t-elle déjà distribué des bénéfices ?",
      },
      notInDifficulty,
      {
        id: "equity_covers_loan",
        label: "Fonds propres ≥ montant du prêt",
        blocking: true,
        question:
          "Montant des fonds propres et quasi-fonds propres, comparé au prêt demandé.",
      },
      {
        id: "fundraising_plan",
        label: "Levée de fonds préparée",
        blocking: false,
        question:
          "Montant visé, calendrier et investisseurs approchés pour la levée.",
      },
    ],
  },
  {
    id: "inov",
    name: "Concours i-Nov",
    operator: "Bpifrance · France 2030",
    kind: "Concours",
    amount: "Subvention et avance récupérable pour un projet de 1 à 5 M€",
    summary:
      "Concours pour les projets de R&D d’une startup ou PME, sur les thématiques de la vague en cours.",
    verifiedAt: "2026-10-21",
    confidence: "officielle",
    sources: [
      {
        label: "Cahier des charges i-Nov vague 14",
        url: "https://lyonbiopole.com/wp-content/uploads/2024/07/Cahier-des-charges-i-Nov-vague-14.pdf",
      },
      {
        label: "Fiche Bpifrance · les-aides.fr",
        url: "https://les-aides.fr/aide/R5Rf3w/bpifrance.concours-d-innovation-i-nov.pdf",
      },
    ],
    criteria: [
      frenchCompany,
      {
        id: "eu_sme",
        label: "PME au sens européen",
        blocking: true,
        question:
          "Moins de 250 salariés et chiffre d’affaires ≤ 50 M€ ou bilan ≤ 43 M€ ?",
      },
      notInDifficulty,
      {
        id: "tax_social_ok",
        label: "À jour des obligations fiscales et sociales",
        blocking: true,
        question:
          "L’entreprise est-elle à jour de ses obligations fiscales et sociales ?",
      },
      {
        id: "single_company",
        label: "Projet porté par une seule entreprise",
        blocking: true,
        question:
          "Le projet est-il porté par votre seule entreprise (non collaboratif) ?",
      },
      {
        id: "cost_1_5m",
        label: "Coût total entre 1 et 5 M€",
        blocking: true,
        question: "Coût total du projet de R&D ?",
      },
      {
        id: "duration_12_36m",
        label: "Durée de 12 à 36 mois",
        blocking: true,
        question: "Durée prévue du projet ?",
      },
      {
        id: "theme",
        label: "Thématique de la vague en cours",
        blocking: true,
        question:
          "À quelle thématique de la vague i-Nov en cours le projet répond-il ?",
      },
    ],
  },
  {
    id: "ilab",
    name: "Concours i-Lab",
    operator: "MESR · Bpifrance · France 2030",
    kind: "Concours",
    amount: "Subvention pour la R&D du projet (montant fixé par le règlement)",
    summary:
      "Concours d’innovation pour les projets technologiques en création ou les entreprises de moins de 2 ans.",
    verifiedAt: "2026-10-21",
    confidence: "officielle",
    sources: [
      {
        label: "Règlement i-Lab, 26e édition",
        url: "https://www.entreprises.gouv.fr/files/files/aap/concours-dinnovation-i-lab-reglement-26e-edition.pdf",
      },
      {
        label: "Règlement i-Lab, 27e édition",
        url: "https://lyonbiopole.com/wp-content/uploads/2025/02/Concours-dinnovation-i-Lab-Reglement-27-edition.pdf",
      },
    ],
    criteria: [
      {
        id: "age_lt_2y",
        label: "Entreprise de moins de 2 ans ou en création",
        blocking: true,
        question:
          "L’entreprise a-t-elle moins de deux ans, ou est-elle encore à créer ?",
      },
      {
        id: "deeptech",
        label: "Projet technologique innovant",
        blocking: true,
        question: "Quelle innovation technologique le projet développe-t-il ?",
      },
      {
        id: "feasibility",
        label: "Faisabilité technique, économique et juridique établie",
        blocking: true,
        question:
          "Quelles preuves de faisabilité avez-vous (prototype, essais, brevets, liberté d’exploitation, premiers clients) ?",
      },
      {
        id: "parent_lt_25",
        label: "Société mère < 25 % (essaimage)",
        blocking: true,
        question:
          "En cas d’essaimage, la société mère détient-elle moins de 25 % du capital ?",
      },
      {
        id: "rd_program",
        label: "Programme de R&D financé",
        blocking: false,
        question:
          "Travaux de R&D restant à mener pour finaliser le produit, procédé ou service.",
      },
    ],
  },
  {
    id: "initiative_france",
    name: "Prêt d’honneur Initiative France",
    operator: "Réseau Initiative France",
    kind: "Prêt",
    amount: "Prêt personnel à taux zéro, montant fixé par l’antenne locale",
    summary:
      "Prêt sans garantie au créateur ou repreneur, qui facilite l’accès au prêt bancaire.",
    verifiedAt: "2026-10-21",
    confidence: "secondaire",
    sources: [
      {
        label: "Exemple d’antenne · Initiative Isère Vallée du Rhône",
        url: "https://les-aides.fr/aide/SWZv3w/initiative-isere-vallee-de-rhone.pret-d-honneur-creation-reprise.pdf",
      },
      {
        label: "Exemple d’antenne · Initiative Alsace Centrale",
        url: "https://les-aides.fr/aide/IxiP3w/initiative-alsace-centrale.pret-d-honneur-createur-repreneur.pdf",
      },
    ],
    criteria: [
      {
        id: "creation_or_takeover",
        label: "Création ou reprise d’entreprise",
        blocking: true,
        question: "S’agit-il d’une création ou d’une reprise d’entreprise ?",
      },
      {
        id: "not_micro",
        label: "Société (hors micro-entreprise)",
        blocking: true,
        question:
          "La structure est-elle une société, et non une micro-entreprise ?",
      },
      {
        id: "sector_ok",
        label: "Activité hors agriculture et profession libérale",
        blocking: true,
        question: "Quelle est l’activité exacte ?",
      },
      {
        id: "forecast_3y",
        label: "Prévisionnel sur 3 ans",
        blocking: false,
        question: "Compte de résultat et trésorerie prévisionnels sur 3 ans.",
      },
      {
        id: "bank_loan",
        label: "Financement bancaire associé",
        blocking: false,
        question: "Quel prêt bancaire le prêt d’honneur doit-il compléter ?",
      },
      {
        id: "quotes",
        label: "Devis des investissements",
        blocking: false,
        question: "Devis des investissements prévus et, le cas échéant, bail.",
      },
    ],
  },
  {
    id: "pass_pi_brevet",
    name: "Pass PI Brevet Français",
    operator: "INPI",
    kind: "Subvention",
    amount:
      "50 % de la prestation d’un conseil en PI, 3 000 € TTC par Pass, 5 000 € TTC cumulés par entreprise",
    summary:
      "Prise en charge de la moitié du dépôt de brevet français (ou certificat d’utilité) réalisé par un conseil en propriété industrielle.",
    verifiedAt: "2026-10-21",
    confidence: "officielle",
    handoff: true,
    sources: [
      { label: "Pass PI · INPI", url: "https://www.inpi.fr/pass-pi" },
      {
        label: "Présentation Pass PI · INPI (février 2026)",
        url: "https://www.franceangels.org/wp-content/uploads/2026/02/Presentation-PASS-PI.pdf",
      },
      {
        label: "Fiche Pass PI · les-aides.fr",
        url: "https://les-aides.fr/aide/QlZP3w/inpi.pass-pi.pdf",
      },
    ],
    criteria: [
      {
        id: "eu_sme",
        label: "Startup ou PME",
        blocking: true,
        question: "Moins de 250 salariés et CA ≤ 50 M€ ou bilan ≤ 43 M€ ?",
      },
      frenchCompany,
      {
        id: "inpi_prediag",
        label: "Pré-diagnostic PI de l’INPI réalisé",
        blocking: true,
        question:
          "Avez-vous réalisé un pré-diagnostic propriété intellectuelle (ou une visite) avec l’INPI recommandant un dépôt ? Date ?",
      },
      {
        id: "pass_pi_cap",
        label: "Plafond Pass PI non atteint",
        blocking: true,
        question:
          "Combien de Pass PI avez-vous déjà utilisés (3 au plus, 5 000 € TTC cumulés) ?",
      },
      {
        id: "invention",
        label: "Invention décrite",
        blocking: false,
        question:
          "Décrivez l’invention : problème technique résolu, ce qui est nouveau, et son application industrielle.",
      },
      {
        id: "ip_attorney_quote",
        label: "Devis d’un conseil en PI (≤ 6 000 € TTC)",
        blocking: false,
        question:
          "Avez-vous un devis d’un conseil en propriété industrielle pour le dépôt ? Montant TTC ?",
      },
    ],
  },
  {
    id: "eic_accelerator",
    name: "EIC Accelerator",
    operator: "Commission européenne",
    kind: "Subvention et fonds propres",
    amount: "Subvention jusqu’à 2,5 M€ et investissement en fonds propres",
    summary:
      "Programme européen pour les startups et PME deeptech prêtes à passer à l’échelle.",
    verifiedAt: "2026-10-21",
    confidence: "officielle",
    sources: [
      {
        label: "FAQ EIC Accelerator · Commission européenne",
        url: "https://eic.ec.europa.eu/eic-frequently-asked-questions/faqs-eic-accelerator_en",
      },
    ],
    criteria: [
      {
        id: "eu_based",
        label: "Établie dans l’UE ou un pays associé",
        blocking: true,
        question: "Où l’entreprise est-elle établie ?",
      },
      {
        id: "eu_sme",
        label: "Startup ou PME",
        blocking: true,
        question: "Moins de 250 salariés et CA ≤ 50 M€ ou bilan ≤ 43 M€ ?",
      },
      {
        id: "trl_6_8",
        label: "Maturité technologique TRL 6 à 8 (volet subvention)",
        blocking: true,
        question:
          "Niveau de maturité de la technologie (prototype démontré en environnement réel ?)",
      },
      {
        id: "single_application",
        label: "Une seule candidature active",
        blocking: true,
        question: "Avez-vous une autre candidature EIC Accelerator en cours ?",
      },
      {
        id: "pitch_deck",
        label: "Pitch deck de 10 slides au plus",
        blocking: false,
        question:
          "Pitch deck de la proposition courte (10 diapositives maximum).",
      },
      {
        id: "scaleup_plan",
        label: "Plan de passage à l’échelle",
        blocking: false,
        question:
          "Marché visé, stratégie de croissance et besoin total de financement.",
      },
    ],
  },
];

export type EligibilityStatus = "ok" | "ko" | "unknown";
export type Eligibility = {
  status: EligibilityStatus;
  note: string;
  source?: string;
  quote?: string;
};
export const findProgram = (id?: string) => programs.find((p) => p.id === id);

// Verdict prudent : jamais « financé », seulement « éligible a priori » à confirmer
export function programScore(
  program: Program,
  eligibility: Record<string, Eligibility> = {},
) {
  const rows = program.criteria.map((c) => ({
    ...c,
    result: eligibility[c.id] || { status: "unknown" as const, note: "" },
  }));
  const ok = rows.filter((r) => r.result.status === "ok").length;
  const blockers = rows.filter((r) => r.blocking && r.result.status === "ko");
  const missing = rows.filter((r) => r.result.status !== "ok");
  const verdict = blockers.length
    ? "ineligible"
    : missing.some((r) => r.blocking)
      ? "incomplete"
      : missing.length
        ? "eligible_missing_pieces"
        : "eligible";
  return {
    percent: Math.round((ok / rows.length) * 100),
    ok,
    total: rows.length,
    verdict,
    blockers,
    missing,
    rows,
  } as const;
}

// Un financeur inscrit (business angel, fonds, réseau, organisme) devient un programme évaluable
// à partir des critères de son portail.
const orgKinds: Record<string, Program["kind"]> = {
  angel: "Subvention et fonds propres",
  fund: "Subvention et fonds propres",
  network: "Subvention et fonds propres",
  grant: "Subvention",
  incubator: "Subvention et fonds propres",
};
export function orgProgram(org: {
  id: string;
  name: string;
  kind: string;
  criteria: any;
}): Program {
  const c = org.criteria || {};
  // lisible que les critères soient structurés ou en texte libre (anciennes fiches)
  const r = resume(c);
  const rule = (id: string, label: string, value: string, question: string) =>
    value?.trim()
      ? [{ id, label: `${label} : ${value.trim()}`, blocking: true, question }]
      : [];
  return {
    id: "org:" + org.id,
    name: org.name,
    operator: types[org.kind as TypeFinanceur] || "Financeur",
    kind: orgKinds[org.kind] || "Subvention",
    amount: r.ticket ? "Ticket : " + r.ticket : "Ticket non précisé",
    summary: "Critères définis par le financeur sur son portail Fund Road.",
    verifiedAt: new Date().toISOString().slice(0, 10),
    confidence: "officielle",
    sources: [],
    criteria: [
      ...rule(
        "sector",
        "Secteur",
        // un financeur généraliste n'exclut aucun secteur
        /Généraliste/.test(r.sectors) ? "" : r.sectors,
        "Dans quel secteur opère l’entreprise ?",
      ),
      ...rule(
        "stage",
        "Stade",
        r.stage,
        "À quel stade de développement est l’entreprise ?",
      ),
      ...rule(
        "geography",
        "Géographie",
        /International/.test(r.geography) ? "" : r.geography,
        "Où l’entreprise est-elle implantée et où vend-elle ?",
      ),
      ...rule(
        "ticket",
        "Ticket",
        r.ticket,
        "Quel montant recherchez-vous auprès de ce financeur ?",
      ),
      // conditions propres au type (traction minimale, conditions d'accès, autofinancement…)
      ...details(org.kind, c)
        .filter((d) => d.champ.regle)
        .flatMap((d) =>
          rule(
            "x:" + d.champ.key,
            d.champ.label,
            d.texte,
            `L’entreprise remplit-elle cette condition : ${d.champ.label.toLowerCase()} ?`,
          ),
        ),
      ...(c.exclusions?.trim()
        ? [
            {
              id: "exclusions",
              label: "Hors exclusions : " + c.exclusions.trim(),
              blocking: true,
              question:
                "L’activité relève-t-elle d’une des exclusions du financeur ?",
            },
          ]
        : []),
      ...(c.questions || []).map((q: string, i: number) => ({
        id: `q:${org.id}:${i}`,
        label: q,
        blocking: false,
        question: q,
      })),
      // pièces demandées par le financeur : non bloquantes, vérifiées sur les documents
      ...(c.documents || []).map((d: string, i: number) => ({
        id: `d:${org.id}:${i}`,
        label: "Pièce demandée : " + d,
        blocking: false,
        question: `Le dossier contient-il ce document : ${d} ?`,
      })),
    ],
  };
}
