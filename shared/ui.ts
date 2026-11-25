// Décisions d'interface sorties du rendu : testables sans navigateur.
// Aucune donnée inventée ici : tout vient de l'état renvoyé par le serveur.

// Onglets du dossier : clés existantes de l'écran, plus les noms d'URL de la spec
export const ongletsDossier = [
  "overview",
  "documents",
  "dossier",
  "entretien",
  "questions",
  "eligibility",
  "share",
] as const;
export type OngletDossier = (typeof ongletsDossier)[number];
const aliasOnglet: Record<string, OngletDossier> = {
  apercu: "overview",
  partage: "share",
};
// ?onglet=… ; une valeur inconnue retombe sur la vue d'ensemble, sans erreur
export function ongletDepuisUrl(search: string): OngletDossier {
  const demande = new URLSearchParams(search).get("onglet") || "";
  if ((ongletsDossier as readonly string[]).includes(demande))
    return demande as OngletDossier;
  return aliasOnglet[demande] || "overview";
}
export function parametresOnglet(
  onglet: string,
): Record<string, string> {
  return onglet === "overview" ? {} : { onglet };
}

// Rubriques proposées par l'analyse et pas encore relues : seules celles-là
// peuvent être confirmées en un clic, et seulement avec la valeur déjà stockée.
export type Fait = {
  value?: string;
  confirmed?: boolean;
  source?: string;
} | null | undefined;
export const estProposition = (f: Fait) =>
  Boolean(
    f &&
      !f.confirmed &&
      !String(f.source || "").startsWith("declaration") &&
      String(f.value || "").trim(),
  );
export function propositionsRelues(
  facts: Record<string, Fait> | undefined,
  ids: readonly string[],
): string[] {
  if (!facts) return [];
  return ids.filter((id) => estProposition(facts[id]));
}
// A5b.2 : un conflit n'est rattaché à aucune rubrique : il bloque la confirmation groupée
export function confirmationEnLot(
  facts: Record<string, Fait> | undefined,
  ids: readonly string[],
  conflits = 0,
): string[] {
  return conflits > 0 ? [] : propositionsRelues(facts, ids);
}

// Statuts techniques : jamais affichés tels quels
const statutsJob: Record<string, string> = {
  queued: "en attente",
  running: "en cours",
  done: "terminée",
  failed: "échec",
};
export const libelleJob = (kind: string, status: string) =>
  `${kind === "analysis" ? "Analyse IA" : "Extraction"} : ${
    statutsJob[status] || "état inconnu"
  }`;

const statutsRecompense: Record<string, string> = {
  pending: "En attente",
  available: "Disponible",
  used: "Utilisé",
  expired: "Expiré",
  refunded: "Remboursé",
  cancelled: "Annulé",
};
export const libelleRecompense = (statut?: string) =>
  (statut && statutsRecompense[statut]) || "À vérifier";

const statutsDroit: Record<string, string> = {
  active: "Active",
  past_due: "Paiement en échec",
  cancelled: "Résiliée",
  expired: "Expirée",
};
export const libelleDroit = (statut?: string) =>
  (statut && statutsDroit[statut]) || "À vérifier";

// Annuaire : compteur sur le filtre courant, et tri qui ne classe jamais un
// ticket inconnu à 0 (il passe après les tickets connus)
export type TriAnnuaire = "nom" | "ticket-asc" | "ticket-desc" | "verification";
export const trisAnnuaire: readonly (readonly [TriAnnuaire, string])[] = [
  ["nom", "Nom"],
  ["ticket-asc", "Ticket croissant"],
  ["ticket-desc", "Ticket décroissant"],
  ["verification", "Date de vérification"],
];
export const ticketConnu = (o: any): number | null => {
  const c = o?.criteria || {};
  // A13.2 : une borne sans source ne classe pas la fiche — elle s'affiche « Non communiqué »
  const sources = c.sources || {};
  const min = Number(c.ticketMin);
  if (sources.ticketMin && Number.isFinite(min) && min > 0) return min;
  const max = Number(c.ticketMax);
  if (sources.ticketMax && Number.isFinite(max) && max > 0) return max;
  return null;
};
const nomAffiche = (o: any) => String(o?.theme?.name || o?.name || "");
export function trierAnnuaire<T>(rows: readonly T[], tri: TriAnnuaire): T[] {
  const copie = [...rows];
  if (tri === "nom")
    return copie.sort((a, b) => nomAffiche(a).localeCompare(nomAffiche(b), "fr"));
  if (tri === "verification")
    return copie.sort(
      (a, b) => dateVerification(b as any) - dateVerification(a as any),
    );
  const sens = tri === "ticket-asc" ? 1 : -1;
  return copie.sort((a, b) => {
    const x = ticketConnu(a),
      y = ticketConnu(b);
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * sens;
  });
}
const dateVerification = (o: any) => {
  const d = Date.parse(String(o?.verifiedAt || o?.verified_at || ""));
  return Number.isFinite(d) ? d : 0;
};

