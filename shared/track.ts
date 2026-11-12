// Mesure de l'entonnoir : cinq événements à noms fixes et SANS charge utile, et conservation des UTM dans l'URL.
// Logique pure, testée sans navigateur. Le pixel n'envoie que l'URL, le référent, la langue et le nom : rien d'autre.
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

/** Étapes de l'entonnoir. Liste fermée : aucun nom libre, aucune donnée de dossier, d'organisation ni de paiement. */
export const TRACK_EVENTS = [
  "compte_cree",      // le serveur a accepté l'inscription (compte créé ; l'e-mail reste à confirmer)
  "dossier_cree",     // le serveur a créé un dossier
  "analyse_ok",       // une analyse vue « en cours » est passée à « terminée » sur le serveur
  "checkout_ouvert",  // le serveur a ouvert une session de paiement : redirection vers Stripe
  "paiement_retour",      // arrivée sur la page de retour (success=1) : pas une confirmation, seul le webhook en fait foi
] as const;
export type TrackName = (typeof TRACK_EVENTS)[number];

export type Utm = Record<string, string>;

/** UTM d'une adresse : trois clés connues, valeur ≤ 100 caractères, caractères sûrs. */
export function parseUtm(search: string): Utm {
  const out: Utm = {};
  const q = new URLSearchParams(search);
  for (const k of UTM_KEYS) {
    const v = (q.get(k) ?? "").trim().slice(0, 100);
    if (v && /^[\p{L}\p{N} _.+~:-]+$/u.test(v)) out[k] = v;
  }
  return out;
}

/** Une campagne présente dans l'adresse remplace celle gardée ; sinon on garde celle de la visite en cours. */
export function pickUtm(search: string, kept: Utm | null): Utm | null {
  const found = parseUtm(search);
  return Object.keys(found).length ? found : kept && Object.keys(kept).length ? kept : null;
}

/** Ajoute les UTM à une adresse interne qui n'en a aucun ; sinon la rend telle quelle. */
export function withUtm(to: string, utm: Utm | null): string {
  if (!utm || !Object.keys(utm).length) return to;
  const u = new URL(to, "https://exemple.invalid");
  if (UTM_KEYS.some((k) => u.searchParams.has(k))) return to;
  for (const [k, v] of Object.entries(utm)) u.searchParams.set(k, v);
  return u.pathname + u.search + u.hash;
}
