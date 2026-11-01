import { z } from "zod";
export * from "./score.ts";
import {
  champsParType,
  regions,
  secteurs,
  stades,
  type TypeFinanceur,
} from "./criteria.ts";
export function affiliateAmount(cents: number, refunded: number, rate: number) {
  return Math.max(0, Math.floor(((cents - refunded) * rate) / 10000));
}
export function validColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}
export const factSchema = z.object({
  value: z.string().max(12000),
  source: z.string().max(200),
  confirmed: z.boolean(),
  kind: z.enum(["declared", "document", "hypothesis"]),
  quote: z.string().max(2000).optional(),
});
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

// Critères d'un financeur : listes fixes, montants en euros, détails limités aux champs de son type
const euros = z.number().int().min(0).max(1e10).nullable().optional();
export function criteriaInput(kind: string) {
  const champs = champsParType[kind as TypeFinanceur] || [];
  return z.object({
    sectors: z.array(z.enum(secteurs)).max(secteurs.length).default([]),
    stages: z.array(z.enum(stades)).max(stades.length).default([]),
    regions: z.array(z.enum(regions)).max(regions.length).default([]),
    ticketMin: euros,
    ticketMax: euros,
    exclusions: z.string().max(2000).default(""),
    questions: z.array(z.string().max(1000)).max(30).default([]),
    documents: z.array(z.string().max(300)).max(30).default([]),
    details: z
      .object(
        Object.fromEntries(
          champs.map((f) => [
            f.key,
            (f.type === "number"
              ? z.number().min(0).max(1e10)
              : f.type === "bool"
                ? z.boolean()
                : f.type === "choice"
                  ? z.enum(f.options as [string, ...string[]])
                  : f.type === "date"
                    ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
                    : z.string().max(2000)
            )
              .nullable()
              .optional(),
          ]),
        ),
      )
      .strip()
      .default({}),
  }).refine((c) => c.ticketMin == null || c.ticketMax == null || c.ticketMin <= c.ticketMax, {
    message: "Le ticket minimum est supérieur au ticket maximum",
    path: ["ticketMax"],
  });
}
