import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  createContext,
  useContext,
  type FormEvent,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
// L'espace connecté (Shell + pages) part dans un chunk à part : la vitrine ne le charge pas
const Shell = lazy(() =>
  import("./espace.tsx").then((m) => ({ default: m.Shell })),
);
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Link, NavLink, useNavigate } from "./links.tsx";
import { captureUtm, chargerMesure, chargerMesureExemptee, firstTime, keepUtm, oublierMesure, persistUtm, track } from "./track.ts";
import { editorial } from "../shared/editorial.generated.ts";
import { profileTitle, slugify, showAidesLink } from "../shared/seo.ts";
import { programs } from "../shared/programs.ts";
import { profileFaq, programFaq } from "../shared/faq.ts";
import {
  ArrowUpRight,
  Sun,
  Moon,
  ArrowRight,
  Check,
  ChevronRight,
  Plus,
  Upload,
  FileText,
  Sparkles,
  LayoutDashboard,
  FolderOpen,
  Send,
  Users,
  SlidersHorizontal,
  Building2,
  LogOut,
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  Clock,
  MessageSquare,
  Link2,
  Menu,
  X,
  CreditCard,
  Gift,
  Globe,
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  MapPin,
  Coins,
  Seedling,
} from "./icons";
import {
  requirements,
  score,
  niveaux,
  type DossierState,
  type Critique,
  type CritiqueRubrique,
  type NiveauRubrique,
} from "../shared/score";
import {
  champsParType,
  correspond,
  details,
  libelleCritere,
  regions,
  resume,
  secteurs,
  ticketAffiche,
  stades,
  types,
  type TypeFinanceur,
} from "../shared/criteria";
import {
  confirmationEnLot,
  csvPipeline,
  filtrerPipeline,
  filtrerProgrammes,
  libelleDroit,
  libelleJob,
  libelleRecompense,
  menuPour,
  ongletDepuisUrl,
  parametresOnglet,
  propositionsRelues,
  trierAnnuaire,
  trierPipeline,
  trierProgrammes,
  trisAnnuaire,
  trisPipeline,
  type TriAnnuaire,
  type TriPipeline,
} from "../shared/ui";
import "./fonts.css";
import "./style.css";
export // AI Act art. 50 : une information rédigée par l'IA et pas encore validée par la startup est signalée
const proposeParIA = (f: any) => Boolean(f && !f.confirmed && f.source !== "declaration");

export const etapes = (kind?: string) =>
  kind === "incubator" ? stageLabelsIncubateur : stageLabels;

