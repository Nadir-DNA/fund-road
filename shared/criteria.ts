// Critères des financeurs : listes fixes (filtres, pages par segment) et champs propres à chaque type.
// Sans dépendance : importé par le client, le serveur, le script d'import et le prompt de recherche.

export const secteurs = [
  "Généraliste",
  "Logiciel / SaaS",
  "Intelligence artificielle",
  "Fintech / Assurtech",
  "Santé / Medtech",
  "Biotech",
  "Climat / Énergie",
  "Industrie / Deeptech",
  "Mobilité / Logistique",
  "Agritech / Alimentation",
  "Commerce / E-commerce",
  "Grande consommation",
  "Immobilier / Construction",
  "Éducation",
  "RH / Travail",
  "Cybersécurité",
  "Médias / Culture",
  "Tourisme / Loisirs",
  "Impact / ESS",
  "Spatial / Défense",
] as const;

export const stades = [
  "Idée",
  "Prototype",
  "Pré-amorçage",
  "Amorçage",
  "Série A",
  "Série B et plus",
  "Croissance",
] as const;

export const regionsFrance = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d’Azur",
  "Outre-mer",
] as const;
export const regions = [
  "France entière",
  ...regionsFrance,
  "Europe",
  "Amérique du Nord",
  "Afrique",
  "Moyen-Orient",
  "Asie",
  "International",
] as const;

export const types = {
  fund: "Fonds",
  angel: "Business angel",
  network: "Réseau de BA",
  incubator: "Incubateur",
  grant: "Organisme de financement",
} as const;
export type TypeFinanceur = keyof typeof types;

export type Champ = {
  key: string;
  label: string;
  type: "text" | "number" | "bool" | "choice" | "date";
  options?: readonly string[];
  // condition d'éligibilité : devient un critère bloquant vérifié par l'IA
  regle?: boolean;
};
const reseau: Champ[] = [
  { key: "ticketTotal", label: "Ticket total du réseau (€)", type: "number" },
  { key: "proximite", label: "Zone de proximité", type: "text" },
  {
    key: "implication",
    label: "Implication",
    type: "choice",
    options: ["Mentorat", "Rôle opérationnel", "Financier uniquement"],
  },
  { key: "coInvestissement", label: "Co-investit avec d’autres financeurs", type: "bool" },
  { key: "comites", label: "Dates des comités de sélection", type: "text" },
  { key: "frais", label: "Frais de candidature", type: "text" },
];
export const champsParType: Record<TypeFinanceur, Champ[]> = {
  fund: [
    {
      key: "position",
      label: "Position dans le tour",
      type: "choice",
      options: ["Mène les tours", "Suit les tours", "Mène ou suit"],
    },
    { key: "reinvestit", label: "Réinvestit aux tours suivants", type: "bool" },
    { key: "tractionMin", label: "Traction minimale attendue", type: "text", regle: true },
    { key: "tailleFonds", label: "Taille du fonds", type: "text" },
    { key: "delaiDecision", label: "Délai de décision", type: "text" },
  ],
  angel: reseau,
  network: reseau,
  incubator: [
    {
      key: "modele",
      label: "Modèle",
      type: "choice",
      options: ["Public", "Privé", "École / université", "Corporate"],
    },
    { key: "duree", label: "Durée du programme", type: "text" },
    { key: "dateLimite", label: "Prochaine date limite", type: "date" },
    {
      key: "contrepartie",
      label: "Contrepartie",
      type: "choice",
      options: ["Gratuit", "Frais", "Part du capital", "Frais et part du capital"],
    },
    { key: "contrepartieDetail", label: "Détail de la contrepartie", type: "text" },
    { key: "presentiel", label: "Présence sur place requise", type: "bool" },
    { key: "acces", label: "Conditions d’accès", type: "text", regle: true },
    { key: "services", label: "Services proposés", type: "text" },
  ],
  grant: [
    { key: "entreprise", label: "Âge ou taille de l’entreprise", type: "text", regle: true },
    { key: "montantMax", label: "Montant maximum (€)", type: "number" },
    { key: "tauxAide", label: "Taux d’aide", type: "text" },
    { key: "autofinancement", label: "Autofinancement exigé", type: "text", regle: true },
    { key: "depenses", label: "Dépenses éligibles", type: "text" },
    { key: "innovation", label: "Niveau d’innovation attendu", type: "text", regle: true },
    { key: "dateLimite", label: "Date limite", type: "date" },
  ],
};

export const euros = (n: number) =>
  n >= 1e6
    ? `${+(n / 1e6).toFixed(1)} M€`.replace(".", ",")
    : n >= 1e3
      ? `${Math.round(n / 1e3)} k€`
      : `${n} €`;
export function formatTicket(min?: number | null, max?: number | null) {
  if (min && max) return min === max ? euros(min) : `${euros(min)} à ${euros(max)}`;
  if (max) return `jusqu’à ${euros(max)}`;
  if (min) return `dès ${euros(min)}`;
  return "";
}
const liste = (v: unknown) => (Array.isArray(v) ? v.join(", ") : String(v || ""));

// Critères lisibles, qu'ils soient structurés (listes, montants) ou d'anciennes fiches en texte libre
export function resume(c: any = {}) {
  return {
    ticket: formatTicket(c.ticketMin, c.ticketMax) || String(c.ticket || ""),
    stage: liste(c.stages ?? c.stage),
    geography: liste(c.regions ?? c.geography),
    sectors: liste(c.sectors),
  };
}

// Détails propres au type, dans l'ordre du formulaire, sous forme [libellé, valeur affichable]
export function details(kind: string, c: any = {}) {
  const champs = champsParType[kind as TypeFinanceur] || [];
  return champs
    .map((f) => {
      const v = c.details?.[f.key];
      if (v === undefined || v === null || v === "") return null;
      const texte =
        f.type === "bool"
          ? v
            ? "Oui"
            : "Non"
          : f.type === "number"
            ? euros(Number(v))
            : f.type === "date"
              ? new Date(String(v)).toLocaleDateString("fr-FR")
              : String(v);
      return { champ: f, texte };
    })
    .filter((x): x is { champ: Champ; texte: string } => !!x);
}

// Un financeur correspond-il aux filtres de l'annuaire ? Généraliste, France entière et International élargissent.
export function correspond(
  c: any,
  f: { secteur?: string; stade?: string; region?: string },
) {
  const r = resume(c);
  const a = (v: unknown) => (Array.isArray(v) ? (v as string[]) : null);
  const contient = (vals: string[] | null, texte: string, x: string, larges: string[]) =>
    vals ? vals.includes(x) || vals.some((v) => larges.includes(v)) : texte.toLowerCase().includes(x.toLowerCase());
  return (
    (!f.secteur || contient(a(c.sectors), r.sectors, f.secteur, ["Généraliste"])) &&
    (!f.stade || contient(a(c.stages), r.stage, f.stade, [])) &&
    (!f.region ||
      contient(
        a(c.regions),
        r.geography,
        f.region,
        (regionsFrance as readonly string[]).includes(f.region)
          ? ["France entière", "Europe", "International"]
          : ["International"],
      ))
  );
}

// Libellé d'un champ cité (critère commun ou détail du type), pour la liste des sources d'une fiche
const communs: Record<string, string> = {
  sectors: "Secteurs",
  stages: "Stades",
  regions: "Zone",
  ticketMin: "Ticket minimum",
  ticketMax: "Ticket maximum",
};
export const libelleCritere = (kind: string, cle: string) =>
  communs[cle] || champsParType[kind as TypeFinanceur]?.find((c) => c.key === cle)?.label || cle;
