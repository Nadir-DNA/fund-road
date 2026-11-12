// Branchement navigateur de shared/track.ts. Réutilise le pixel Searchtide déjà présent dans index.html :
// window.searchtide("nom") n'envoie que l'URL, le référent, la langue et le nom. Aucun cookie, aucune colonne.
// Sans le pixel (bloqueur, exclusion ?searchtide=ignore), tout ce fichier est sans effet et ne gêne jamais le parcours.
import { parseUtm, pickUtm, withUtm, type TrackName, type Utm } from "../shared/track.ts";

const KEY = "fundroad-utm";   // sessionStorage : propre à l'onglet, effacé à sa fermeture
let kept: Utm | null = null;

/** À appeler une fois au démarrage : retient la campagne de l'adresse d'arrivée pour la visite en cours. */
export function captureUtm(): void {
  try { kept = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { kept = null; }
  kept = pickUtm(location.search, kept);
  try { if (kept) sessionStorage.setItem(KEY, JSON.stringify(kept)); } catch { /* stockage bloqué : mémoire seule */ }
}

/** Aide de lien unique : garde utm_source/medium/campaign dans l'adresse des navigations vers /inscription et /app. */
export const keepUtm = (to: string): string => withUtm(to, pickUtm(location.search, kept));

/**
 * Événement d'entonnoir (nom fixe, aucune charge utile). Le pixel lit l'adresse courante : si une redirection serveur
 * (retour de Stripe) a fait perdre la campagne, elle est remise dans l'adresse avant l'envoi. replaceState n'est pas
 * intercepté par le pixel : aucune vue en double.
 */
export function track(name: TrackName): void {
  try {
    const send = (window as unknown as { searchtide?: (n: string) => void }).searchtide;
    if (typeof send !== "function") return;
    const here = location.pathname + location.search + location.hash;
    const withCampaign = withUtm(here, pickUtm(location.search, kept));
    if (withCampaign !== here) history.replaceState(history.state, "", withCampaign);
    send(name);
  } catch { /* la mesure ne doit jamais gêner le parcours */ }
}

export { parseUtm };