// Menus par profil : la liste est décidée ici, le rendu ne fait que la suivre.
// Un financeur n'a ni dossiers de startup, ni annuaire, ni recommandations ; la facturation
// ne s'affiche que s'il a un droit payant (elle est gratuite sinon).
export type EntreeMenu = readonly [string, string];
const MENU_STARTUP: readonly EntreeMenu[] = [
  ["/app", "Vue d’ensemble"],
  ["/app/dossiers", "Mes dossiers"],
  ["/app/candidatures", "Candidatures"],
  ["/app/annuaire", "Annuaire"],
  ["/app/portail", "Mon organisation"],
  ["/app/partenaires", "Recommandations"],
  ["/app/facturation", "Facturation"],
  ["/app/securite", "Sécurité"],
];
const MENU_FINANCEUR: readonly EntreeMenu[] = [
  ["/app", "Pipeline"],
  ["/app/candidatures", "Candidatures"],
  ["/app/portail", "Mon organisation"],
  ["/app/securite", "Sécurité"],
];
export function menuPour(kind?: string, paid = false): readonly EntreeMenu[] {
  if (!kind || kind === "startup") return MENU_STARTUP;
  return paid
    ? [...MENU_FINANCEUR, ["/app/facturation", "Facturation"] as EntreeMenu]
    : MENU_FINANCEUR;
}

// Pipeline financeur : recherche, tri et lignes exportées identiques à l'écran
export type TriPipeline = "date" | "fit" | "nom";
export const trisPipeline: readonly (readonly [TriPipeline, string])[] = [
  ["date", "Date de réception"],
  ["fit", "Adéquation"],
  ["nom", "Nom"],
];
const nomPipeline = (r: any) => String(r?.startup || r?.name || "");
export function filtrerPipeline<T>(rows: readonly T[], recherche: string): T[] {
  const t = recherche.trim().toLowerCase();
  if (!t) return [...rows];
  return rows.filter((r: any) =>
    [r.startup, r.name].join(" ").toLowerCase().includes(t),
  );
}
export function trierPipeline<T>(rows: readonly T[], tri: TriPipeline): T[] {
  const copie = [...rows];
  if (tri === "nom")
    return copie.sort((a, b) => nomPipeline(a).localeCompare(nomPipeline(b), "fr"));
  if (tri === "fit")
    return copie.sort((a: any, b: any) => {
      const x = typeof a.fit?.percent === "number" ? a.fit.percent : null;
      const y = typeof b.fit?.percent === "number" ? b.fit.percent : null;
      if (x === null && y === null) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return y - x;
    });
  return copie.sort(
    (a: any, b: any) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0),
  );
}
// Export CSV du tableau affiché : mêmes lignes, aucune colonne en plus
export function csvPipeline(rows: readonly any[]): string {
  const echappe = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lignes = [
    ["Startup", "Dossier", "Complétude", "Adéquation", "Étape"],
    ...rows.map((r) => [
      r.startup || "Startup invitée",
      r.name || "",
      r.score?.percent ?? "",
      r.fit?.percent ?? "",
      r.stage || "",
    ]),
  ];
  return lignes.map((l) => l.map(echappe).join(";")).join("\n");
}

// Programmes : recherche libre (nom, opérateur, type, résumé) et suggestions
// ordonnées selon l'objectif du dossier
export function filtrerProgrammes<T extends { name?: string; operator?: string; kind?: string; summary?: string }>(
  list: readonly T[],
  recherche: string,
): T[] {
  const t = recherche.trim().toLowerCase();
  if (!t) return [...list];
  return list.filter((p) =>
    [p.name, p.operator, p.kind, p.summary].join(" ").toLowerCase().includes(t),
  );
}
export function trierProgrammes<T extends { kind?: string; name?: string }>(
  list: readonly T[],
  objectif?: string,
): T[] {
  const prefere =
    objectif === "investment"
      ? "Subvention et fonds propres"
      : objectif === "grant"
        ? "Subvention"
        : "";
  return [...list].sort(
    (a, b) =>
      Number(b.kind === prefere) - Number(a.kind === prefere) ||
      String(a.name || "").localeCompare(String(b.name || ""), "fr"),
  );
}