export // Logo téléversé, sinon initiales sur la couleur du financeur
function OrgLogo({ o, size = "" }: { o: any; size?: string }) {
  const name = o.theme?.name || o.name;
  const [casse, setCasse] = useState(false);
  return o.logo && !casse ? (
    <img
      className={"org-logo " + size}
      src={`/api/${o.claimed === false ? "investors" : "organizations"}/${o.id}/logo?v=${o.logo.v}`}
      alt={"Logo " + name}
      width={size === "lg" ? 96 : 56}
      height={size === "lg" ? 96 : 56}
      loading={size === "lg" ? "eager" : "lazy"}
      decoding="async"
      onError={() => setCasse(true)}
    />
  ) : (
    <span className={"org-logo monogram " + size} aria-hidden="true">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

export const orgStyle = (o: any) =>
  (o.theme?.accent ? { "--org": o.theme.accent } : {}) as any;

export const chips = (text = "") =>
  text
    .split(/[,;·]| et /)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);

export const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? "s" : ""}`;

import { publicCopy, faq, pageMeta, financeursPage } from "../shared/content";
import {
  gsap,
  SplitText,
  useGsap,
  demarrerDefilement,
  revelerTitres,
  aimanter,
  allerA,
  remonter,
  entree,
} from "./motion";
export async function api(url: string, method = "GET", body?: any) {
  const r = await fetch("/api" + url, {
    method,
    credentials: "include",
    headers:
      body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  let data: any;
  try {
    data = await r.json();
  } catch {
    throw new Error("Réponse serveur illisible");
  }
  if (!r.ok) {
    const erreur: any = new Error(
      (r.status === 429 && "Trop de tentatives. Patientez quelques secondes puis réessayez.") ||
        messagesAuth[data.code] ||
        // erreurs de validation : le détail du champ plutôt que « Données invalides » seul
        (Array.isArray(data.details) &&
          data.details.map((d: string) => d.split(": ").slice(1).join(": ")).join(" · ")) ||
        data.error?.message ||
        data.error ||
        data.message ||
        "Action impossible",
    );
    // le statut sert à distinguer un quota épuisé (402) d'une autre erreur
    erreur.status = r.status;
    throw erreur;
  }
  return data;
}
// La bibliothèque d'authentification répond en anglais : messages traduits par code
const messagesAuth: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Adresse email ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse. Connectez-vous.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cette adresse. Connectez-vous.",
  PASSWORD_TOO_SHORT: "Mot de passe trop court : 12 caractères minimum.",
  PASSWORD_TOO_LONG: "Mot de passe trop long.",
  INVALID_EMAIL: "Adresse email invalide.",
  EMAIL_NOT_VERIFIED: "Confirmez d’abord votre adresse avec le lien reçu par email.",
  INVALID_TOKEN: "Lien expiré ou déjà utilisé. Refaites une demande.",
  INVALID_CODE: "Code incorrect.",
  INVALID_TWO_FACTOR_CODE: "Code incorrect.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
};
export function useLoad<T = any>(url: string, dep: any = 0) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState("");
  const precedente = useRef(url);
  useEffect(() => {
    let active = true;
    // un simple rafraîchissement garde l'affichage en place ; seul un changement d'adresse le vide
    if (precedente.current !== url) {
      precedente.current = url;
      setData(null);
    }
    setError("");
    api(url)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [url, dep]);
  return { data, error };
}
export const ToastContext = createContext<(message: string) => void>(() => {});
// Erreur d'action : affichée en haut de page, persistante, jamais en toast
const ErreurContext = createContext<(message: string) => void>(() => {});
// busy, erreur persistante du dernier formulaire, et succès en toast court
export function useAction() {
  const toast = useContext(ToastContext);
  const afficherErreur = useContext(ErreurContext);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  return {
    busy,
    erreur,
    run: async (fn: () => Promise<any>, success?: string) => {
      setBusy(true);
      setErreur("");
      afficherErreur("");
      try {
        const r = await fn();
        if (success) toast(success);
        return r;
      } catch (e: any) {
        // une erreur ne disparaît pas par minuterie : elle reste affichée
        const message = e.message || "L’action a échoué.";
        setErreur(message);
        afficherErreur(message);
        return null;
      } finally {
        setBusy(false);
      }
    },
  };
}
// Confirmation dans l'application, avec le nom de l'objet concerné
export function ConfirmDialog({
  texte,
  confirmer,
  onConfirm,
  onCancel,
  busy = false,
}: {
  texte: string;
  confirmer: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <div className="confirm-overlay" role="presentation" onClick={onCancel}>
      <div
        className="panel confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmation"
        onClick={(e) => e.stopPropagation()}
      >
        <p>{texte}</p>
        <div className="button-row">
          <button className="button secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="button danger" disabled={busy} onClick={onConfirm}>
            {confirmer}
          </button>
        </div>
      </div>
    </div>
  );
}
export const Logo = ({ light = false }: { light?: boolean }) => (
  <Link to="/" className={"logo" + (light ? " light" : "")}>
    <img
      src={
        light ? "/brand/fundroad-mark-white.png" : "/brand/fundroad-mark.png"
      }
      alt=""
      width={28}
      height={33}
    />
    {!light && (
      <img
        className="logo-nuit"
        src="/brand/fundroad-mark-white.png"
        alt=""
        width={28}
        height={33}
      />
    )}
    Fund Road
  </Link>
);
// Bascule clair / sombre ; sans choix enregistré, le site suit le réglage de l'appareil
export function BasculeTheme() {
  const sombre = () =>
    document.documentElement.dataset.theme === "dark" ||
    (!document.documentElement.dataset.theme &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  const [nuit, setNuit] = useState(sombre);
  return (
    <button
      className="iconbutton theme-toggle"
      aria-label={nuit ? "Passer en mode clair" : "Passer en mode sombre"}
      title={nuit ? "Mode clair" : "Mode sombre"}
      onClick={() => {
        const t = nuit ? "light" : "dark";
        document.documentElement.dataset.theme = t;
        try {
          localStorage.setItem("fundroad-theme", t);
        } catch {}
        setNuit(!nuit);
      }}
    >
      {nuit ? <Sun /> : <Moon />}
    </button>
  );
}
export const Badge = ({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) => <span className={"badge " + (good ? "good" : "")}>{children}</span>;
export const ErrorBox = ({ text }: { text: string }) =>
  text ? (
    <div role="alert" className="notice">
      <AlertCircle size={18} />
      {text}
    </div>
  ) : null;
export const Empty = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <div className="empty">
    <FolderOpen size={34} />
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);
const revealSelector =
  ".section-head, .tour-row, .feature, .band-night > div > *, .faq details, .cta-band > div, .cols > article, .price-card, .info-page h1, .lead";
function useReveal(enabled = true) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!enabled) return;
    const els = [...document.querySelectorAll<HTMLElement>(revealSelector)];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => {
      // décalage en cascade entre éléments frères
      el.style.setProperty(
        "--i",
        String([...(el.parentElement?.children || [])].indexOf(el)),
      );
      el.classList.add("reveal");
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname, enabled]);
}
export function PublicLayout({
  children,
  gsapPage = false,
  footer = true,
}: {
  children: ReactNode;
  gsapPage?: boolean;
  footer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useReveal(!gsapPage);
  useEffect(() => demarrerDefilement(), []);
  useEffect(() => {
    if (pageMeta[pathname]) document.title = pageMeta[pathname].title;
  }, [pathname]);
  return (
    <>
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>
      <header className="topnav">
        <div className="topnav-inner">
          <Logo light />
          <nav
            className={open ? "open" : ""}
            aria-label="Navigation principale"
            onClick={() => setOpen(false)}
          >
            <NavLink to="/entrepreneurs">Entrepreneurs</NavLink>
            <NavLink to="/financeurs">Financeurs</NavLink>
            <NavLink to="/referentiel">Le référentiel</NavLink>
            <NavLink to="/annuaire">Annuaire</NavLink>
            <NavLink to="/tarifs">Tarifs</NavLink>
          </nav>
          <div className="nav-actions">
            <BasculeTheme />
            <Link to="/connexion">Connexion</Link>
            <Link className="button small accent" data-searchtide="cta-entete-inscription" to="/inscription">
              Commencer
            </Link>
          </div>
          <button
            className="mobile-toggle iconbutton"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div id="contenu" tabIndex={-1} />
      {children}
      {footer && <footer>
        <div>
          <div>
            <Logo />
            <p>
              La plateforme qui transforme vos documents en dossier de
              financement sourcé, prêt à partager.
            </p>
          </div>
          <div>
            <h4>Produit</h4>
            <nav aria-label="Produit">
              <Link to="/entrepreneurs">Entrepreneurs</Link>
              <Link to="/financeurs">Financeurs</Link>
              <Link to="/marque-blanche">Marque blanche</Link>
              <Link to="/tarifs">Tarifs</Link>
            </nav>
          </div>
          <div>
            <h4>Ressources</h4>
            <nav aria-label="Ressources">
              <Link to="/referentiel">Le référentiel</Link>
              <Link to="/confiance">Vos données</Link>
              <Link to="/mentions-legales">Mentions légales</Link>
              <Link to="/cgv">CGV</Link>
              <Link to="/confidentialite">Confidentialité</Link>
              <Link to="/partenaires">Partenaires</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/ressources">Guides</Link>
            </nav>
          </div>
          <small>
            © {new Date().getFullYear()} Fund Road · La préparation d’un dossier
            ne garantit pas un financement. ·{" "}
            <button className="lien-cookies" onClick={revoirCookies}>
              Gérer les cookies
            </button>
          </small>
        </div>
      </footer>}
    </>
  );
}
// Route de la marque, dessinée et parcourue par animerVitrine
const Road = () => (
  <svg className="road" viewBox="0 0 600 560" fill="none" aria-hidden="true">
    <path
      className="edge"
      pathLength={1}
      d="M478 0C436 128 214 168 248 312S338 488 112 560"
      stroke="currentColor"
      strokeWidth="7"
    />
    <path
      className="edge"
      pathLength={1}
      d="M520 0C486 132 308 176 348 312S452 486 316 560"
      stroke="currentColor"
      strokeWidth="7"
    />
    <path
      className="lane"
      d="M499 0C461 130 261 172 298 312S395 487 214 560"
      stroke="currentColor"
      strokeWidth="4"
      strokeDasharray="18 16"
    />
    <circle className="car" r="11" cx="0" cy="0" />
  </svg>
);
// Chorégraphie partagée par les pages vitrines (accueil, financeurs) : mêmes classes, mêmes effets
function animerVitrine(reduce: boolean) {
  aimanter(".hero-actions .button");
  if (reduce) return;
  revelerTitres();
  // Entrée : titre mot à mot, coup de pinceau, route qui se dessine
  const titre = SplitText.create(".hero h1", {
    type: "words",
    mask: "words",
  });
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(titre.words, { yPercent: 115, duration: 1.1, stagger: 0.06 })
    .from(
      ".brush path",
      {
        scaleX: 0,
        transformOrigin: "0 50%",
        duration: 0.8,
        ease: "power3.inOut",
      },
      0.55,
    )
    .from(
      ".hero-copy > div > *",
      { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.1 },
      0.35,
    )
    .from(
      ".hero-points li",
      { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 },
      0.7,
    )
    .fromTo(
      ".road .edge",
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.inOut",
        stagger: 0.15,
      },
      0,
    )
    .from(".road .lane", { autoAlpha: 0, duration: 0.6 }, 1.4)
    .fromTo(
      ".road .car",
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.6 },
      1.5,
    )
    .from(".hero-shot", { y: 120, autoAlpha: 0, duration: 1.4 }, 0.45);
  // La voie centrale défile en continu
  gsap.to(".road .lane", {
    strokeDashoffset: -68,
    duration: 1.4,
    ease: "none",
    repeat: -1,
  });
  // Le véhicule part sous le titre et descend la route plus vite que la page ne défile
  const voie = {
    path: ".road .lane",
    align: ".road .lane",
    alignOrigin: [0.5, 0.5],
  };
  gsap.fromTo(
    ".road .car",
    { motionPath: { ...voie, start: 0.3, end: 0.3 } },
    {
      motionPath: { ...voie, start: 0.3, end: 0.97 },
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=320",
        scrub: 0.6,
      },
    },
  );
  // Capture du produit : se redresse en perspective au défilement
  gsap.fromTo(
    ".hero-shot img",
    { rotateX: 18, scale: 0.94 },
    {
      rotateX: 0,
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-shot",
        start: "top 95%",
        end: "top 25%",
        scrub: 0.8,
      },
    },
  );
  // Parcours : chaque capture se dévoile puis glisse légèrement
  gsap.utils.toArray<HTMLElement>(".tour-row").forEach((row, i) => {
    const shot = row.querySelector(".shot");
    entree(
      row.querySelectorAll(".step-pill, h3, p, li"),
      { y: 30 },
      {
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: row, start: "top 80%" },
      },
    );
    gsap.fromTo(
      shot,
      {
        clipPath:
          i % 2
            ? "inset(0 0 0 100% round 20px)"
            : "inset(0 100% 0 0 round 20px)",
      },
      {
        clipPath: "inset(0 0% 0 0% round 20px)",
        duration: 1.3,
        ease: "expo.inOut",
        scrollTrigger: { trigger: row, start: "top 75%" },
      },
    );
    gsap.fromTo(
      shot,
      { yPercent: 8 },
      {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
  // Fonctionnalités : cartes en cascade, compteur et jauge
  entree(
    ".feature",
    { y: 50 },
    {
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".features", start: "top 80%" },
    },
  );
  const n = { v: 0 };
  gsap.to(n, {
    v: 7,
    duration: 1.4,
    ease: "power2.out",
    onUpdate: () => {
      const el = document.querySelector(".mini-score .count");
      if (el) el.textContent = String(Math.round(n.v));
    },
    scrollTrigger: { trigger: ".mini-score", start: "top 85%" },
  });
  gsap.from(".feature .bar > span", {
    scaleX: 0,
    transformOrigin: "0 50%",
    duration: 1.4,
    ease: "power3.out",
    scrollTrigger: { trigger: ".feature .bar", start: "top 90%" },
  });
  // Bandeau financeurs et appel final
  entree(
    ".band-night li",
    { x: 60 },
    {
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ".band-night ul",
        start: "top 80%",
      },
    },
  );
  entree(
    ".faq details",
    { y: 24 },
    {
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: { trigger: ".faq", start: "top 85%" },
    },
  );
  gsap.fromTo(
    ".cta-band > div",
    { scale: 0.92, borderRadius: "48px" },
    {
      scale: 1,
      borderRadius: "24px",
      ease: "none",
      scrollTrigger: {
        trigger: ".cta-band",
        start: "top bottom",
        end: "top 40%",
        scrub: true,
      },
    },
  );
}
// D14 : preuve sociale factuelle, calculée à l'affichage depuis les données publiées.
// Aucun témoignage, logo ou chiffre inventé : sans données, la bande ne s'affiche pas.
function PreuveFactuelle() {
  const { data } = useLoad<any[]>("/directory");
  const financeurs = data?.length || 0;
  const programmes = programs.length;
  const dates = [
    ...programs.map((p) => p.verifiedAt),
    ...Object.values(editorial).map((p) => p.date),
  ]
    .filter(Boolean)
    .sort();
  const maj = dates.at(-1);
  if (!financeurs || !programmes) return null;
  return (
    <section className="preuve-factuelle" aria-label="Le référentiel en chiffres">
      <ul>
        <li>
          <strong>{financeurs}</strong> financeurs référencés
        </li>
        <li>
          <strong>{programmes}</strong> programmes et aides couverts
        </li>
        {maj && (
          <li>
            Référentiel vérifié le{" "}
            <time dateTime={maj}>{new Date(maj).toLocaleDateString("fr")}</time>
          </li>
        )}
      </ul>
      <p className="muted">
        Aucun témoignage pour l’instant : Fund Road n’a pas encore d’utilisateur
        réel. Nous n’en publierons qu’avec un accord écrit.
      </p>
    </section>
  );
}
function Landing() {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animerVitrine);
  return (
    <PublicLayout gsapPage>
      <main ref={ref} className="home">
        <section className="hero">
          <Road />
          <div className="hero-inner">
            <div className="hero-copy">
              <h1>
                Votre dossier de levée, prêt pour{" "}
                <span>
                  le comité.
                  <svg
                    className="brush"
                    viewBox="0 0 400 24"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 15C88 6 176 4 262 7c48 2 92 6 135 11-82-3-170-4-258 1C92 21 46 22 4 22Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </h1>
              <div>
                <p>
                  Déposez business plan, deck et prévisionnel. Fund Road
                  structure les neuf rubriques que demandent business angels et
                  fonds, cite chaque source et vous montre ce qui manque.
                </p>
                <div className="hero-actions">
                  <Link className="button accent" data-searchtide="cta-accueil-creer-dossier" to="/inscription">
                    Créer mon dossier <ArrowRight size={17} />
                  </Link>
                  <a
                    className="button ghost"
                    href="#fonctionnement"
                    onClick={(e) => {
                      e.preventDefault();
                      allerA("#fonctionnement");
                    }}
                  >
                    Voir comment ça marche
                  </a>
                </div>
              </div>
            </div>
            <ul className="hero-points">
              <li>
                <Check size={16} /> PDF, Word, PowerPoint, Excel
              </li>
              <li>
                <Check size={16} /> Chaque information citée depuis vos
                documents
              </li>
              <li>
                <Check size={16} /> Partage nominatif et révocable
              </li>
            </ul>
            <figure className="hero-shot">
              <img
                src="/screens/dossier.webp"
                width={1600}
                height={922}
                // React 18 ne connaît que l’attribut HTML en minuscules
                {...{ fetchpriority: "high" }}
                alt="Tableau de bord d’un dossier Fund Road : score de complétude, prochaines étapes et analyse IA"
              />
            </figure>
          </div>
        </section>
        <PreuveFactuelle />
        <section className="section" id="fonctionnement">
          <div className="section-head">
            <span className="kicker">Comment ça marche</span>
            <h2 data-split>
              De vos fichiers à un dossier complet, en trois étapes.
            </h2>
            <p>
              Vous partez de ce que vous avez déjà. Fund Road organise, vous
              validez.
            </p>
          </div>
          <div className="tour">
            {[
              {
                t: "Déposez vos documents",
                s: "Glissez votre business plan, votre deck ou votre prévisionnel. Le texte est extrait et l’IA range chaque information dans la bonne rubrique.",
                pts: [
                  "Formats PDF, Word, PowerPoint et Excel",
                  "Doublons détectés automatiquement",
                  "Vos fichiers restent privés",
                ],
                img: "/screens/documents.webp",
                alt: "Onglet Documents : fichiers déposés et leur statut d’extraction",
              },
              {
                t: "Validez ce que l’IA a trouvé",
                s: "Chaque proposition affiche la citation exacte de votre document. Vous confirmez, corrigez ou complétez. Les manques et les contradictions remontent en tête.",
                pts: [
                  "Citations vérifiées dans le texte source",
                  "Aucun chiffre inventé : l’inconnu reste « à compléter »",
                  "Score de complétude sur neuf rubriques",
                ],
                img: "/screens/facts.webp",
                alt: "Onglet Mon dossier : synthèse IA et rubrique avec sa citation source",
              },
              {
                t: "Partagez une version datée",
                s: "Choisissez le financeur, les pièces et les personnes autorisées. Exportez en PDF ou Word. Révoquez l’accès quand vous voulez.",
                pts: [
                  "Partage nominatif, pièce par pièce",
                  "Export PDF et Word avec les sources",
                  "Attestation de complétude datée",
                ],
                img: "/screens/share.webp",
                alt: "Onglet Partager : choix du destinataire et des pièces",
              },
            ].map((x, i) => (
              <div className="tour-row" key={x.t}>
                <div>
                  <span className="step-pill">{i + 1}</span>
                  <h3>{x.t}</h3>
                  <p>{x.s}</p>
                  <ul>
                    {x.pts.map((p) => (
                      <li key={p}>
                        <CheckCircle2 size={16} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <figure className="shot">
                  <img
                    src={x.img}
                    alt={x.alt}
                    width={1600}
                    height={1104}
                    loading="lazy"
                  />
                </figure>
              </div>
            ))}
          </div>
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <span className="kicker">Fonctionnalités</span>
            <h2 data-split>
              Tout ce qu’un financeur vérifie, au même endroit.
            </h2>
          </div>
          <div className="features">
            <article className="feature wide">
              <ShieldCheck />
              <h3>Un score de complétude explicable</h3>
              <p>
                Neuf rubriques : entreprise, équipe, problème, marché, modèle,
                traction, finances, besoin, utilisation des fonds. Vous savez
                exactement ce qui manque.
              </p>
              <div className="mini-score">
                <strong className="tnum">
                  <span className="count">7</span>/9
                </strong>
                <small>rubriques confirmées · exemple</small>
              </div>
              <div className="bar">
                <span style={{ width: "78%" }} />
              </div>
            </article>
            <article className="feature">
              <FileText />
              <h3>Sources citées</h3>
              <p>
                Chaque information renvoie au document et au passage exact dont
                elle provient.
              </p>
            </article>
            <article className="feature">
              <MessageSquare />
              <h3>Questions du financeur</h3>
              <p>
                Les critères et questions propres à chaque fonds s’ajoutent au
                tronc commun.
              </p>
            </article>
            <article className="feature">
              <Download />
              <h3>Exports PDF et Word</h3>
              <p>
                Un dossier propre, prêt à joindre à un email ou à un comité.
              </p>
            </article>
            <article className="feature">
              <Link2 />
              <h3>Partage révocable</h3>
              <p>Lien nominatif, pièces choisies, accès coupé en un clic.</p>
            </article>
          </div>
        </section>
        <section className="band-night">
          <div>
            <div>
              <span className="kicker">Pour les financeurs</span>
              <h2 data-split>Des dossiers comparables, sourcés, à jour.</h2>
              <p>
                Business angels, réseaux, fonds et incubateurs : recevez des
                candidatures structurées selon vos critères et suivez
                l’avancement de chaque startup. Gratuit pendant le lancement.
              </p>
              <Link className="button accent" to="/financeurs">
                Découvrir l’espace financeur <ArrowUpRight size={17} />
              </Link>
            </div>
            <ul>
              <li>
                <SlidersHorizontal size={20} />
                <span>
                  <strong>Vos critères</strong>
                  Thèse, secteur, stade, géographie, ticket et questions
                  spécifiques.
                </span>
              </li>
              <li>
                <Users size={20} />
                <span>
                  <strong>Invitez les startups</strong>
                  Créez un dossier et faites-le compléter, sans exposer le reste
                  de votre organisation.
                </span>
              </li>
              <li>
                <ShieldCheck size={20} />
                <span>
                  <strong>Notes privées</strong>
                  Vos analyses restent séparées des échanges avec la startup.
                </span>
              </li>
            </ul>
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <span className="kicker">Questions fréquentes</span>
            <h2 data-split>Avant de commencer.</h2>
          </div>
          <div className="faq">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="section home-aides">
          <div className="section-head">
            <span className="kicker">Aides publiques</span>
            <h2>Quel dispositif pour quel stade ?</h2>
          </div>
          <ul className="home-aides-list">
            <li><Link to="/aides">Toutes les aides publiques</Link></li>
            <li><Link to="/fonds/bourse-french-tech">Bourse French Tech</Link></li>
            <li><Link to="/fonds/eic-accelerator">EIC Accelerator</Link></li>
            <li><Link to="/fonds/concours-i-lab">Concours i-Lab</Link></li>
            <li><Link to="/aides/subventions-bpifrance">Subventions Bpifrance</Link></li>
          </ul>
        </section>
        <section className="cta-band">
          <div>
            <h2 data-split>
              Votre copilote pour construire, structurer et financer votre
              startup.
            </h2>
            <Link className="button accent" to="/inscription">
              Créer mon dossier <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
function Resources() {
  const { data, error } = useLoad<any[]>("/resources");
  return (
    <PublicLayout>
      <main className="section info-page">
        <h1>Préparer un dossier plus clair</h1>
        <p className="lead">
          Des contenus relus pour comprendre les pièces, les chiffres et les
          étapes du financement.
        </p>
        <ErrorBox text={error} />
        {data?.length ? (
          data.map((page) => (
            <Link
              className="dossier-card"
              key={page.slug}
              to={"/ressources/" + page.slug}
            >
              <h2>{page.title}</h2>
              <p>{page.excerpt}</p>
              <span>Lire la ressource →</span>
            </Link>
          ))
        ) : (
          <div className="panel">
            <h2>Les ressources sont en cours de revue</h2>
            <p>Vous pouvez déjà consulter les critères du dossier commun.</p>
            <Link to="/referentiel">Comprendre le référentiel →</Link>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
function ResourcePage() {
  const { slug } = useParams();
  const { data: page, error } = useLoad("/resources/" + slug);
  return (
    <PublicLayout>
      <main className="section info-page">
        <Link to="/ressources">← Toutes les ressources</Link>
        <ErrorBox text={error} />
        {page && (
          <>
            <h1>{page.title}</h1>
            <p className="lead">{page.excerpt}</p>
            <article className="panel preline">{page.body}</article>
            <p>
              <a href={page.source_url} target="_blank" rel="noreferrer">
                Consulter la source
              </a>{" "}
              · Publié le {new Date(page.published_at).toLocaleDateString("fr")}
            </p>
          </>
        )}
      </main>
    </PublicLayout>
  );
}
function FinanceursPage() {
  const ref = useRef<HTMLElement>(null);
  useGsap(ref, animerVitrine);
  const f = financeursPage;
  return (
    <PublicLayout gsapPage>
      <main ref={ref} className="home">
        <section className="hero">
          <Road />
          <div className="hero-inner">
            <div className="hero-copy">
              <h1>{f.title}</h1>
              <div>
                <p>{f.intro}</p>
                <div className="hero-actions">
                  <Link className="button accent" data-searchtide="cta-financeurs-inscription" to="/inscription?profil=financeur">
                    Créer mon espace financeur <ArrowRight size={17} />
                  </Link>
                  <Link className="button ghost" to="/annuaire">
                    Voir l’annuaire
                  </Link>
                </div>
              </div>
            </div>
            <ul className="hero-points">
              {f.points.map((p) => (
                <li key={p}>
                  <Check size={16} /> {p}
                </li>
              ))}
            </ul>
            <figure className="hero-shot">
              <img
                src="/screens/pipeline.webp"
                width={1600}
                height={956}
                {...{ fetchpriority: "high" }}
                alt="Tableau de suivi d’un fonds sur Fund Road : startups suivies, complétude moyenne, adéquation aux critères et étapes"
              />
            </figure>
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <span className="kicker">Comment ça marche</span>
            <h2 data-split>
              Vos critères en entrée, des dossiers comparables en sortie.
            </h2>
          </div>
          <div className="tour">
            {f.steps.map((x, i) => (
              <div className="tour-row" key={x.t}>
                <div>
                  <span className="step-pill">{i + 1}</span>
                  <h3>{x.t}</h3>
                  <p>{x.s}</p>
                  <ul>
                    {x.pts.map((p) => (
                      <li key={p}>
                        <CheckCircle2 size={16} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <figure className="shot">
                  <img
                    src={x.img}
                    alt={x.alt}
                    width={1600}
                    height={x.h}
                    loading="lazy"
                  />
                </figure>
              </div>
            ))}
          </div>
        </section>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <span className="kicker">Pourquoi Fund Road</span>
            <h2 data-split>Pensé pour la façon dont vous investissez.</h2>
          </div>
          <div className="features four">
            {f.features.map(([t, d], i) => (
              <article className="feature" key={t}>
                {[<ShieldCheck />, <Users />, <Globe />, <CheckCircle2 />][i]}
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <span className="kicker">Questions fréquentes</span>
            <h2 data-split>Ce que les financeurs nous demandent.</h2>
          </div>
          <div className="faq">
            {f.faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="cta-band">
          <div>
            <h2 data-split>Recevez votre prochain dossier déjà vérifié.</h2>
            <Link className="button accent" to="/inscription?profil=financeur">
              Créer mon espace financeur <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
function InfoPage() {
  const key = useLocation().pathname.slice(1),
    p = publicCopy[key];
  if (p.legal)
    return (
      <PublicLayout>
        <main className="section info-page legal">
          <h1>{p.title}</h1>
          <p className="lead">{p.intro}</p>
          {p.items.map(([t, s]) => (
            <section key={t}>
              <h2>{t}</h2>
              <p>{s}</p>
            </section>
          ))}
        </main>
      </PublicLayout>
    );
  return (
    <PublicLayout>
      <main className="section info-page">
        <h1>{p.title}</h1>
        <p className="lead">{p.intro}</p>
        <div className="cols">
          {p.items.map(([t, s], i) => (
            <article key={t}>
              <span className="ordinal">{i + 1}.</span>
              <h3>{t}</h3>
              <p>{s}</p>
            </article>
          ))}
        </div>
        <Link to="/inscription" className="button">
          Créer mon espace <ArrowRight size={17} />
        </Link>
      </main>
    </PublicLayout>
  );
}
function Pricing() {
  const { data, error } = useLoad<any[]>("/offers");
  const dossier = data?.find((p) => p.id === "dossier");
  // offre Découverte et accès financeurs : gratuits, donc hors Stripe
  const cards = [
    {
      badge: "Startups",
      label: "Découverte",
      price: "0 €",
      unit: "",
      includes: "",
      features: [
        "Dossier de financement complet, envoi aux financeurs",
        "Dépôt de vos pièces",
        "Annuaire des financeurs",
        "Une analyse IA offerte chaque mois",
        "Partages révocables et suivi des étapes",
      ],
      cta: "Commencer gratuitement",
    },
    {
      badge: "Startups",
      label: "Offre complète",
      price: dossier ? dossier.price_cents / 100 + " €" : "—",
      unit: " / 90 jours, résiliable",
      // seuls les exports changent de camp : révocation et suivi restent gratuits (12/11)
      includes: "Tout Découverte, plus :",
      features: ["Exports PDF et Word de vos dossiers"],
      cta: dossier?.active ? "Choisir" : "Ouverture prochaine",
      featured: true,
    },
    {
      badge: "Financeurs",
      label: "Fonds, business angels, incubateurs",
      price: "0 €",
      unit: " pendant le lancement",
      includes: "",
      features: [
        "Suivi de vos startups et de leur complétude",
        "Vos critères, questions et pièces demandées",
        "Adéquation calculée à chaque dossier reçu",
        "Notes privées d’équipe",
      ],
      cta: "Créer mon espace",
      to: "/inscription?profil=financeur",
    },
  ];
  return (
    <PublicLayout>
      <main className="section info-page">
        <h1>Un prix simple, selon votre rôle</h1>
        <p className="lead">
          Les startups commencent gratuitement : dossier complet, envoi aux
          financeurs et suivi. L’offre complète ajoute les exports PDF et Word,
          à 149 € tous les 90 jours, résiliable. Les financeurs et incubateurs
          sont gratuits pendant le lancement.
        </p>
        <ErrorBox text={error} />
        <div className="pricing-grid">
          {cards.map((p) => (
            <article
              className={"price-card" + (p.featured ? " featured" : "")}
              key={p.label}
            >
              <Badge good={p.badge === "Startups"}>{p.badge}</Badge>
              <h3>{p.label}</h3>
              <div className="price tnum">
                {p.price}
                <small>{p.unit}</small>
              </div>
              {p.includes && <p className="muted">{p.includes}</p>}
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    <Check size={16} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                className={"button" + (p.featured ? "" : " secondary")}
                data-searchtide="cta-tarifs-inscription"
                to={p.to || "/inscription"}
              >
                {p.cta} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        <p className="muted">
          Le partage d’un dossier exige les neuf rubriques confirmées, sans
          contradiction ; les rubriques manquantes sont listées dans
          l’application.
        </p>
        <p className="muted">
          Paiement par carte. L’offre complète est à 149 € tous les 90 jours,
          renouvellement automatique, résiliable à tout moment ; à l’expiration,
          vos dossiers restent accessibles et partageables, seuls les exports
          sont désactivés.
        </p>
        <p className="muted">
          Aucune commission sur les levées ni sur les subventions obtenues.
          TVA non applicable, article 293 B du CGI.{" "}
          <Link to="/cgv">Conditions générales de vente</Link>
        </p>
      </main>
    </PublicLayout>
  );
}
export const profilInscription = () => {
  try {
    return localStorage.getItem("fundroad-profil") || "startup";
  } catch {
    return "startup";
  }
};
// Jeton d'une invitation ouverte avant d'avoir un compte : conservé le temps de s'inscrire,
// y compris dans l'onglet ouvert par le lien de confirmation de l'email
const CLE_INVITATION = "fundroad-invitation";
const apresConnexion = () => {
  try {
    const t = localStorage.getItem(CLE_INVITATION);
    return t && /^[a-f0-9]{64}$/.test(t) ? "/invitation/" + t : "/app";
  } catch {
    return "/app";
  }
};
function AuthPage() {
  const location = useLocation(),
    signup = location.pathname === "/inscription",
    navigate = useNavigate();
  useEffect(() => { if (signup && firstTime("inscription-commencee")) track("inscription_commencee"); }, [signup]);
  // arrivée depuis la page Financeurs : type d'organisation présélectionné ensuite.
  // localStorage : le lien de confirmation de l'email s'ouvre dans un autre onglet.
  // Une inscription sans ?profil efface un choix ancien.
  useEffect(() => {
    if (!signup) return;
    try {
      if (new URLSearchParams(location.search).get("profil") === "financeur")
        localStorage.setItem("fundroad-profil", "fund");
      else localStorage.removeItem("fundroad-profil");
    } catch {}
  }, [signup, location.search]);
  const { data: cfg } = useLoad("/config");
  const googleAuth = Boolean((cfg as any)?.googleAuth);
  const { run, busy } = useAction();
  const [error, setError] = useState("");
  // adresse à confirmer : pas de session tant que le lien reçu par email n'est pas ouvert
  const [aConfirmer, setAConfirmer] = useState("");
  // Envoi du lien de confirmation : « cours » → « ok » ou « echec » (visible), renvoi possible (limité en débit par le serveur)
  const [envoi, setEnvoi] = useState<"" | "cours" | "ok" | "echec">("");
  const [messageEnvoi, setMessageEnvoi] = useState("");
  const [nonConfirme, setNonConfirme] = useState("");
  async function envoyerLien(email: string) {
    setEnvoi("cours");
    setMessageEnvoi("");
    try {
      await api("/auth/send-verification-email", "POST", { email, callbackURL: keepUtm("/app") });
      setEnvoi("ok");
    } catch (e: any) {
      setEnvoi("echec");
      setMessageEnvoi(
        String(e?.message || "").startsWith("Trop de tentatives")
          ? e.message
          : "E-mail non envoyé. Réessayez dans un instant ou écrivez à contact@fund-road.com.",
      );
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    const result = await run(async () => {
      // Une session déjà ouverte (autre compte) ferait échouer le renvoi du lien de confirmation
      // avec « Email mismatch » : on la ferme avant de créer le compte demandé.
      if (signup) await api("/auth/sign-out", "POST", {}).catch(() => {});
      let r;
      try {
        r = await api(
          signup ? "/auth/sign-up/email" : "/auth/sign-in/email",
          "POST",
          {
            name: f.get("name"),
            email: f.get("email"),
            password: f.get("password"),
            // le jeton d'invitation survit à la confirmation de l'e-mail
            ...(signup && { callbackURL: keepUtm(apresConnexion()) }),
          },
        );
      } catch (err: any) {
        // Connexion avant confirmation : on propose de renvoyer le lien plutôt qu'une impasse
        if (!signup && err?.message === messagesAuth.EMAIL_NOT_VERIFIED) setNonConfirme(String(f.get("email")));
        throw err;
      }
      if (signup) track("compte_cree");   // après la réponse de succès du serveur
      if (signup && !r.token) {
        setAConfirmer(String(f.get("email")));
        void envoyerLien(String(f.get("email")));
        return null;
      }
      if (r.twoFactorRedirect) {
        navigate("/double-auth");
        return null;
      }
      return r;
    });
    if (result) navigate(apresConnexion());
  }
  return (
    <PublicLayout>
      <main className="auth-wrap">
        <div className="auth-intro">
          <h1>Votre prochain chapitre commence ici</h1>
          <p>Un espace pour vos documents, vos réponses et vos candidatures.</p>
          <div className="auth-detail">
            <ShieldCheck />
            <span>
              Vos documents restent privés tant que vous ne les partagez pas.
            </span>
          </div>
        </div>
        {aConfirmer ? (
          <div className="auth-card" role="status">
            <Badge>Dernière étape</Badge>
            <h2>Vérifiez votre boîte mail</h2>
            {envoi === "echec" ? (
              <p role="alert">
                {messageEnvoi} Votre compte est créé : renvoyez le lien pour
                l’activer.
              </p>
            ) : (
              <p>
                {envoi === "cours" ? "Envoi du lien de confirmation à " : "Un lien de confirmation vient d’être envoyé à "}
                <strong>{aConfirmer}</strong>. Ouvrez-le pour activer votre
                compte : vous serez connecté directement.
              </p>
            )}
            <p className="smalltext">
              Rien reçu ? Regardez dans les indésirables, renvoyez le lien, ou
              écrivez à contact@fund-road.com.
            </p>
            <button
              type="button"
              className="button secondary"
              disabled={envoi === "cours"}
              onClick={() => void envoyerLien(aConfirmer)}
            >
              Renvoyer le lien
            </button>
          </div>
        ) : (
        <form className="auth-card" onSubmit={submit}>
          <Badge>
            {signup ? "Bienvenue sur Fund Road" : "Heureux de vous retrouver"}
          </Badge>
          <h2>{signup ? "Créer votre compte" : "Se connecter"}</h2>
          {nonConfirme && (
            <p role="status" className="smalltext">
              Votre adresse n’est pas encore confirmée.{" "}
              <button
                type="button"
                className="button small ghost"
                onClick={() => {
                  setAConfirmer(nonConfirme);
                  setNonConfirme("");
                  void envoyerLien(nonConfirme);
                }}
              >
                Renvoyer le lien de confirmation
              </button>
            </p>
          )}
          {signup && (
            <label>
              Votre nom
              <input name="name" required autoComplete="name" />
            </label>
          )}
          <label>
            Adresse email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Mot de passe
            <input
              name="password"
              type="password"
              minLength={12}
              required
              autoComplete={signup ? "new-password" : "current-password"}
            />
            <small>12 caractères minimum.</small>
          </label>
          <ErrorBox text={error} />
          <button className="button" disabled={busy}>
            {busy ? "Connexion…" : signup ? "Créer mon compte" : "Se connecter"}
            <ArrowRight size={17} />
          </button>
          {signup && (
            <p className="muted">
              En créant un compte, vous acceptez les{" "}
              <Link to="/cgv">conditions générales</Link> et la{" "}
              <Link to="/confidentialite">politique de confidentialité</Link>.
            </p>
          )}
          {/* le bouton Google n'apparaît que si les identifiants OAuth sont configurés */}
          {googleAuth && (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const r = await api("/auth/sign-in/social", "POST", {
                    provider: "google",
                    callbackURL: apresConnexion(),
                  });
                  if (r?.url) window.location.assign(r.url);
                })
              }
            >
              Continuer avec Google
            </button>
          )}
          <p>
            {signup ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
            <Link to={signup ? "/connexion" : "/inscription"}>
              {signup ? "Connexion" : "Créer un compte"}
            </Link>
          </p>
          <Link className="muted" to="/mot-de-passe">
            Mot de passe oublié
          </Link>
        </form>
        )}
      </main>
    </PublicLayout>
  );
}
function PasswordPage() {
  const { run, busy } = useAction();
  const { data: cfg } = useLoad("/config");
  const reset = new URLSearchParams(useLocation().search).get("token");
  return (
    <PublicLayout>
      <form
        className="auth-card standalone"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(
            () =>
              reset
                ? api("/auth/reset-password", "POST", {
                    token: reset,
                    newPassword: f.get("password"),
                  })
                : api("/auth/request-password-reset", "POST", {
                    email: f.get("email"),
                    redirectTo: window.location.origin + "/mot-de-passe",
                  }),
            "Demande traitée. Consultez votre boîte email ou connectez-vous.",
          );
        }}
      >
        <h2>{reset ? "Nouveau mot de passe" : "Récupérer votre accès"}</h2>
        {reset ? (
          <label>
            Nouveau mot de passe
            <input type="password" name="password" required minLength={12} />
          </label>
        ) : (
          <label>
            Email
            <input type="email" name="email" required />
          </label>
        )}
        {!reset && cfg && !cfg.mailReady && (
          <p className="notice">
            L’envoi d’emails n’est pas encore disponible. Écrivez à
            contact@fund-road.com depuis l’adresse de votre compte : nous
            rétablirons votre accès.
          </p>
        )}
        <button className="button" disabled={busy || (!reset && cfg && !cfg.mailReady)}>
          Continuer
        </button>
      </form>
    </PublicLayout>
  );
}
type Workspace = { me: any; org: any; refresh: () => void };
export const WorkspaceContext = createContext<Workspace>(null as any);
// Icônes des entrées de menu ; la liste et les libellés viennent de shared/ui.ts
export const iconesMenu: Record<string, typeof LayoutDashboard> = {
  "/app": LayoutDashboard,
  "/app/dossiers": FolderOpen,
  "/app/candidatures": Send,
  "/app/annuaire": Search,
  "/app/portail": Building2,
  "/app/partenaires": Gift,
  "/app/facturation": CreditCard,
  "/app/securite": ShieldCheck,
};
// Alerte de fin d'analyse : vue par la startup ou pas encore (aucune dépendance à l'e-mail)
export const CLE_ANALYSE = "fundroad-analyse-vue";
// Parcourt un dossier glissé-déposé (et ses sous-dossiers) ; readEntries rend les fichiers par lots
export async function fichiersDuDepot(items: DataTransferItemList) {
  const lire = async (entry: any): Promise<File[]> => {
    if (entry.isFile)
      return [await new Promise<File>((ok, ko) => entry.file(ok, ko))];
    if (!entry.isDirectory) return [];
    const lecteur = entry.createReader();
    const enfants: any[] = [];
    for (;;) {
      const lot: any[] = await new Promise((ok, ko) =>
        lecteur.readEntries(ok, ko),
      );
      if (!lot.length) break;
      enfants.push(...lot);
    }
    return (await Promise.all(enfants.map(lire))).flat();
  };
  const entrees = [...items]
    .map((i) => (i as any).webkitGetAsEntry?.())
    .filter(Boolean);
  return (await Promise.all(entrees.map(lire))).flat();
}
// Durée habituelle d'une analyse : sert à estimer la progression, l'IA ne donnant pas d'avancement
export const DUREE_ANALYSE = 150;
export const verdicts: Record<string, [string, string, string]> = {
  eligible: [
    "good",
    "Éligible a priori",
    "Tous les critères connus sont remplis.",
  ],
  eligible_missing_pieces: [
    "warn",
    "Critères remplis, pièces à compléter",
    "Les conditions d’éligibilité sont remplies ; il manque des éléments du dossier.",
  ],
  incomplete: [
    "warn",
    "Informations manquantes pour conclure",
    "Certains critères d’éligibilité ne peuvent pas encore être vérifiés.",
  ],
  ineligible: [
    "bad",
    "Non éligible en l’état",
    "Au moins un critère bloquant n’est pas rempli.",
  ],
};
export function Directory({ embedded = false }: { embedded?: boolean }) {
  const { data, error } = useLoad<any[]>("/directory");
  const [search, setSearch] = useState("");
  const [tri, setTri] = useState<TriAnnuaire>("nom");
  const [f, setF] = useState({ type: "", secteur: "", stade: "", region: "" });
  const filtres = data?.filter(
    (o) =>
      [
        o.theme.name || o.name,
        resume(o.criteria).sectors,
        resume(o.criteria).geography,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!f.type || o.kind === f.type) &&
      correspond(o.criteria, f),
  );
  // secteur choisi : les spécialistes de ce secteur avant les généralistes (tri stable)
  if (f.secteur && filtres)
    filtres.sort(
      (a, b) =>
        Number(!(a.criteria?.sectors || []).includes(f.secteur)) -
        Number(!(b.criteria?.sectors || []).includes(f.secteur)),
    );
  // le tri choisi ne classe jamais un ticket inconnu à 0
  const rows = filtres && trierAnnuaire(filtres, tri);
  const filtre = (
    key: keyof typeof f,
    label: string,
    options: Record<string, string>,
  ) => (
    <select
      aria-label={label}
      value={f[key]}
      onChange={(e) => setF({ ...f, [key]: e.target.value })}
    >
      <option value="">{label}</option>
      {Object.entries(options).map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
  );
  const parNom = (xs: readonly string[]) =>
    Object.fromEntries(xs.map((x) => [x, x]));
  const body = (
    <>
      <div className="page-heading">
        <div>
          <h1>
            À chaque ambition,
            <br />
            son financement.
          </h1>
          <p>
            Business angels, fonds, réseaux et incubateurs inscrits sur Fund
            Road, avec leurs critères et les pièces qu’ils demandent.
          </p>
        </div>
      </div>
      <div className="search-box">
        <Search size={18} />
        <input
          aria-label="Rechercher un financeur"
          placeholder="Nom, secteur ou géographie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filtres">
        {filtre("type", "Tous les types", types)}
        {filtre("secteur", "Tous les secteurs", parNom(secteurs))}
        {filtre("stade", "Tous les stades", parNom(stades))}
        {filtre("region", "Toutes les régions", parNom(regions))}
        <select
          aria-label="Trier les financeurs"
          value={tri}
          onChange={(e) => setTri(e.target.value as TriAnnuaire)}
        >
          {trisAnnuaire.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </div>
      <ErrorBox text={error} />
      {rows && (
        <p className="muted resultat-count">
          {plural(rows.length, "financeur")} pour cette recherche
        </p>
      )}
      {!rows?.length ? (
        <div className="panel">
          <Empty title="Aucun financeur pour cette recherche">
            Les financeurs apparaissent ici dès qu’ils publient leurs critères.
          </Empty>
        </div>
      ) : (
        <div className="fund-grid">
          {rows.map((o) => (
            <article className="fund-card" key={o.id} style={orgStyle(o)}>
              <div className="fund-body">
                <header className="fund-head">
                  <OrgLogo o={o} />
                  <div>
                    <span className="fund-kind">
                      {orgKindLabels[o.kind] || "Financeur"}
                    </span>
                    <h3>{o.theme.name || o.name}</h3>
                  </div>
                </header>
                {o.theme.intro && <p className="fund-intro">{o.theme.intro}</p>}
                <dl className="fund-facts">
                  <div>
                    <dt>
                      <Coins size={13} /> Ticket
                    </dt>
                    <dd>{ticketAffiche(o.criteria)}</dd>
                  </div>
                  <div>
                    <dt>
                      <MapPin size={13} /> Zone
                    </dt>
                    <dd>{resume(o.criteria).geography || "Non précisée"}</dd>
                  </div>
                </dl>
                <div className="chips">
                  {chips(resume(o.criteria).sectors).map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                  {resume(o.criteria).stage && (
                    <span className="stage">
                      <Seedling size={11} />{" "}
                      {chips(resume(o.criteria).stage)[0]}
                    </span>
                  )}
                </div>
                <div className="fund-foot">
                  <small>
                    <span>
                      <FileText size={13} />{" "}
                      {plural((o.criteria.documents || []).length, "pièce")}
                    </span>
                    <span>
                      <MessageSquare size={13} />{" "}
                      {plural((o.criteria.questions || []).length, "question")}
                    </span>
                  </small>
                  <Link to={"/fonds/" + o.slug}>
                    Voir et postuler <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
  return embedded ? (
    body
  ) : (
    <PublicLayout>
      <main className="section">{body}</main>
    </PublicLayout>
  );
}
export const stageLabels: Record<string, string> = {
  new: "Nouveau",
  review: "En revue",
  meeting: "Rendez-vous",
  diligence: "Due diligence",
  invested: "En portefeuille",
  declined: "Refusé",
};
// Un incubateur sélectionne et accompagne : mêmes étapes enregistrées, autres mots
export const stageLabelsIncubateur: Record<string, string> = {
  new: "Candidature",
  review: "En sélection",
  meeting: "Entretien",
  diligence: "Comité",
  invested: "En programme",
  declined: "Non retenu",
};
export const orgKindLabels: Record<string, string> = {
  angel: "Business angel",
  fund: "Fonds",
  network: "Réseau de BA",
  grant: "Organisme public",
  incubator: "Incubateur",
};
function TwoFactor() {
  const { run, busy } = useAction();
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <form
        className="auth-card standalone"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(async () => {
            await api("/auth/two-factor/verify-totp", "POST", {
              code: f.get("code"),
            });
            navigate(apresConnexion());
          });
        }}
      >
        <h2>Vérifier votre identité</h2>
        <label>
          Code de votre application
          <input name="code" inputMode="numeric" pattern="[0-9]{6}" required />
        </label>
        <button className="button" disabled={busy}>
          Vérifier
        </button>
      </form>
    </PublicLayout>
  );
}
function Verification() {
  const { id } = useParams();
  const { data: a, error } = useLoad("/attestations/" + id);
  return (
    <PublicLayout>
      <main className="section">
        <div className="panel verification">
          <ShieldCheck size={40} />
          <h1>
            {a?.revoked_at ? "Attestation révoquée" : "Attestation Fund Road"}
          </h1>
          <ErrorBox text={error} />
          {a && (
            <>
              <p>{a.label}</p>
              <dl>
                <dt>Référentiel</dt>
                <dd>{a.reference}</dd>
                <dt>Version examinée</dt>
                <dd>{a.revision}</dd>
                <dt>Date</dt>
                <dd>{new Date(a.created_at).toLocaleDateString("fr")}</dd>
                <dt>État</dt>
                <dd>
                  {a.revoked_at
                    ? "Révoquée"
                    : a.revision !== a.current_revision
                      ? "Une version plus récente existe"
                      : "Version actuelle"}
                </dd>
              </dl>
              <p className="notice">{a.limitation}</p>
            </>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
function Editorial() {
  const path = useLocation().pathname.replace(/\/$/, "") || "/";
  const e = editorial[path];
  useEffect(() => {
    if (e) document.title = e.title;
  }, [e]);
  if (!e) return <Portal />;
  return (
    <PublicLayout>
      <main className="section info-page editorial" dangerouslySetInnerHTML={{ __html: `<h1>${e.h1}</h1>${e.html}` }} />
    </PublicLayout>
  );
}

function Portal() {
  const { slug } = useParams();
  const { data: o, error } = useLoad("/portals/" + slug);
  const navigate = useNavigate();
  const { run, busy } = useAction();
  const c = o?.criteria || {};
  const name = o?.theme?.name || o?.name;
  useEffect(() => {
    if (name)
      document.title = profileTitle(name);
  }, [name]);
  const ed = slug ? editorial[`/fonds/${slug}`] : undefined;
  const prog = slug ? programs.find((x) => slugify(x.name) === slug || x.id.replace(/_/g, "-") === slug) : undefined;
  const faq = o && name ? (prog ? programFaq(prog, name) : profileFaq(name, resume(c), o.applicationUrl)) : [];
  if (ed)
    return (
      <PublicLayout>
        <main className="section info-page editorial" dangerouslySetInnerHTML={{ __html: `<h1>${ed.h1}</h1>${ed.html}` }} />
      </PublicLayout>
    );
  return (
    <PublicLayout footer={!!o || !!error}>
      <main className="portal" style={o ? orgStyle(o) : {}}>
        <ErrorBox text={error} />
        {o && (
          <>
            <header className="portal-hero">
              <div className="portal-head">
                <OrgLogo o={o} size="lg" />
                <div>
                  <span className="fund-kind">
                    {orgKindLabels[o.kind] || o.kind || "Financeur"} ·{" "}
                    {o.claimed ? "Portail de candidature" : "Fiche annuaire"}
                  </span>
                  <h1>{o.theme.name || o.name}</h1>
                  <p className="lead">
                    {o.theme.intro ||
                      "Préparez votre dossier et partagez les informations utiles à notre analyse."}
                  </p>
                </div>
              </div>
            </header>
            <div className="portal-grid">
              <div>
                <dl className="portal-facts">
                  {[
                    [Coins, "Ticket", ticketAffiche(c)],
                    [Seedling, "Stade", resume(c).stage],
                    [MapPin, "Zone", resume(c).geography],
                    [Building2, "Secteurs", resume(c).sectors],
                  ].map(([Icon, t, v]: any) => (
                    <div key={t}>
                      <dt>
                        <Icon size={14} /> {t}
                      </dt>
                      <dd>{v || "Non communiqué"}</dd>
                    </div>
                  ))}
                </dl>
                {details(o.kind, c).length > 0 && (
                  <section className="panel">
                    <h2>
                      {types[o.kind as TypeFinanceur] || "Financeur"} : en
                      détail
                    </h2>
                    <dl className="fiche-details">
                      {details(o.kind, c).map((d) => (
                        <div key={d.champ.key}>
                          <dt>{d.champ.label}</dt>
                          <dd>{d.texte}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}
                {c.notables?.length > 0 && (
                  <section className="panel">
                    <h2>Ils ont été accompagnés ou financés</h2>
                    <div className="chips">
                      {c.notables.map((x: string) => (
                        <span key={x}>{x}</span>
                      ))}
                    </div>
                  </section>
                )}
                {c.exclusions && (
                  <div className="notice">
                    <AlertCircle size={18} />
                    <p>
                      <strong>Hors périmètre :</strong> {c.exclusions}
                    </p>
                  </div>
                )}
                {c.documents?.length > 0 && (
                  <section className="panel">
                    <h2>Pièces demandées</h2>
                    <ul className="checklist">
                      {c.documents.map((x: string) => (
                        <li key={x}>
                          <FileText size={15} /> {x}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {c.questions?.length > 0 && (
                  <section className="panel">
                    <h2>Questions du financeur</h2>
                    <ol className="checklist numbered">
                      {c.questions.map((x: string) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ol>
                  </section>
                )}
                {Object.keys(c.sources || {}).length > 0 && (
                  <section className="panel">
                    <h2>D’où viennent ces informations</h2>
                    <ul className="sources">
                      {Object.entries<any>(c.sources).map(([k, v]) => (
                        <li key={k}>
                          <strong>{libelleCritere(o.kind, k)}</strong> «{" "}
                          {v.citation} »{" "}
                          <a href={v.url} target="_blank" rel="noreferrer">
                            source <ExternalLink size={12} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
              {o.claimed ? (
                <aside className="panel portal-cta">
                  <h3>Prêt à candidater ?</h3>
                  <p>
                    Fund Road structure votre dossier selon ces exigences et
                    vous montre ce qui manque avant l’envoi.
                  </p>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        localStorage.setItem(
                          "fundroad-recipient",
                          JSON.stringify({
                            id: o.id,
                            name: o.theme.name || o.name,
                            t: Date.now(),
                          }),
                        );
                        // visiteur sans session : inscription plutôt qu'un message d'erreur
                        const connecte = await api("/me").then(
                          () => true,
                          () => false,
                        );
                        navigate(connecte ? "/app/dossiers" : "/inscription");
                      })
                    }
                  >
                    Préparer ma candidature <ArrowRight size={16} />
                  </button>
                  <ul>
                    <li>
                      <Check size={14} /> Gratuit pour les startups
                    </li>
                    <li>
                      <Check size={14} /> Partage révocable à tout moment
                    </li>
                    <li>
                      <Check size={14} /> Suivi de l’étape de votre dossier
                    </li>
                  </ul>
                </aside>
              ) : (
                <aside className="panel portal-cta">
                  <h3>Candidater auprès de {name}</h3>
                  <p>
                    Préparez votre dossier sur Fund Road, puis envoyez-le par le
                    canal officiel {o.applicationUrl ? "ci-dessous" : `de ${name}`} :
                    la plateforme ne transmet pas les candidatures à ce
                    financeur.
                  </p>
                  <Link className="button" to="/inscription">
                    Préparer mon dossier <ArrowRight size={16} />
                  </Link>
                  {o.applicationUrl && (
                    <a
                      className="button secondary"
                      href={o.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Canal officiel <ExternalLink size={15} />
                    </a>
                  )}
                  <small>
                    Fiche établie à partir de{" "}
                    <a href={o.sourceUrl} target="_blank" rel="noreferrer">
                      sources publiques
                    </a>
                    {o.verifiedAt &&
                      ", vérifiée le " +
                        new Date(o.verifiedAt).toLocaleDateString("fr")}
                    . Vous gérez {name} ?{" "}
                    <Link to="/inscription">Créez votre espace financeur</Link>.
                  </small>
                </aside>
              )}
            </div>
            {showAidesLink(o.kind, !!prog) && (
              <p className="portal-aides">
                <Link to="/aides">Guide complet des aides publiques</Link> ·{" "}
                <Link to="/entrepreneurs">Préparer son dossier</Link>
              </p>
            )}
            {faq.length > 0 && (
              <section className="panel portal-faq">
                <h2>Questions fréquentes sur {name}</h2>
                {faq.map(([q, a]) => (
                  <div key={q}>
                    <h3>{q}</h3>
                    <p>{a}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </PublicLayout>
  );
}
function Invitation() {
  const { token } = useParams();
  const { data: me, error } = useLoad("/me");
  const { run, busy } = useAction();
  const navigate = useNavigate();
  // sans session, le jeton survit à l'inscription et à la confirmation de l'email ;
  // connecté, il n'a plus d'utilité
  useEffect(() => {
    try {
      if (me) localStorage.removeItem(CLE_INVITATION);
      else if (error && token) localStorage.setItem(CLE_INVITATION, token);
    } catch {}
  }, [me, error, token]);
  return (
    <PublicLayout>
      <main className="section">
        <div className="panel verification">
          <h1>Rejoindre le dossier</h1>
          {me ? (
            <>
              <p>
                Vous êtes connecté avec <strong>{me.user.email}</strong>.
                L’invitation n’est valable qu’avec l’adresse qui l’a reçue.
              </p>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const r = await api(
                      "/invitations/" + token + "/accept",
                      "POST",
                      {},
                    );
                    navigate(
                      r.dossierId ? "/app/dossiers/" + r.dossierId : "/app",
                    );
                  })
                }
              >
                Accepter l’invitation
              </button>
            </>
          ) : error ? (
            <>
              <p>
                Créez votre compte, ou connectez-vous, avec l’adresse qui a
                reçu l’invitation : vous reviendrez ici ensuite pour
                l’accepter.
              </p>
              <div className="button-row">
                <Link className="button" to="/inscription">
                  Créer mon compte
                </Link>
                <Link className="button secondary" to="/connexion">
                  J’ai déjà un compte
                </Link>
              </div>
            </>
          ) : (
            <p>Chargement…</p>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
export function SharedApplication({ embedded = false }: { embedded?: boolean }) {
  const { id } = useParams();
  const [tick, setTick] = useState(0);
  const { data: a, error } = useLoad("/applications/" + id, tick);
  const { run, busy } = useAction();
  // source d'une citation : le nom du document partagé quand il est connu
  const source = (source?: string) => {
    if (!source || source.startsWith("declaration")) return "Votre déclaration";
    const doc = a?.documents?.find((d: any) => d.id === source);
    return doc ? "Extrait de " + doc.name : "Extrait du dossier";
  };
  const body = (
    <>
      <ErrorBox text={error} />
      {a && (
        <>
          <div className="page-heading">
            <div>
              {a.canReview ? (
                <Link className="backlink" to="/app">
                  ← Pipeline
                </Link>
              ) : (
                <div className="eyebrow">DOSSIER PARTAGÉ · VERSION DATÉE</div>
              )}
              <h1>{a.snapshot.name}</h1>
              <p>{a.message}</p>
            </div>
            <div className="button-row">
              {a.canReview && (
                <a
                  className="button secondary"
                  href={"/api/applications/" + id + "/export/pdf"}
                >
                  <Download size={16} /> PDF
                </a>
              )}
              {a.canRevoke && (
                <button
                  className="button secondary"
                  onClick={() =>
                    run(async () => {
                      await api("/applications/" + id + "/revoke", "POST", {});
                      setTick((t) => t + 1);
                    }, "Accès révoqué")
                  }
                >
                  Révoquer le partage
                </button>
              )}
            </div>
          </div>
          {a.canReview && a.score && (
            <div className="panel">
              <div className="section-title">
                <h3>Complétude de la version partagée</h3>
                <Badge good={a.score.percent === 100}>
                  {a.score.percent} %
                </Badge>
              </div>
              <div className="bar">
                <span style={{ width: a.score.percent + "%" }} />
              </div>
              {a.score.missing?.length > 0 && (
                <p className="smalltext">
                  Dossier incomplet :{" "}
                  {a.score.missing.map((m: any) => m.label).join(", ")}. Seules
                  les rubriques confirmées au partage sont affichées.
                </p>
              )}
              {a.fit && (
                <p>
                  Adéquation à vos critères :{" "}
                  <strong>{a.fit.percent} %</strong> ·{" "}
                  {verdicts[a.fit.verdict]?.[1] || "Évaluation en cours"}
                </p>
              )}
              <label>
                Étape de cette candidature
                <select
                  value={a.stage}
                  disabled={busy}
                  onChange={(e) =>
                    run(async () => {
                      await api("/applications/" + id + "/stage", "PUT", {
                        stage: e.target.value,
                      });
                      setTick((t) => t + 1);
                    }, "Étape mise à jour")
                  }
                >
                  {Object.entries(etapes(a.recipient_kind)).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="content-grid">
            <section>
              {a.questions?.length > 0 && (
                <div className="panel">
                  <h2>Compléments demandés par ce financeur</h2>
                  <p>
                    {a.questions.filter((q: any) => q.answer?.trim()).length} /{" "}
                    {a.questions.length} réponses reçues · échanges mis à jour
                    après le partage.
                  </p>
                  {a.questions.map((q: any) =>
                    a.canRevoke ? (
                      // côté startup : on répond ici, là où l'email du financeur renvoie
                      <form
                        key={q.id}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          run(async () => {
                            await api("/questions/" + q.id, "PUT", {
                              answer: f.get("answer"),
                            });
                            setTick((t) => t + 1);
                          }, "Réponse transmise au financeur");
                        }}
                      >
                        <h3>{q.body}</h3>
                        <textarea
                          name="answer"
                          defaultValue={q.answer || ""}
                          required
                          aria-label={"Votre réponse : " + q.body}
                        />
                        <button className="button secondary" disabled={busy}>
                          {q.answer ? "Modifier ma réponse" : "Répondre"}
                        </button>
                      </form>
                    ) : (
                      <div key={q.id}>
                        <h3>{q.body}</h3>
                        <p className="preline">
                          {q.answer || "En attente de réponse"}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
              {requirements.map((r) => {
                const fact = a.snapshot.state.facts[r.id];
                return (
                  <div className="panel" key={r.id}>
                    <h3>{r.label}</h3>
                    {proposeParIA(fact) && (
                      <Badge>Proposé par l’IA · Non confirmé par la startup</Badge>
                    )}
                    <p className="preline">{fact?.value || "À compléter"}</p>
                    {fact?.quote && (
                      <blockquote>
                        <small>{source(fact.source)}</small>
                        « {fact.quote} »
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </section>
            <aside>
              <div className="panel">
                <h3>Pièces partagées</h3>
                {a.documents.map((d: any) => (
                  <a
                    className="document-row"
                    href={`/api/applications/${id}/documents/${d.id}`}
                    key={d.id}
                  >
                    <FileText size={18} />
                    {d.name}
                    <Download size={16} />
                  </a>
                ))}
              </div>
              {a.canReview && (
                <>
                  <form
                    className="panel"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(async () => {
                        await api("/applications/" + id + "/notes", "POST", {
                          body: f.get("body"),
                        });
                        setTick((t) => t + 1);
                      }, "Note privée enregistrée");
                    }}
                  >
                    <h3>Notes privées de votre équipe</h3>
                    {a.notes.map((n: any) => (
                      <div className="note-row" key={n.id}>
                        <p>{n.body}</p>
                        <small>
                          {n.author || "Équipe"} ·{" "}
                          {new Date(n.created_at).toLocaleDateString("fr")}
                        </small>
                      </div>
                    ))}
                    <textarea name="body" required />
                    <button className="button secondary" disabled={busy}>
                      Ajouter une note
                    </button>
                  </form>
                  <form
                    className="panel"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      run(async () => {
                        await api("/applications/" + id + "/questions", "POST", {
                          body: f.get("body"),
                        });
                        setTick((t) => t + 1);
                      }, "Question ajoutée au dossier");
                    }}
                  >
                    <h3>Demander un complément</h3>
                    <textarea name="body" required minLength={5} />
                    <button className="button" disabled={busy}>
                      Transmettre la question
                    </button>
                  </form>
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </>
  );
  return embedded ? (
    body
  ) : (
    <PublicLayout>
      <main className="section">{body}</main>
    </PublicLayout>
  );
}
// Chaque nouvelle page s'ouvre en haut (sinon on arrive à la position de la page précédente)
// Mesure d'audience Google Analytics : rien n'est chargé ni déposé avant un accord explicite (CNIL)
const GA_ID = "G-BW773NTYEG";
const CHOIX_COOKIES = "fundroad-cookies";
function lireChoixCookies() {
  try {
    return localStorage.getItem(CHOIX_COOKIES);
  } catch {
    return null;
  }
}
function chargerAnalytics() {
  const w = window as any;
  // seulement sur le domaine de production, pour ne pas compter le développement
  if (location.hostname !== "fund-road.com" || w.gtag) return;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    // gtag.js attend l'objet arguments, pas un tableau
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
}
// Retire le choix et les cookies _ga déjà posés, puis repose la question
function revoirCookies() {
  try {
    localStorage.removeItem(CHOIX_COOKIES);
  } catch {}
  // la campagne et les marqueurs de visite ne survivent pas au retrait du choix
  oublierMesure();
  // sinon Google Analytics réécrit son cookie avant le rechargement
  (window as any)["ga-disable-" + GA_ID] = true;
  document.cookie
    .split("; ")
    .filter((c) => c.startsWith("_ga"))
    .forEach((c) => {
      document.cookie = `${c.split("=")[0]}=; Max-Age=0; path=/; domain=.${location.hostname}`;
    });
  location.reload();
}
function Consentement() {
  const [choix, setChoix] = useState(lireChoixCookies);
  useEffect(() => {
    if (choix === "oui") {
      chargerAnalytics();
      chargerMesure();   // le pixel Searchtide n'est chargé qu'après un accord explicite
    } else if (choix === "non") {
      oublierMesure();   // après refus : aucun envoi, aucun identifiant stocké
    }
  }, [choix]);
  if (choix) return null;
  const choisir = (v: string) => {
    try {
      localStorage.setItem(CHOIX_COOKIES, v);
    } catch {}
    persistUtm();   // la campagne n'est gardée dans l'onglet qu'après acceptation
    setChoix(v);
  };
  return (
    <div
      className="cookies"
      role="region"
      aria-label="Cookies de mesure d’audience"
    >
      <p>
        Nous mesurons l’audience de deux façons. Une mesure interne sans cookie ni
        identifiant persistant compte les visites de tous : page, domaine d’origine,
        type d’appareil, pays et date, rien d’autre, sans profilage — elle est
        exemptée de consentement. Google Analytics et le suivi d’étape (inscription,
        dossier, analyse) ne se chargent qu’avec votre accord.{" "}
        <Link to="/confiance">En savoir plus</Link>
      </p>
      <div className="button-row">
        <button
          className="button secondary small"
          onClick={() => choisir("non")}
        >
          Refuser
        </button>
        <button
          className="button secondary small"
          onClick={() => choisir("oui")}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
function ScrollTop() {
  const { pathname } = useLocation();
  useLayoutEffect(remonter, [pathname]);
  return null;
}
function Root() {
  const [toast, setToast] = useState("");
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 6500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && /^(START|FUND)-[A-F0-9]+$/.test(code))
      localStorage.setItem("fundroad-code", code);
  }, []);
  return (
    <ToastContext.Provider value={setToast}>
      <ErreurContext.Provider value={setErreur}>
        <BrowserRouter>
        <ScrollTop />
        <Consentement />
        <Routes>
          <Route path="/ressources" element={<Resources />} />
          <Route path="/ressources/:slug" element={<ResourcePage />} />
          <Route path="/" element={<Landing />} />
          <Route path="/financeurs" element={<FinanceursPage />} />
          {Object.keys(publicCopy)
            .filter((p) => p !== "ressources")
            .map((p) => (
              <Route key={p} path={"/" + p} element={<InfoPage />} />
            ))}
          <Route path="/tarifs" element={<Pricing />} />
          <Route path="/annuaire" element={<Directory />} />
          <Route path="/connexion" element={<AuthPage />} />
          <Route path="/inscription" element={<AuthPage />} />
          <Route path="/mot-de-passe" element={<PasswordPage />} />
          <Route path="/double-auth" element={<TwoFactor />} />
          <Route
            path="/app/*"
            element={
              <Suspense
                fallback={
                  <div className="loading">Chargement de votre espace…</div>
                }
              >
                <Shell />
              </Suspense>
            }
          />
          <Route path="/verification/:id" element={<Verification />} />
          <Route path="/fonds/:slug" element={<Portal />} />
          <Route path="/aides" element={<Editorial />} />
          <Route path="/aides/:slug" element={<Editorial />} />
          <Route path="/portail/:slug" element={<Portal />} />
          <Route path="/invitation/:token" element={<Invitation />} />
          <Route path="/partages/:id" element={<SharedApplication />} />
          <Route
            path="*"
            element={
              <PublicLayout>
                <div className="section">
                  <h1>Page introuvable</h1>
                  <p>
                    Cette adresse n’existe pas ou a changé. L’annuaire des
                    financeurs et votre espace restent accessibles depuis le
                    menu.
                  </p>
                  <Link className="button" to="/">
                    Découvrir Fund Road
                  </Link>
                </div>
              </PublicLayout>
            }
          />
        </Routes>
        {toast && (
          <div className="toast" role="status">
            <AlertCircle size={18} />
            <span>{toast}</span>
            <button onClick={() => setToast("")} aria-label="Fermer">
              <X size={17} />
            </button>
          </div>
        )}
        {/* erreur d'action : persistante, en haut de la page, jamais un toast */}
        {erreur && (
          <div className="action-error" role="alert">
            <AlertCircle size={18} />
            <span>{erreur}</span>
            <button
              onClick={() => setErreur("")}
              aria-label="Fermer le message d’erreur"
            >
              <X size={17} />
            </button>
          </div>
        )}
        </BrowserRouter>
      </ErreurContext.Provider>
    </ToastContext.Provider>
  );
}
captureUtm();
chargerMesureExemptee();   // mesure exemptée : tous les visiteurs, sans cookie ni stockage
createRoot(document.getElementById("root")!).render(<Root />);
