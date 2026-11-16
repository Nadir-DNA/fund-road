// FAQ des fiches : générée une seule fois, rendue à l'identique par le serveur et par le client.
import type { Program } from "./programs.ts";

export type QA = [string, string];

/** FAQ d'un programme public (critères vérifiés et sourcés). */
export function programFaq(prog: Program, name: string): QA[] {
  const conditions = prog.criteria.filter((c) => c.blocking).map((c) => c.label);
  const pieces = prog.criteria.filter((c) => !c.blocking);
  return [
    [`Quel est le montant de ${name} ?`, `${prog.amount}. ${prog.summary}`],
    [`Qui peut bénéficier de ${name} ?`, `Conditions à remplir : ${conditions.join(" ; ")}.`],
    ...(pieces.length
      ? [[`Que faut-il préparer pour demander ${name} ?`, pieces.map((c) => c.label).join(" ; ") + "."] as QA]
      : []),
    [`Qui gère ${name} ?`, `${prog.operator}. Critères vérifiés le ${prog.verifiedAt.split("-").reverse().join("/")}.`],
  ];
}

/** FAQ factuelle d'une fiche : uniquement des données déjà publiées, jamais de contenu inventé. */
export function profileFaq(
  name: string,
  r: { ticket?: string; stage?: string; geography?: string },
  applicationUrl?: string,
): QA[] {
  const q: QA[] = [];
  if (r.ticket) q.push([`Quel ticket propose ${name} ?`, `Ticket indiqué par ${name} : ${r.ticket}.`]);
  if (r.stage) q.push([`Quel stade vise ${name} ?`, `Stade indiqué par ${name} : ${r.stage}.`]);
  if (r.geography) q.push([`Où intervient ${name} ?`, `Zone couverte : ${r.geography}.`]);
  if (q.length < 2) return [];
  if (applicationUrl) q.push([`Comment candidater auprès de ${name} ?`, `Cette fiche indique une adresse de candidature officielle : ${applicationUrl}`]);
  return q;
}
