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

/** Description ≤ 160 caractères, terminée par « Fund Road. » et coupée entre deux mots. */
export function profileDescription(head: string) {
  const max = 155, full = " avec Fund Road.", short = " Fund Road.";
  if ((head + full).length <= max) return head + full;
  if ((head + short).length <= max) return head + short;
  return clipWords(head, max - short.length - 1) + "…" + short;
}
