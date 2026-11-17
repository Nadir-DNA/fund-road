// Branchement navigateur de shared/track.ts. Le pixel Searchtide n'est JAMAIS chargé avant un accord explicite :
// après « Accepter » seulement, il est injecté et window.searchtide("nom") n'envoie que l'URL, le référent, la langue et
// le nom. Aucun cookie, aucune colonne. Sans le pixel (avant choix, refus, bloqueur, ?searchtide=ignore), tout ce
// fichier est sans effet et ne gêne jamais le parcours.
//
// Consentement : la campagne est gardée EN MÉMOIRE par défaut (de l'arrivée à l'inscription, dans la même page). Rien
// n'est écrit dans le navigateur avant que le visiteur ait accepté la mesure d'audience (choix « fundroad-cookies » =
// « oui ») ; après acceptation seulement, elle est aussi gardée dans sessionStorage (propre à l'onglet). Après un refus,
// le pixel est retiré et tout ce qui avait été gardé est effacé.
import { mesureAutorisee, pickUtm, withUtm, type TrackName, type Utm } from "../shared/track.ts";

const KEY = "fundroad-utm";
const CHOIX = "fundroad-cookies";   // même clé que le bandeau de consentement (app/main.tsx)
const SRC = "https://stats.nadirdaoudi.com/script.js";
const SRC_EXEMPT = "https://stats.nadirdaoudi.com/script.js?exempt=1";
const SITE = "fund-road.com";
let kept: Utm | null = null;
const dejaVu = new Set<string>();
let charge = false;
let refusee = false;

const choix = () => { try { return localStorage.getItem(CHOIX); } catch { return null; } };
const accepte = () => !refusee && mesureAutorisee(choix());

/**
 * Mesure d'audience exemptée de consentement (17/11) : chargée pour TOUS les visiteurs, avant tout choix.
 * Le script ne pose aucun cookie et n'écrit rien dans le navigateur (voir /script-exempt.js de l'instance) ;
 * il ne compte que la page et le domaine d'origine. Le pixel consenti ci-dessous reste séparé et étiqueté.
 */
export function chargerMesureExemptee(): void {
  if (document.querySelector("script[data-mesure-exempte]")) return;
  const s = document.createElement("script");
  s.src = SRC_EXEMPT;
  s.defer = true;
  s.dataset.site = SITE;
  s.dataset.mesureExempte = "1";   // marqueur interne : distinct du pixel consenti, jamais retiré par oublierMesure
  document.head.appendChild(s);
}

/** Injecte le pixel une seule fois, et seulement après un accord explicite. */
export function chargerMesure(): void {
  refusee = false;
  if (charge || !mesureAutorisee(choix())) return;
  charge = true;
  const s = document.createElement("script");
  s.src = SRC;
  s.defer = true;
  s.dataset.site = SITE;
  s.dataset.searchtideSite = "1";   // marqueur interne, pour pouvoir le retirer
  document.head.appendChild(s);
}

/** Après refus (ou retrait du choix) : retire le pixel et efface campagne et marqueurs de visite. */
export function oublierMesure(): void {
  refusee = true;
  charge = false;
  kept = null;
  dejaVu.clear();
  document.querySelectorAll("script[data-searchtide-site]").forEach((s) => s.remove());
  try {
    sessionStorage.removeItem(KEY);
    for (const k of Object.keys(sessionStorage))
      if (k.startsWith("fundroad-vu-")) sessionStorage.removeItem(k);
  } catch { /* stockage bloqué : rien à effacer */ }
}

/** Écrit la campagne dans sessionStorage SI ET SEULEMENT SI la mesure a été acceptée ; sans effet sinon. */
export function persistUtm(): void {
  if (!kept || !accepte()) return;
  try { sessionStorage.setItem(KEY, JSON.stringify(kept)); } catch { /* stockage bloqué : mémoire seule */ }
}

/** À appeler une fois au démarrage : retient la campagne de l'adresse d'arrivée pour la visite en cours (mémoire d'abord). */
export function captureUtm(): void {
  if (refusee) return;
  if (accepte()) { try { kept = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { kept = null; } }
  kept = pickUtm(location.search, kept);
  persistUtm();
}

/** Aide de lien unique : garde utm_source/medium/campaign dans l'adresse des navigations vers /inscription et /app. */
export const keepUtm = (to: string): string => { persistUtm(); return withUtm(to, pickUtm(location.search, kept)); };

/** Vrai la première fois seulement (mémoire ; gardé aussi dans sessionStorage après acceptation). Sert à ne pas compter un rechargement. */
export function firstTime(name: string): boolean {
  if (!accepte()) return false;
  const k = "fundroad-vu-" + name;
  if (dejaVu.has(k)) return false;
  try { if (sessionStorage.getItem(k)) { dejaVu.add(k); return false; } sessionStorage.setItem(k, "1"); } catch { /* mémoire seule */ }
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
    if (!accepte()) return;
    persistUtm();
    const send = (window as unknown as { searchtide?: (n: string) => void }).searchtide;
    if (typeof send !== "function") return;
    const here = location.pathname + location.search + location.hash;
    const withCampaign = withUtm(here, pickUtm(location.search, kept));
    if (withCampaign !== here) history.replaceState(history.state, "", withCampaign);
    send(name);
  } catch { /* la mesure ne doit jamais gêner le parcours */ }
}
