// Branchement navigateur de shared/track.ts. Réutilise le pixel Searchtide déjà présent dans index.html :
// window.searchtide("nom") n'envoie que l'URL, le référent, la langue et le nom. Aucun cookie, aucune colonne.
// Sans le pixel (bloqueur, exclusion ?searchtide=ignore), tout ce fichier est sans effet et ne gêne jamais le parcours.
//
// Consentement : la campagne est gardée EN MÉMOIRE par défaut (de l'arrivée à l'inscription, dans la même page). Rien n'est écrit dans
// le navigateur avant que le visiteur ait accepté la mesure d'audience (choix « fundroad-cookies » = « oui », lu comme le fait le
// bandeau) ; après acceptation seulement, elle est aussi gardée dans sessionStorage (propre à l'onglet, effacé à sa fermeture).
import { pickUtm, withUtm, type TrackName, type Utm } from "../shared/track.ts";

const KEY = "fundroad-utm";
const CHOIX = "fundroad-cookies";   // même clé que le bandeau de consentement (app/main.tsx)
let kept: Utm | null = null;
const dejaVu = new Set<string>();

const accepte = () => { try { return localStorage.getItem(CHOIX) === "oui"; } catch { return false; } };

/** Écrit la campagne dans sessionStorage SI ET SEULEMENT SI la mesure a été acceptée ; sans effet sinon. */
export function persistUtm(): void {
  if (!kept || !accepte()) return;
  try { sessionStorage.setItem(KEY, JSON.stringify(kept)); } catch { /* stockage bloqué : mémoire seule */ }
}

/** À appeler une fois au démarrage : retient la campagne de l'adresse d'arrivée pour la visite en cours (mémoire d'abord). */
export function captureUtm(): void {
  if (accepte()) { try { kept = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { kept = null; } }
  kept = pickUtm(location.search, kept);
  persistUtm();
}

/** Aide de lien unique : garde utm_source/medium/campaign dans l'adresse des navigations vers /inscription et /app. */
export const keepUtm = (to: string): string => { persistUtm(); return withUtm(to, pickUtm(location.search, kept)); };

/** Vrai la première fois seulement (mémoire ; gardé aussi dans sessionStorage après acceptation). Sert à ne pas compter un rechargement. */
export function firstTime(name: string): boolean {
  const k = "fundroad-vu-" + name;
  if (dejaVu.has(k)) return false;
  if (accepte()) { try { if (sessionStorage.getItem(k)) { dejaVu.add(k); return false; } sessionStorage.setItem(k, "1"); } catch { /* mémoire seule */ } }
  dejaVu.add(k);
  return true;
}

/**
 * Événement d'entonnoir (nom fixe, aucune charge utile). Le pixel lit l'adresse courante : si une redirection serveur
 * (retour de Stripe) a fait perdre la campagne, elle est remise dans l'adresse avant l'envoi. replaceState n'est pas
 * intercepté par le pixel : aucune vue en double.
 */
export function track(name: TrackName): void {
  try {
    persistUtm();
    const send = (window as unknown as { searchtide?: (n: string) => void }).searchtide;
    if (typeof send !== "function") return;
    const here = location.pathname + location.search + location.hash;
    const withCampaign = withUtm(here, pickUtm(location.search, kept));
    if (withCampaign !== here) history.replaceState(history.state, "", withCampaign);
    send(name);
  } catch { /* la mesure ne doit jamais gêner le parcours */ }
}
