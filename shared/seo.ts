// Règles de titres et descriptions, partagées par le serveur (SSR) et le client (titres après navigation).
export function clipWords(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "").replace(/[\s,;:.–-]+$/, "");
}

/** Titre de fiche ≤ 60 caractères, marque conservée quand elle tient. */
export function profileTitle(name: string) {
  const options = [
    `${name} : critères, ticket et candidature | Fund Road`,
    `${name} : critères et ticket | Fund Road`,
    `${name} | Fund Road`,
    name,
  ];
  return options.find((x) => x.length <= 60) ?? clipWords(name, 57) + "…";
}

/** Description ≤ 155 caractères, en phrases complètes : on retire des précisions, on ne coupe jamais. */
export function profileDescription(parts: string[], tail = "Candidature sur Fund Road.", max = 155) {
  const chosen: string[] = [];
  for (const part of parts) {
    const text = [...chosen, part].join(" ");
    if ((text + " " + tail).length <= max) chosen.push(part);
    else break;
  }
  const base = chosen.join(" ");
  if ((base + " " + tail).length <= max) return `${base} ${tail}`;
  const name = parts[0] ?? "";
  return (name + " " + tail).length <= max ? `${name} ${tail}` : name;
}

/** Identifiant d'URL (fonds, programmes, titres). */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "financeur";

/** Les fiches d'aides (subventions, programmes publics) portent le lien vers le hub /aides. */
export const AID_KINDS = new Set(["grant"]);
export const showAidesLink = (kind?: string, hasProgram = false) => hasProgram || (!!kind && AID_KINDS.has(kind));
