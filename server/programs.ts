import { db } from "./db.ts";
import {
  programs,
  findProgram,
  orgProgram,
  type Program,
} from "../shared/programs.ts";
// Financeurs inscrits ayant renseigné au moins un critère
export async function financerPrograms(): Promise<Program[]> {
  const rows = (
    await db.query(
      "SELECT id,name,kind,criteria FROM organizations WHERE kind<>'startup' AND criteria<>'{}'::jsonb ORDER BY name",
    )
  ).rows;
  return rows.map(orgProgram).filter((p) => p.criteria.length);
}
export async function resolvePrograms(ids: string[] = []): Promise<Program[]> {
  const orgs = ids.some((id) => id.startsWith("org:"))
    ? await financerPrograms()
    : [];
  return ids
    .map((id) => findProgram(id) || orgs.find((p) => p.id === id))
    .filter((p): p is Program => Boolean(p));
}
export const allPrograms = async () => [
  ...programs,
  ...(await financerPrograms()),
];
