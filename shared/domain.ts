import { z } from "zod";
export const requirements = [
  {
    id: "company",
    label: "Présentation de l’entreprise",
    question: "Quelle est votre entreprise et son activité ?",
    weight: 1,
  },
  {
    id: "team",
    label: "Équipe et compétences",
    question: "Qui porte le projet et avec quelles compétences ?",
    weight: 1,
  },
  {
    id: "solution",
    label: "Problème et solution",
    question: "Quel problème résolvez-vous et comment ?",
    weight: 1,
  },
  {
    id: "market",
    label: "Marché et concurrence",
    question: "Qui sont vos clients et vos concurrents ?",
    weight: 1,
  },
  {
    id: "business",
    label: "Modèle économique",
    question: "Comment générez-vous du revenu ?",
    weight: 1,
  },
  {
    id: "traction",
    label: "Traction et preuves",
    question: "Quels résultats avez-vous obtenus, sur quelle période ?",
    weight: 1,
  },
  {
    id: "financials",
    label: "Situation et prévisions financières",
    question:
      "Quels sont vos revenus, charges et prévisions, avec leurs hypothèses ?",
    weight: 1,
  },
  {
    id: "funding",
    label: "Besoin de financement",
    question:
      "Quel montant recherchez-vous, sous quelle forme et à quelle échéance ?",
    weight: 1,
  },
  {
    id: "allocation",
    label: "Utilisation des fonds",
    question: "Comment utiliserez-vous le financement et pour quels jalons ?",
    weight: 1,
  },
] as const;
export type Fact = {
  value: string;
  source: string;
  confirmed: boolean;
  kind: "declared" | "document" | "hypothesis";
  quote?: string;
};
export type DossierState = {
  facts: Record<string, Fact>;
  conflicts: string[];
  summary: string;
  checkedRevision?: number;
  // programmes et financeurs visés, réponses du porteur par critère, résultat de l'IA par programme
  programs?: string[];
  declarations?: Record<string, string>;
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
export const factSchema = z.object({
  value: z.string().max(12000),
  source: z.string().max(200),
  confirmed: z.boolean(),
  kind: z.enum(["declared", "document", "hypothesis"]),
  quote: z.string().max(2000).optional(),
});
export function score(state: DossierState) {
  const completed = requirements.filter((r) => {
    const f = state.facts[r.id];
    return (
      f?.confirmed && f.kind !== "hypothesis" && f.value.trim().length >= 10
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
export function affiliateAmount(cents: number, refunded: number, rate: number) {
  return Math.max(0, Math.floor(((cents - refunded) * rate) / 10000));
}
export function validColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
export const dossierInput = z.object({
  name: z.string().trim().min(2).max(150),
  goal: z.enum(["investment", "grant"]),
  organizationId: z.string().uuid(),
  recipientOrg: z.string().uuid().optional(),
});
export const organizationInput = z.object({
  name: z.string().trim().min(2).max(100),
  kind: z.enum(["startup", "angel", "fund", "network", "grant", "incubator"]),
});
export const themeInput = z.object({
  name: z.string().min(2).max(100),
  accent: z.string().regex(/^#[0-9a-f]{6}$/i),
  intro: z.string().max(2000),
});
