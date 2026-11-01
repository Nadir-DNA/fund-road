export const requirements = [
  {
    id: "company",
    label: "Présentation de l’entreprise",
    question: "Quelle est votre entreprise et son activité ?",
    points: ["Forme juridique, date de création et siège", "Répartition du capital (table de capitalisation)", "Propriété intellectuelle et actifs clés (marque, code, brevets)", "Statuts ou labels utiles (JEI, innovation, lauréat)"],
    weight: 1,
  },
  {
    id: "team",
    label: "Équipe et compétences",
    question: "Qui porte le projet et avec quelles compétences ?",
    points: ["Rôles des fondateurs et complémentarité technique et commerciale", "Expérience du secteur visé (adéquation fondateurs-marché)", "Engagement à temps plein et répartition du capital entre fondateurs", "Compétences manquantes et recrutements clés prévus"],
    weight: 1,
  },
  {
    id: "solution",
    label: "Problème et solution",
    question: "Quel problème résolvez-vous et comment ?",
    points: ["Problème précis : qui le subit, à quelle fréquence, à quel coût", "Preuve du problème (entretiens, données, demandes clients)", "État du produit (prototype, version en production, utilisateurs)", "Différenciation durable face aux alternatives actuelles", "Pourquoi maintenant (changement de marché, technologie, réglementation)"],
    weight: 1,
  },
  {
    id: "market",
    label: "Marché et concurrence",
    question: "Qui sont vos clients et vos concurrents ?",
    points: ["Client cible défini précisément", "Taille de marché calculée depuis le terrain (nombre de clients × prix) et sourcée", "Concurrents et alternatives nommés", "Canaux d’acquisition identifiés et testés"],
    weight: 1,
  },
  {
    id: "business",
    label: "Modèle économique",
    question: "Comment générez-vous du revenu ?",
    points: ["Qui paie, combien et à quelle fréquence", "Marge brute et économie par client (coût d’acquisition, valeur vie client)", "Revenus récurrents ou ponctuels, durée du cycle de vente", "Prix déjà testé auprès de clients réels"],
    weight: 1,
  },
  {
    id: "traction",
    label: "Traction et preuves",
    question: "Quels résultats avez-vous obtenus, sur quelle période ?",
    points: ["Indicateurs chiffrés et datés (revenu, revenu mensuel récurrent, utilisateurs actifs)", "Croissance mesurée dans le temps (mois après mois)", "Rétention ou usage répété", "Clients payants, lettres d’intention ou partenariats vérifiables"],
    weight: 1,
  },
  {
    id: "financials",
    label: "Situation et prévisions financières",
    question:
      "Quels sont vos revenus, charges et prévisions, avec leurs hypothèses ?",
    points: ["Revenus et charges réels du dernier exercice", "Consommation mensuelle de trésorerie et durée de trésorerie restante", "Hypothèses du prévisionnel explicites et justifiées", "Cohérence entre croissance prévue, recrutements et charges"],
    weight: 1,
  },
  {
    id: "funding",
    label: "Besoin de financement",
    question:
      "Quel montant recherchez-vous, sous quelle forme et à quelle échéance ?",
    points: ["Montant recherché précis", "Instrument (capital, BSA AIR, prêt d’honneur, subvention) et dilution envisagée", "Financements déjà obtenus ou en cours", "Calendrier de la levée"],
    weight: 1,
  },
  {
    id: "allocation",
    label: "Utilisation des fonds",
    question: "Comment utiliserez-vous le financement et pour quels jalons ?",
    points: ["Répartition chiffrée des fonds par poste", "Jalons atteints grâce à ce financement", "Durée de trésorerie obtenue (en mois)", "Étape suivante visée (prochain tour, rentabilité) et indicateurs de réussite"],
    weight: 1,
  },
] as const;
export type Fact = {
  value: string;
  source: string;
  confirmed: boolean;
  kind: "declared" | "document" | "hypothesis";
  quote?: string;
  // informations complémentaires de la même rubrique, chacune avec sa propre citation
  details?: { value: string; source: string; quote: string; kind?: "hypothesis" }[];
};
// Revue critique « regard d'investisseur » : qualité de la démonstration, pas des personnes ni des chances de financement
export type NiveauRubrique = "solide" | "a_renforcer" | "insuffisant" | "absent";
export type CritiqueRubrique = {
  niveau: NiveauRubrique;
  constats: { point: string; statut: "ok" | "partiel" | "absent"; note: string }[];
  forces: string[];
  faiblesses: string[];
  questions: string[];
  action: string;
};
export type Critique = {
  synthese: string;
  stade: string;
  forces: string[];
  alertes: string[];
  priorites: string[];
  rubriques: Record<string, CritiqueRubrique>;
};
export const niveaux: Record<NiveauRubrique, string> = {
  solide: "Solide",
  a_renforcer: "À renforcer",
  insuffisant: "Insuffisant",
  absent: "Absent",
};
export type DossierState = {
  facts: Record<string, Fact>;
  conflicts: string[];
  summary: string;
  checkedRevision?: number;
  programs?: string[];
  declarations?: Record<string, string>;
  critique?: Critique;
  eligibility?: Record<
    string,
    Record<
      string,
      {
        status: "ok" | "ko" | "unknown";
        note: string;
        source?: string;
        quote?: string;
      }
    >
  >;
};
export const emptyState = (): DossierState => ({
  facts: {},
  conflicts: [],
  summary: "",
});
export function hasMissingInformation(value: string) {
  const text = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase();
  return (
    /(?:\bnon|\bn'est pas|\bne sont pas)\s+(?:communique|fourni|renseigne|disponible|precise|indique)\w*/.test(
      text,
    ) ||
    /\baucun\w*\s+[^.;!?]*\b(?:communique|fourni|renseigne)\w*/.test(text) ||
    /\ba completer\b|\binformation inconnue\b|\bdonnees manquantes\b/.test(text)
  );
}
export function score(state: DossierState) {
  const completed = requirements.filter((r) => {
    const f = state.facts[r.id];
    return (
      f?.confirmed &&
      f.kind !== "hypothesis" &&
      f.value.trim().length >= 10 &&
      !hasMissingInformation(f.value)
    );
  });
  const missing = requirements.filter((r) => !completed.includes(r));
  return {
    percent: Math.round((completed.length / requirements.length) * 100),
    completed: completed.length,
    total: requirements.length,
    missing,
    conflicts: state.conflicts,
    attestable: missing.length === 0 && state.conflicts.length === 0,
  };
}
export function canAttest(
  state: DossierState,
  revision: number,
  documentCount: number,
) {
  return (
    score(state).attestable &&
    state.checkedRevision === revision &&
    documentCount > 0
  );
}
