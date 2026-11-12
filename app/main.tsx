import React, {
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
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Link, NavLink, useNavigate } from "./links.tsx";
import { captureUtm, firstTime, keepUtm, persistUtm, track } from "./track.ts";
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
function useLoad<T = any>(url: string, dep: any = 0) {
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
const ToastContext = createContext<(message: string) => void>(() => {});
// Erreur d'action : affichée en haut de page, persistante, jamais en toast
const ErreurContext = createContext<(message: string) => void>(() => {});
// busy, erreur persistante du dernier formulaire, et succès en toast court
function useAction() {
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
function ConfirmDialog({
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
const Logo = ({ light = false }: { light?: boolean }) => (
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
function BasculeTheme() {
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
const Badge = ({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) => <span className={"badge " + (good ? "good" : "")}>{children}</span>;
const ErrorBox = ({ text }: { text: string }) =>
  text ? (
    <div role="alert" className="notice">
      <AlertCircle size={18} />
      {text}
    </div>
  ) : null;
const Empty = ({
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
function PublicLayout({
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
      label: dossier?.label || "Dossier financement",
      price: dossier ? dossier.price_cents / 100 + " €" : "—",
      unit: " / 90 jours, résiliable",
      // seuls les exports changent de camp : révocation et suivi restent gratuits (12/11)
      features: [
        "Analyses IA de vos documents",
        "Critères des aides et des financeurs",
        "Exports PDF et Word",
      ],
      cta: dossier?.active ? "Choisir" : "Ouverture prochaine",
      featured: true,
    },
    {
      badge: "Financeurs",
      label: "Fonds, business angels, incubateurs",
      price: "0 €",
      unit: " pendant le lancement",
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
          Les startups commencent gratuitement et paient quand le dossier
          compte. Les financeurs et incubateurs sont gratuits pendant le
          lancement.
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
          Aucune commission sur les levées ni sur les subventions obtenues.
          TVA non applicable, article 293 B du CGI.{" "}
          <Link to="/cgv">Conditions générales de vente</Link>
        </p>
      </main>
    </PublicLayout>
  );
}
const profilInscription = () => {
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
const WorkspaceContext = createContext<Workspace>(null as any);
// Icônes des entrées de menu ; la liste et les libellés viennent de shared/ui.ts
const iconesMenu: Record<string, typeof LayoutDashboard> = {
  "/app": LayoutDashboard,
  "/app/dossiers": FolderOpen,
  "/app/candidatures": Send,
  "/app/annuaire": Search,
  "/app/portail": Building2,
  "/app/partenaires": Gift,
  "/app/facturation": CreditCard,
  "/app/securite": ShieldCheck,
};
// Invité sur un dossier, sans organisation : ses dossiers, et la possibilité d'en créer une
const liensInvite = [
  ["/app", "Dossiers partagés", FolderOpen],
  ["/app/nouvelle-organisation", "Créer mon organisation", Building2],
] as const;
function Shell() {
  const [tick, setTick] = useState(0),
    [orgId, setOrgId] = useState(localStorage.getItem("fundroad-org") || ""),
    [open, setOpen] = useState(false);
  const { data: me, error } = useLoad("/me", tick);
  const navigate = useNavigate();
  const org =
    me?.organizations.find((o: any) => o.id === orgId) || me?.organizations[0];
  if (error)
    return (
      <PublicLayout>
        <div className="section">
          <h2>Accédez à votre espace</h2>
          <p>{error}</p>
          <Link className="button" to="/connexion">
            Se connecter
          </Link>
        </div>
      </PublicLayout>
    );
  if (!me) return <div className="loading">Chargement de votre espace…</div>;
  const menu: readonly (readonly [string, string, typeof LayoutDashboard])[] =
    org
      ? menuPour(org.kind, Boolean(org.paid)).map(
          ([to, label]) => [to, label, iconesMenu[to] || LayoutDashboard] as const,
        )
      : liensInvite;
  return (
    <WorkspaceContext.Provider
      value={{ me, org, refresh: () => setTick((t) => t + 1) }}
    >
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>
      <div className="workspace">
        <aside className={"sidebar " + (open ? "open" : "")}>
          <Logo />
          {org && (
            <div className="workspace-switch">
              <span className="company-icon small">{org.name?.[0] || "+"}</span>
              <select
                aria-label="Organisation active"
                value={org.id}
                onChange={(e) => {
                  setOrgId(e.target.value);
                  localStorage.setItem("fundroad-org", e.target.value);
                }}
              >
                {me.organizations.map((o: any) => (
                  <option value={o.id} key={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <small className="nav-label">VOTRE ESPACE</small>
          <nav>
            {menu.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/app"}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="privacy-box">
              <ShieldCheck size={19} />
              <strong>Un partage maîtrisé</strong>
              <p>
                Vos dossiers restent privés jusqu’à votre décision de les
                partager.
              </p>
            </div>
            <button
              className="user-button"
              onClick={async () => {
                await api("/auth/sign-out", "POST", {});
                navigate("/");
              }}
            >
              <span className="avatar">{me.user.name?.[0]}</span>
              <span>
                <strong>{me.user.name}</strong>
                <small>Déconnexion</small>
              </span>
              <LogOut size={16} />
            </button>
          </div>
        </aside>
        <div className="workspace-main">
          <header className="workspace-header">
            <button
              className="mobile-toggle iconbutton"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <Menu />
            </button>
            <span>
              ESPACE{" "}
              {!org
                ? ""
                : org.kind === "startup"
                  ? "ENTREPRENEUR"
                  : org.kind === "incubator"
                    ? "INCUBATEUR"
                    : "FINANCEUR"}
            </span>
            <div>
              <BasculeTheme />
              <Link to="/referentiel">
                Aide & référentiel <ArrowUpRight size={14} />
              </Link>
            </div>
          </header>
          <main className="workspace-content" id="contenu" tabIndex={-1}>
            {!org ? (
              me.contributor ? (
                <Routes>
                  <Route path="dossiers/:id" element={<DossierPage />} />
                  <Route
                    path="nouvelle-organisation"
                    element={<Onboarding />}
                  />
                  <Route path="*" element={<DossiersPartages />} />
                </Routes>
              ) : (
                <Onboarding />
              )
            ) : (
              <Routes>
                <Route
                  index
                  element={
                    org?.kind && org.kind !== "startup" ? (
                      <Pipeline />
                    ) : (
                      <Dashboard />
                    )
                  }
                />
                <Route path="dossiers" element={<Dashboard all />} />
                <Route path="dossiers/:id" element={<DossierPage />} />
                <Route path="candidatures" element={<Applications />} />
                <Route path="annuaire" element={<Directory embedded />} />
                <Route path="portail" element={<OrganizationPage />} />
                <Route path="partenaires" element={<Partners />} />
                <Route path="facturation" element={<Billing />} />
                <Route path="securite" element={<Security />} />
                <Route
                  path="partages/:id"
                  element={<SharedApplication embedded />}
                />
                <Route path="*" element={<Empty title="Page introuvable" />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
function Onboarding() {
  const { refresh } = useContext(WorkspaceContext);
  const { run, busy } = useAction();
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>À chaque projet, son espace</h1>
          <p>
            Créez votre organisation pour préparer ou examiner des dossiers.
          </p>
        </div>
      </div>
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name") || "");
          const kind = String(f.get("kind") || "startup");
          const goal = String(f.get("goal") || "investment");
          run(async () => {
            const org = await api("/organizations", "POST", { name, kind });
            if (kind !== "startup") {
              // un financeur ne crée pas de dossier pour lui-même
              refresh();
              navigate("/app");
              return;
            }
            try {
              // un seul formulaire : le nom n'est pas demandé deux fois
              const d = await api("/dossiers", "POST", {
                organizationId: org.id,
                name,
                goal,
              });
              refresh();
              navigate("/app/dossiers/" + d.id + "?onglet=documents");
            } catch (err: any) {
              // l'organisation reste créée : l'accueil de l'espace propose de créer le dossier
              toast(
                (err?.message || "Le dossier n’a pas pu être créé.") +
                  " Votre organisation est créée : créez votre dossier depuis l’accueil.",
              );
              refresh();
              navigate("/app");
            }
          });
        }}
      >
        <label>
          Nom de votre entreprise ou organisation
          <input
            name="name"
            placeholder="Votre startup, fonds ou réseau"
            minLength={2}
            required
          />
        </label>
        <label>
          Vous êtes
          <select name="kind" defaultValue={profilInscription()}>
            <option value="startup">Une startup / entreprise</option>
            <option value="angel">Un business angel indépendant</option>
            <option value="fund">Un fonds d’investissement</option>
            <option value="network">Un réseau de business angels</option>
            <option value="grant">Un organisme de subventions</option>
            <option value="incubator">Un incubateur / accélérateur</option>
          </select>
        </label>
        <label>
          Votre objectif
          <select name="goal" defaultValue="investment">
            <option value="investment">Investissement</option>
            <option value="grant">Subvention</option>
          </select>
        </label>
        <button disabled={busy} className="button">
          Créer mon espace <ArrowRight size={16} />
        </button>
      </form>
    </>
  );
}
// Alerte de fin d'analyse : vue par la startup ou pas encore (aucune dépendance à l'e-mail)
const CLE_ANALYSE = "fundroad-analyse-vue";
function analyseVue(dossierId: string, jobId: string) {
  try {
    const v = JSON.parse(localStorage.getItem(CLE_ANALYSE) || "{}");
    return v[dossierId] === jobId;
  } catch {
    return false;
  }
}
function marquerAnalyseVue(dossierId: string, jobId: string) {
  try {
    const v = JSON.parse(localStorage.getItem(CLE_ANALYSE) || "{}");
    v[dossierId] = jobId;
    localStorage.setItem(CLE_ANALYSE, JSON.stringify(v));
  } catch {}
}
// localStorage (lien de confirmation dans un autre onglet) ; un choix de plus de 7 jours est ignoré
function storedRecipient(): { id: string; name: string } | null {
  try {
    const value = JSON.parse(
      localStorage.getItem("fundroad-recipient") || "null",
    );
    return value?.id &&
      value?.name &&
      Date.now() - (value.t || 0) < 7 * 864e5
      ? value
      : null;
  } catch {
    return null;
  }
}
function Dashboard({ all = false }: { all?: boolean }) {
  const { org, me } = useContext(WorkspaceContext);
  const [tick, setTick] = useState(0),
    [creating, setCreating] = useState(false);
  const { data, error } = useLoad<any[]>("/dossiers", tick);
  const navigate = useNavigate();
  const { run, busy } = useAction();
  const rows = data?.filter((d) => d.organization_id === org.id) || [];
  // dossiers d'une autre organisation auxquels on contribue sur invitation
  // (les dossiers de ses autres organisations s'ouvrent en changeant d'organisation)
  const partages =
    data?.filter(
      (d) => !me.organizations.some((o: any) => o.id === d.organization_id),
    ) || [];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {all ? "Vos dossiers" : `Bonjour ${me.user.name.split(" ")[0]}`}
          </h1>
          <p>
            {all
              ? "Toutes vos informations, au même endroit."
              : "Chaque information compte. Faisons avancer votre dossier."}
          </p>
        </div>
        <button className="button" onClick={() => setCreating(!creating)}>
          <Plus size={18} /> Nouveau dossier
        </button>
      </div>
      <ErrorBox text={error} />
      {creating && (
        <form
          className="panel inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              const d = await api("/dossiers", "POST", {
                name: f.get("name"),
                goal: f.get("goal"),
                organizationId: org.id,
                recipientOrg: storedRecipient()?.id,
              });
              localStorage.removeItem("fundroad-recipient");
              track("dossier_cree");   // après la réponse de succès du serveur ; aucun nom de dossier envoyé
              navigate("/app/dossiers/" + d.id);
            });
          }}
        >
          <label>
            Nom du projet
            <input
              name="name"
              placeholder="Ex. Atelier demain"
              minLength={2}
              required
            />
          </label>
          <label>
            Objectif
            <select name="goal">
              <option value="investment">Investissement</option>
              <option value="grant">Subvention</option>
            </select>
          </label>
          <button className="button" disabled={busy}>
            Créer
          </button>
        </form>
      )}
      <div className="stat-grid">
        <div>
          <span>Dossiers en préparation</span>
          <strong>{rows.length.toString().padStart(2, "0")}</strong>
          <small>Dans votre organisation</small>
        </div>
        <div>
          <span>Progression moyenne</span>
          <strong>
            {rows.length
              ? Math.round(
                  rows.reduce((n, d) => n + d.score.percent, 0) / rows.length,
                )
              : 0}
            <em>%</em>
          </strong>
          <small>Informations confirmées</small>
        </div>
        <div>
          <span>Rubriques à compléter</span>
          <strong>
            {rows
              .reduce((n, d) => n + d.score.missing.length, 0)
              .toString()
              .padStart(2, "0")}
          </strong>
          <small>Des prochaines étapes concrètes</small>
        </div>
      </div>
      <section>
        <div className="section-title">
          <h2>Vos dossiers de financement</h2>
          <button
            className="iconbutton"
            onClick={() => setTick((t) => t + 1)}
            aria-label="Actualiser"
          >
            <RefreshCw size={17} />
          </button>
        </div>
        {!rows.length ? (
          <div className="panel">
            <Empty title="Votre premier dossier commence ici">
              Déposez les documents que vous avez déjà. Vous pourrez compléter
              la suite à votre rythme.
            </Empty>
            <button
              className="button centered"
              onClick={() => setCreating(true)}
            >
              <Plus size={17} /> Préparer mon dossier
            </button>
          </div>
        ) : (
          rows.map((d) => <DossierCard d={d} key={d.id} />)
        )}
      </section>
      {partages.length > 0 && (
        <section>
          <div className="section-title">
            <h2>Partagés avec moi</h2>
          </div>
          {partages.map((d) => (
            <DossierCard d={d} key={d.id} />
          ))}
        </section>
      )}
    </>
  );
}
// Dossiers d'autres organisations auxquels on contribue sur invitation, pour qui n'a pas d'organisation
function DossiersPartages() {
  const { data, error } = useLoad<any[]>("/dossiers");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dossiers partagés avec vous</h1>
          <p>
            Complétez ces dossiers à votre rythme. Pour préparer le vôtre,
            créez votre organisation.
          </p>
        </div>
        <Link className="button secondary" to="/app/nouvelle-organisation">
          <Plus size={18} /> Créer mon organisation
        </Link>
      </div>
      <ErrorBox text={error} />
      {data && !data.length && (
        <div className="panel">
          <Empty title="Aucun dossier partagé pour le moment" />
        </div>
      )}
      {data?.map((d) => <DossierCard d={d} key={d.id} />)}
    </>
  );
}
function DossierCard({ d }: { d: any }) {
  return (
    <Link to={"/app/dossiers/" + d.id} className="dossier-card">
      <div className="dossier-top">
        <span className="company-icon">{d.name[0]}</span>
        <div>
          <h3>{d.name}</h3>
          <small>
            {d.goal === "grant" ? "Subvention" : "Investissement"} · Mis à jour
            le {new Date(d.updated_at).toLocaleDateString("fr")}
          </small>
        </div>
        <ArrowUpRight size={20} />
      </div>
      <div className="progress-label">
        <span>Complétude du dossier</span>
        <strong>{d.score.percent} %</strong>
      </div>
      <div className="bar">
        <span style={{ width: d.score.percent + "%" }} />
      </div>
      {d.analyse_at && !analyseVue(d.id, d.analyse_id) && (
        <Badge good>
          Analyse terminée le{" "}
          {new Date(d.analyse_at).toLocaleDateString("fr")}
        </Badge>
      )}
      <div className="dossier-bottom">
        <span>
          {d.score.completed} rubriques confirmées sur {d.score.total}
        </span>
        <span>
          Continuer <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
// Dépôt de fichiers ou d'un dossier entier, puis analyse lancée automatiquement, avec la progression
const formatsAcceptes = /\.(pdf|docx|pptx|xlsx)$/i;
// Parcourt un dossier glissé-déposé (et ses sous-dossiers) ; readEntries rend les fichiers par lots
async function fichiersDuDepot(items: DataTransferItemList) {
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
const DUREE_ANALYSE = 150;
function DepotAnalyse({
  d,
  refresh,
  aiReady,
  voirDossier,
}: {
  d: any;
  refresh: () => void;
  aiReady: boolean;
  voirDossier?: () => void;
}) {
  const toast = useContext(ToastContext);
  const [envoi, setEnvoi] = useState<{
    fait: number;
    total: number;
    nom: string;
  } | null>(null);
  const [survol, setSurvol] = useState(false);
  const [erreurAnalyse, setErreurAnalyse] = useState("");
  const [quotaAtteint, setQuotaAtteint] = useState(false);
  const [maintenant, setMaintenant] = useState(Date.now());
  const docs: any[] = d.documents;
  const lus = docs.filter((x) => x.status !== "queued").length;
  const enLecture = docs.some((x) => x.status === "queued");
  const analyse = d.jobs.find((j: any) => j.kind === "analysis");
  const analyseEnCours =
    analyse && ["queued", "running"].includes(analyse.status);
  // relance de l'horloge pendant l'analyse, pour faire avancer l'estimation
  useEffect(() => {
    if (!analyseEnCours) return;
    const t = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(t);
  }, [analyseEnCours]);
  // plus aucun lancement automatique : le clic est toujours nécessaire
  const prets = docs.filter((x) => x.status === "ready").length;
  const restantes = Math.max(0, Number(d.quota ?? 0) - Number(d.usage ?? 0));
  const lancer = async () => {
    setErreurAnalyse("");
    setQuotaAtteint(false);
    try {
      await api("/dossiers/" + d.id + "/analyze", "POST", {});
      refresh();
    } catch (e: any) {
      setErreurAnalyse(e.message);
      if (e.status === 402) setQuotaAtteint(true);
    }
  };
  const deposer = async (fichiers: File[]) => {
    const ignores = fichiers.filter(
      (f) => !formatsAcceptes.test(f.name) || f.name.startsWith("."),
    );
    // trop lourds : refusés ici plutôt qu'après un envoi complet
    const tropLourds = fichiers.filter(
      (f) => !ignores.includes(f) && f.size > 20 * 1024 * 1024,
    );
    const valides = fichiers.filter(
      (f) => !ignores.includes(f) && !tropLourds.includes(f),
    );
    const noms = (l: File[]) =>
      l.slice(0, 3).map((f) => f.name).join(", ") + (l.length > 3 ? "…" : "");
    if (!valides.length)
      return toast(
        tropLourds.length
          ? `Fichier limité à 20 Mo : ${noms(tropLourds)}`
          : "Aucun fichier PDF, Word, PowerPoint ou Excel dans ce dépôt",
      );
    const erreurs: string[] = [];
    let deposes = 0,
      doublons = 0;
    for (const [i, f] of valides.entries()) {
      setEnvoi({ fait: i, total: valides.length, nom: f.name });
      const body = new FormData();
      body.append("file", f);
      // un doublon (même contenu déjà déposé) n'ajoute pas de document
      await api("/dossiers/" + d.id + "/documents", "POST", body)
        .then((r: any) => (r?.duplicate ? doublons++ : deposes++))
        .catch((e) => erreurs.push(`${f.name} : ${e.message}`));
    }
    setEnvoi(null);
    refresh();
    toast(
      [
        `${deposes} document(s) déposé(s)`,
        doublons > 0 && `${doublons} déjà déposé(s)`,
        ignores.length > 0 &&
          `ignoré(s), format non pris en charge : ${noms(ignores)}`,
        tropLourds.length > 0 && `plus de 20 Mo : ${noms(tropLourds)}`,
        ...erreurs,
      ]
        .filter(Boolean)
        .join(" · "),
    );
  };
  // étapes pondérées : envoi 0-15 %, lecture 15-35 %, analyse 35-100 %
  let pct = 0,
    etape = "";
  if (envoi) {
    pct = Math.round((envoi.fait / envoi.total) * 15);
    etape = `Envoi ${envoi.fait + 1}/${envoi.total} : ${envoi.nom}`;
  } else if (enLecture) {
    pct = 15 + Math.round((lus / docs.length) * 20);
    etape = `Lecture des documents : ${lus}/${docs.length}`;
  } else if (analyseEnCours) {
    // horloges du serveur et du navigateur légèrement décalées : jamais de temps négatif
    const ecoule = Math.max(
      0,
      (maintenant - new Date(analyse.created_at).getTime()) / 1000,
    );
    pct = 35 + Math.round(Math.min(0.95, ecoule / DUREE_ANALYSE) * 65);
    etape =
      analyse.status === "queued"
        ? "Analyse en file d’attente"
        : ecoule > DUREE_ANALYSE
          ? "Analyse IA en cours : encore quelques instants"
          : "Analyse IA en cours (estimation, environ 2 à 3 min)";
  }
  const actif = !!etape;
  // entre deux étapes, la liste des documents arrive après le lancement : la barre ne recule jamais
  const plusHaut = useRef(0);
  plusHaut.current = actif ? Math.max(plusHaut.current, pct) : 0;
  pct = plusHaut.current;
  return (
    <div className="panel depot">
      <label
        className={"upload-zone" + (survol ? " survol" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setSurvol(false);
          if (!actif)
            await deposer(await fichiersDuDepot(e.dataTransfer.items));
        }}
      >
        <Upload size={30} />
        <strong>Déposez vos documents ou un dossier entier</strong>
        <span className="button secondary small">Choisir des fichiers</span>
        <span>
          PDF (même scannés), Word, PowerPoint, Excel · 20 Mo par fichier · 30
          documents maximum. L’analyse ne part qu’après votre clic.
        </span>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.xlsx"
          disabled={actif}
          onChange={(e) => {
            deposer([...(e.target.files || [])]);
            e.target.value = "";
          }}
        />
      </label>
      <label className="textbutton choisir-dossier">
        Ou choisir un dossier
        <input
          type="file"
          {...{ webkitdirectory: "" }}
          disabled={actif}
          onChange={(e) => {
            deposer([...(e.target.files || [])]);
            e.target.value = "";
          }}
        />
      </label>
      {!actif && (
        <div className="depot-lancement">
          <p className="solde-analyses">
            {restantes > 0
              ? `${restantes} analyse${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""} ce mois-ci`
              : "Aucune analyse restante ce mois-ci"}
            {" · "}
            {prets} document{prets > 1 ? "s" : ""} prêt{prets > 1 ? "s" : ""} à
            analyser
          </p>
          <button
            className="button"
            disabled={!prets || restantes === 0 || !aiReady}
            onClick={lancer}
          >
            <Sparkles size={16} /> Lancer l’analyse sur ces {prets} document
            {prets > 1 ? "s" : ""}
          </button>
          {!aiReady && (
            <small className="muted">
              L’analyse automatique n’est pas encore ouverte.
            </small>
          )}
          {restantes === 0 && (
            <p className="notice-line">
              Quota du mois atteint.{" "}
              <Link to="/app/facturation">Voir les offres et la facturation</Link>
            </p>
          )}
          {quotaAtteint && (
            <div className="notice">
              <div>
                <strong>Quota d’analyses épuisé</strong>
                <p>{erreurAnalyse}</p>
                <Link className="button small" to="/app/facturation">
                  Passer à l’offre Dossier
                </Link>
              </div>
            </div>
          )}
          {erreurAnalyse && !quotaAtteint && <ErrorBox text={erreurAnalyse} />}
        </div>
      )}
      {actif && (
        <div className="progression">
          <div className="progression-tete">
            {/* seule l'étape est annoncée aux lecteurs d'écran, pas chaque pourcentage */}
            <strong role="status">{etape}</strong>
            <span className="tnum" aria-hidden="true">{pct} %</span>
          </div>
          <div className="bar" role="progressbar" aria-label="Progression" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: pct + "%" }} />
          </div>
        </div>
      )}
      {!actif && analyse?.status === "failed" && (
        <p className="notice">
          L’analyse n’a pas abouti : {analyse.error}. Corrigez puis relancez-la.
        </p>
      )}
      {!actif && analyse?.status === "done" && (
        <div className="depot-fin">
          <p>
            Analyse terminée : {Object.keys(d.state.facts).length} rubrique(s)
            sur {d.score.total} renseignée(s) à partir de vos documents, à
            relire et confirmer.
          </p>
          {voirDossier && (
            <button className="button small" onClick={voirDossier}>
              Voir mon dossier <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
function DossierPage() {
  const { id } = useParams();
  const [tick, setTick] = useState(0),
    [attestation, setAttestation] = useState(""),
    [suppression, setSuppression] = useState(false),
    [revocation, setRevocation] = useState("");
  const [params, setParams] = useSearchParams();
  // l'onglet vit dans l'URL : un rechargement ou un lien d'e-mail le conserve
  const tab = ongletDepuisUrl("?" + params.toString());
  const setTab = (key: string) =>
    setParams(parametresOnglet(key), { replace: true });
  const { data: d, error } = useLoad("/dossiers/" + id, tick);
  const { data: cfg } = useLoad("/config");
  const { run, busy } = useAction();
  const { org } = useContext(WorkspaceContext);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const refresh = () => setTick((t) => t + 1);
  const derniereAnalyse = d?.jobs?.find((j: any) => j.kind === "analysis");
  // fin d'analyse : titre d'onglet « ✓ Analyse terminée », restauré en quittant la page
  useEffect(() => {
    if (!d || derniereAnalyse?.status !== "done") return;
    const avant = document.title;
    document.title = "✓ Analyse terminée";
    marquerAnalyseVue(d.id, derniereAnalyse.id);
    return () => {
      document.title = avant;
    };
  }, [d?.id, derniereAnalyse?.id, derniereAnalyse?.status]);
  useEffect(() => {
    if (
      !d?.jobs.some((j: any) => ["queued", "running"].includes(j.status)) &&
      !d?.documents.some((x: any) => x.status === "queued")
    )
      return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [d]);
  // analyse_ok : une analyse vue « en attente/en cours » dans cette page passe à « terminée » sur le serveur.
  // Une analyse déjà terminée à l'ouverture de la page ne produit rien (la base fait foi pour ces cas).
  const analysesVues = useRef(new Map<string, string>());
  useEffect(() => {
    for (const j of d?.jobs ?? []) {
      if (j.kind !== "analysis") continue;
      const avant = analysesVues.current.get(j.id);
      if (avant && avant !== "done" && j.status === "done") track("analyse_ok");
      analysesVues.current.set(j.id, j.status);
    }
  }, [d]);
  // chargement distinct de l'erreur : un dossier en cours de chargement n'est pas une erreur
  if (!d) return error ? <ErrorBox text={error} /> : <div className="loading">Chargement du dossier…</div>;
  // propositions de l'analyse relues mais pas encore confirmées (bouton groupé).
  // A5b.2 : un conflit bloque la confirmation en lot, il n'est rattaché à aucune rubrique.
  const conflits = (d.state.conflicts || []).length;
  const propositions = confirmationEnLot(
    d.state.facts,
    requirements.map((r) => r.id),
    conflits,
  );
  return (
    <>
      <Link className="backlink" to="/app/dossiers">
        ← Mes dossiers
      </Link>
      <div className="page-heading">
        <div>
          <h1>{d.name}</h1>
          <p>
            Version {d.revision} · Vos informations, organisées pour avancer.
          </p>
          {derniereAnalyse?.status === "done" && (
            <p className="smalltext">
              <Badge good>Analyse terminée</Badge> le{" "}
              {new Date(derniereAnalyse.created_at).toLocaleDateString("fr")} ·
              relisez et confirmez les rubriques proposées.
            </p>
          )}
        </div>
        <div className="button-row">
          <a
            className="button secondary"
            href={"/api/dossiers/" + id + "/export/pdf"}
          >
            <Download size={16} /> PDF
          </a>
          <a
            className="button secondary"
            href={"/api/dossiers/" + id + "/export/docx"}
          >
            Word
          </a>
          {org?.role === "owner" && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setSuppression(true)}
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
      {suppression && (
        <ConfirmDialog
          texte={`Supprimer définitivement « ${d.name} », ses documents, ses versions et ses partages ? Cette action est irréversible.`}
          confirmer="Supprimer le dossier"
          busy={busy}
          onCancel={() => setSuppression(false)}
          onConfirm={() =>
            run(async () => {
              await api("/dossiers/" + id, "DELETE");
              navigate("/app/dossiers");
            }, "Dossier supprimé")
          }
        />
      )}
      {revocation && (
        <ConfirmDialog
          texte="Révoquer cette attestation ? Sa page publique indiquera qu’elle n’est plus valable."
          confirmer="Révoquer l’attestation"
          busy={busy}
          onCancel={() => setRevocation("")}
          onConfirm={() =>
            run(async () => {
              await api("/attestations/" + revocation + "/revoke", "POST", {});
              setRevocation("");
              refresh();
            }, "Attestation révoquée")
          }
        />
      )}
      <div className="tabs">
        {[
          ["overview", "Vue d’ensemble"],
          ["documents", "Documents"],
          ["dossier", "Mon dossier"],
          ["questions", "À compléter"],
          ["eligibility", "Éligibilité"],
          ["share", "Partager"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            key={key}
          >
            {label}
            {key === "questions" && <span>{d.score.missing.length}</span>}
          </button>
        ))}
      </div>
      <ErrorBox text={error} />
      {tab === "overview" && (
        <div className="content-grid">
          <section>
            <DepotAnalyse
              d={d}
              refresh={refresh}
              aiReady={!!cfg?.aiReady}
              voirDossier={() => setTab("dossier")}
            />
            <div className="panel score-panel">
              <div>
                <div className="bigscore">
                  {d.score.percent}
                  <span>%</span>
                </div>
                <p>
                  {d.score.completed} rubriques confirmées sur {d.score.total}.
                </p>
              </div>
              <div
                className="progress-ring"
                style={{ "--progress": d.score.percent + "%" } as any}
              >
                <ShieldCheck size={34} />
              </div>
              <div className="bar">
                <span style={{ width: d.score.percent + "%" }} />
              </div>
              <small>
                Ce score mesure la complétude, pas vos chances de financement.
              </small>
            </div>
            {d.state.critique && <LectureInvestisseur c={d.state.critique} />}
            {d.recipient_org && (
              <div className="panel">
                <h3>Exigences pour {d.criteria_snapshot.recipientName}</h3>
                <p>
                  {d.recipientProgress.completed} / {d.recipientProgress.total}{" "}
                  questions renseignées.
                </p>
                <div className="bar">
                  <span
                    style={{
                      width:
                        (d.recipientProgress.total
                          ? (100 * d.recipientProgress.completed) /
                            d.recipientProgress.total
                          : 0) + "%",
                    }}
                  />
                </div>
                <p className="smalltext">
                  Ces réponses complètent le socle Fund Road. Elles ne mesurent
                  pas l’adéquation à la thèse ni les chances d’investissement.
                </p>
                <button
                  className="button secondary"
                  onClick={() => setTab("questions")}
                >
                  Préparer mes réponses
                </button>
              </div>
            )}
            <div className="panel">
              <div className="section-title">
                <h3>Vos prochaines étapes</h3>
                <Badge>{d.score.missing.length} restantes</Badge>
              </div>
              {d.score.missing.slice(0, 4).map((r: any, i: number) => (
                <button
                  className="next-step"
                  key={r.id}
                  onClick={() => setTab("questions")}
                >
                  <span className="step-number">{i + 1}</span>
                  <div>
                    <strong>{r.label}</strong>
                    <small>{r.question}</small>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
              {!d.score.missing.length && (
                <p>
                  Toutes les rubriques sont confirmées. Vérifiez les contrôles
                  et l’attestation.
                </p>
              )}
            </div>
            {d.state.conflicts.length > 0 && (
              <div className="notice">
                <div>
                  <strong>Points à clarifier</strong>
                  {d.state.conflicts.map((s: string) => (
                    <p key={s}>{s}</p>
                  ))}
                  <p>
                    Corrigez les informations concernées puis relancez
                    l’analyse.
                  </p>
                </div>
              </div>
            )}
          </section>
          <aside>
            <div className="assistant-panel">
              <Sparkles />
              <h3>Faites le point avec l’IA</h3>
              <p>
                {cfg && !cfg.aiReady
                  ? "L’analyse automatique n’est pas encore ouverte. Renseignez vos rubriques directement dans « Mon dossier »."
                  : "Analysez les documents extraits pour préparer les rubriques et repérer les contradictions."}
              </p>
              {cfg && !cfg.aiReady ? (
                <button className="button" onClick={() => setTab("dossier")}>
                  Compléter mon dossier <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  className="button"
                  disabled={
                    busy ||
                    !d.documents.some((x: any) => x.status === "ready") ||
                    d.jobs.some(
                      (j: any) =>
                        j.kind === "analysis" &&
                        ["queued", "running"].includes(j.status),
                    )
                  }
                  onClick={() =>
                    run(async () => {
                      await api("/dossiers/" + id + "/analyze", "POST", {});
                      refresh();
                    }, "Analyse lancée")
                  }
                >
                  Analyser mes documents <ArrowRight size={15} />
                </button>
              )}
            </div>
            <div className="panel compact">
              <ShieldCheck />
              <h3>Attestation Fund Road</h3>
              <p>
                Les rubriques doivent être complètes et la version actuelle
                analysée, sans point bloquant.
              </p>
              <button
                className="button secondary"
                disabled={!d.attestable || busy}
                onClick={() =>
                  run(async () => {
                    const a = await api(
                      "/dossiers/" + id + "/attest",
                      "POST",
                      {},
                    );
                    setAttestation(a.url);
                    refresh();
                  })
                }
              >
                Obtenir l’attestation
              </button>
              {attestation && (
                <a href={attestation} target="_blank" rel="noreferrer">
                  Voir l’attestation <ExternalLink size={15} />
                </a>
              )}
              {d.attestations?.length > 0 && (
                <ul className="attestations">
                  {d.attestations.map((x: any) => (
                    <li key={x.id}>
                      <a href={"/verification/" + x.id} target="_blank" rel="noreferrer">
                        Attestation du {new Date(x.created_at).toLocaleDateString("fr")} (version {x.revision})
                      </a>
                      {x.revoked_at ? (
                        <Badge>Révoquée</Badge>
                      ) : (
                        <button
                          className="button secondary small"
                          disabled={busy}
                          onClick={() => setRevocation(x.id)}
                        >
                          Révoquer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
      {tab === "documents" && (
        <>
          <DepotAnalyse d={d} refresh={refresh} aiReady={!!cfg?.aiReady} />
          <div className="panel">
            {!d.documents.length ? (
              <Empty title="Aucun document pour le moment" />
            ) : (
              d.documents.map((doc: any) => (
                <div className="document-row" key={doc.id}>
                  <FileText />
                  <div>
                    <strong>{doc.name}</strong>
                    <small>
                      {Math.ceil(doc.bytes / 1024)} Ko ·{" "}
                      {doc.error ||
                        (
                          {
                            queued: "Extraction en attente",
                            ready: "Texte extrait",
                            failed: "Extraction à reprendre",
                          } as any
                        )[doc.status]}
                    </small>
                  </div>
                  <>
                    {doc.status === "failed" && (
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api(
                              "/documents/" + doc.id + "/retry",
                              "POST",
                              {},
                            );
                            refresh();
                          })
                        }
                      >
                        Réessayer
                      </button>
                    )}
                    <a
                      className="iconbutton"
                      href={"/api/documents/" + doc.id}
                      aria-label={"Télécharger " + doc.name}
                    >
                      <Download size={18} />
                    </a>
                  </>
                </div>
              ))
            )}
          </div>
        </>
      )}
      {(tab === "dossier" || tab === "questions") && (
        <div className="content-grid">
          <section>
            {tab === "dossier" && d.state.summary && (
              <div className="panel">
                <Badge>Synthèse IA · À relire</Badge>
                <h3>En quelques mots</h3>
                <p className="preline">{d.state.summary}</p>
              </div>
            )}
            {tab === "dossier" && (propositions.length > 0 || conflits > 0) && (
              <div className="panel">
                {conflits > 0 ? (
                  <p>
                    Résolvez les contradictions avant de confirmer en lot :{" "}
                    {conflits} contradiction{conflits > 1 ? "s" : ""} à
                    trancher dans les rubriques concernées.
                  </p>
                ) : (
                  <p>
                    {propositions.length} proposition
                    {propositions.length > 1 ? "s" : ""} de l’analyse relue
                    {propositions.length > 1 ? "s" : ""} : confirmez-les d’un
                    geste. Vos textes en cours de saisie ne sont pas modifiés.
                  </p>
                )}
                <button
                  className="button secondary"
                  disabled={busy || conflits > 0}
                  onClick={async () => {
                    const r = await run(() =>
                      api(`/dossiers/${id}/facts/confirm`, "POST", {
                        revision: d.revision,
                        ids: propositions,
                      }),
                    );
                    if (r?.confirmed) {
                      refresh();
                      toast(
                        `${r.confirmed} rubrique${r.confirmed > 1 ? "s" : ""} confirmée${r.confirmed > 1 ? "s" : ""}`,
                      );
                    }
                  }}
                >
                  <Check size={16} /> Confirmer les {propositions.length}{" "}
                  propositions relues
                </button>
              </div>
            )}
            {requirements
              .filter(
                (r) =>
                  tab === "dossier" ||
                  d.score.missing.some((m: any) => m.id === r.id),
              )
              .map((r) => (
                <FactEditor
                  key={r.id}
                  requirement={r}
                  fact={d.state.facts[r.id]}
                  critique={d.state.critique?.rubriques?.[r.id]}
                  save={async (value: string) => {
                    await api(`/dossiers/${id}/facts/${r.id}`, "PUT", {
                      revision: d.revision,
                      fact: {
                        value,
                        source: "declaration",
                        kind: "declared",
                        confirmed: true,
                      },
                    });
                    refresh();
                  }}
                />
              ))}
            {d.questions.map((q: any) => (
              <form
                className="panel"
                key={q.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(async () => {
                    await api("/questions/" + q.id, "PUT", {
                      answer: f.get("answer"),
                    });
                    refresh();
                  }, "Réponse enregistrée");
                }}
              >
                <Badge>Question du financeur</Badge>
                <h3>{q.body}</h3>
                <textarea
                  name="answer"
                  defaultValue={q.answer || ""}
                  required
                />
                <button className="button secondary" disabled={busy}>
                  Enregistrer ma réponse
                </button>
              </form>
            ))}
          </section>
          <aside className="panel compact sticky">
            <Sparkles />
            <h3>Précisez ce que vous savez.</h3>
            <p>
              Ajoutez les périodes, les unités et les hypothèses. Si une
              information manque, gardez la rubrique à compléter.
            </p>
            <strong>{d.score.percent} % complété</strong>
            <div className="bar">
              <span style={{ width: d.score.percent + "%" }} />
            </div>
          </aside>
        </div>
      )}
      {tab === "eligibility" && (
        <EligibilityTab dossier={d} refresh={refresh} />
      )}
      {tab === "share" && (
        <>
          <ShareForm dossier={d} />
          <ContributorInvite dossier={d} />
        </>
      )}
      <div className="job-log">
        {d.jobs.slice(0, 3).map((j: any) => (
          <span
            key={j.id}
            className={j.status === "failed" ? "error-text" : ""}
          >
            {libelleJob(j.kind, j.status)}
            {j.status === "failed" && j.error ? ` — ${j.error}` : ""}
          </span>
        ))}
      </div>
    </>
  );
}
const verdicts: Record<string, [string, string, string]> = {
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
function EligibilityTab({
  dossier: d,
  refresh,
}: {
  dossier: any;
  refresh: () => void;
}) {
  const { data: list } = useLoad<any[]>("/programs");
  const { data: cfg } = useLoad("/config");
  const { run, busy } = useAction();
  const [openId, setOpenId] = useState("");
  // recherche libre dans les programmes ; suggestions triées selon l'objectif du dossier
  const [recherche, setRecherche] = useState("");
  // réponses enregistrées depuis la dernière vérification : une seule relance les prend toutes
  const [enAttente, setEnAttente] = useState(0);
  const evals: any[] = d.evaluations;
  const current = evals.find((e) => e.program.id === openId) || evals[0];
  const analyzing = d.jobs.some(
    (j: any) =>
      j.kind === "analysis" && ["queued", "running"].includes(j.status),
  );
  const available = (list || []).filter(
    (x) => !evals.some((e) => e.program.id === x.id),
  );
  const suggestions = trierProgrammes(
    filtrerProgrammes(available, recherche),
    d.goal,
  ).slice(0, 8);
  const ajouter = (id: string) =>
    run(async () => {
      await api(`/dossiers/${d.id}/programs/${encodeURIComponent(id)}`, "PUT", {
        revision: d.revision,
      });
      setOpenId(id);
      setRecherche("");
      refresh();
    }, "Ajouté. Lancez la vérification.");
  const answered = (id: string) => d.state.declarations?.[id] || "";
  return (
    <div className="content-grid">
      <section>
        <div className="panel">
          <div className="section-title">
            <h2>Vos demandes de financement</h2>
            <button
              className="button small"
              disabled={
                busy || analyzing || !evals.length || !d.documents.length
              }
              onClick={async () => {
                const r = await run(async () => {
                  await api(`/dossiers/${d.id}/analyze`, "POST", {});
                  refresh();
                }, "Vérification lancée pour tous les programmes");
                if (r !== null) setEnAttente(0);
              }}
            >
              {analyzing ? "Vérification en cours…" : "Vérifier l’éligibilité"}
            </button>
          </div>
          <p>
            Évaluez le même dossier face à plusieurs subventions, prêts,
            concours ou financeurs. Chaque évaluation a son propre verdict.
          </p>
          {enAttente > 0 && (
            <p className="notice-line">
              {enAttente} réponse{enAttente > 1 ? "s" : ""} enregistrée
              {enAttente > 1 ? "s" : ""} : elles seront prises en compte au
              prochain clic sur « Vérifier l’éligibilité », une seule fois.
            </p>
          )}
          <label>
            Ajouter un programme ou un financeur
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom, opérateur, type…"
              aria-label="Rechercher un programme ou un financeur"
            />
          </label>
          {suggestions.length > 0 ? (
            <ul className="suggestions">
              {suggestions.map((x) => (
                <li key={x.id}>
                  <button
                    className="textbutton"
                    disabled={busy}
                    onClick={() => ajouter(x.id)}
                  >
                    {x.name}
                    <small>
                      {" "}
                      · {x.operator} · {x.kind}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              {recherche
                ? `Aucun programme ne correspond à « ${recherche} ».`
                : "Tous les programmes disponibles sont déjà ajoutés."}
            </p>
          )}
          {evals.length > 0 && (
            <div className="eval-list">
              {evals.map((e) => (
                <button
                  key={e.program.id}
                  className={
                    "eval-row " +
                    verdicts[e.score.verdict][0] +
                    (current?.program.id === e.program.id ? " active" : "")
                  }
                  onClick={() => setOpenId(e.program.id)}
                >
                  <span>
                    <strong>{e.program.name}</strong>
                    <small>
                      {e.program.operator} · {verdicts[e.score.verdict][1]}
                    </small>
                  </span>
                  <span className="eval-percent tnum">{e.score.percent} %</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {current && (
          <>
            <div className="panel">
              <div className="section-title">
                <h2>{current.program.name}</h2>
                <button
                  className="textbutton"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api(
                        `/dossiers/${d.id}/programs/${encodeURIComponent(current.program.id)}`,
                        "DELETE",
                        { revision: d.revision },
                      );
                      setOpenId("");
                      refresh();
                    }, "Programme retiré")
                  }
                >
                  Retirer
                </button>
              </div>
              <p>
                <strong>{current.program.kind}</strong> ·{" "}
                {current.program.amount}. {current.program.summary}
              </p>
              {current.program.sources.length > 0 && (
                <small>
                  Critères publics vérifiés le{" "}
                  {new Date(current.program.verifiedAt).toLocaleDateString(
                    "fr",
                  )}
                  {current.program.confidence === "secondaire" &&
                    " à partir de fiches de référence, à confirmer avec l’organisme"}
                  {" · "}
                  {current.program.sources.map((src: any, i: number) => (
                    <span key={src.url}>
                      {i > 0 && " · "}
                      <a href={src.url} target="_blank" rel="noreferrer">
                        {src.label}
                      </a>
                    </span>
                  ))}
                </small>
              )}
            </div>
            {current.program.handoff && cfg?.advisorOrg && (
              <div className="panel handoff">
                <Users />
                <h3>Faites déposer votre demande par un conseiller</h3>
                <p>
                  Une fois les critères vérifiés, transmettez ce dossier et vos
                  pièces à un conseiller Fund Road. Il vous recontacte pour
                  finaliser la demande auprès de l’organisme.
                </p>
                <button
                  className="button"
                  disabled={
                    busy ||
                    current.score.verdict === "ineligible" ||
                    !d.documents.length
                  }
                  onClick={() =>
                    run(async () => {
                      await api(`/dossiers/${d.id}/applications`, "POST", {
                        recipientOrg: cfg.advisorOrg,
                        documentIds: d.documents
                          .filter((x: any) => x.status === "ready")
                          .map((x: any) => x.id),
                        message: `Demande d’accompagnement : ${current.program.name}. Verdict Fund Road : ${verdicts[current.score.verdict][1]} (${current.score.percent} %).`,
                        confirmed: true,
                      });
                      refresh();
                    }, "Dossier transmis à un conseiller Fund Road")
                  }
                >
                  Transmettre à un conseiller <Send size={16} />
                </button>
                {current.score.verdict === "ineligible" && (
                  <small>
                    Levez d’abord le critère bloquant pour pouvoir transmettre.
                  </small>
                )}
              </div>
            )}
            {current.score.rows.map((c: any) => (
              <form
                className={"panel criterion " + c.result.status}
                key={current.program.id + c.id + ":" + d.revision}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const r = await run(async () => {
                    await api(
                      `/dossiers/${d.id}/declarations/${encodeURIComponent(c.id)}`,
                      "PUT",
                      { revision: d.revision, answer: f.get("answer") },
                    );
                    refresh();
                  }, "Réponse enregistrée");
                  if (r !== null) setEnAttente((n) => n + 1);
                }}
              >
                <div className="criterion-head">
                  <span className="criterion-status">
                    {c.result.status === "ok" ? (
                      <CheckCircle2 size={18} />
                    ) : c.result.status === "ko" ? (
                      <X size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                    {c.result.status === "ok"
                      ? "Rempli"
                      : c.result.status === "ko"
                        ? "Non rempli"
                        : "À vérifier"}
                  </span>
                  <h3>{c.label}</h3>
                  <Badge>
                    {c.blocking
                      ? "Critère d’éligibilité"
                      : "Pièce ou information"}
                  </Badge>
                </div>
                {c.result.note && <p>{c.result.note}</p>}
                {c.result.quote && (
                  <blockquote>
                    <small>
                      {c.result.source === "declaration"
                        ? "Votre déclaration"
                        : "Extrait de " +
                          (d.documents.find(
                            (x: any) => x.id === c.result.source,
                          )?.name || "votre document")}
                    </small>
                    « {c.result.quote} »
                  </blockquote>
                )}
                {c.result.status !== "ok" && (
                  <>
                    <label>
                      {c.question}
                      <textarea
                        name="answer"
                        defaultValue={answered(c.id)}
                        required
                        placeholder="Répondez avec des faits précis : dates, montants, effectifs."
                      />
                    </label>
                    <button className="button secondary small" disabled={busy}>
                      Enregistrer ma réponse
                    </button>
                  </>
                )}
              </form>
            ))}
          </>
        )}
      </section>
      <aside className="sticky">
        {current ? (
          <div
            className={
              "panel compact verdict " + verdicts[current.score.verdict][0]
            }
          >
            <small>{current.program.name}</small>
            <h3>{verdicts[current.score.verdict][1]}</h3>
            <p>{verdicts[current.score.verdict][2]}</p>
            <div className="bigscore">
              {current.score.percent}
              <span>%</span>
            </div>
            <p className="smalltext">
              {current.score.ok} critère{current.score.ok > 1 ? "s" : ""}{" "}
              vérifié{current.score.ok > 1 ? "s" : ""} sur {current.score.total}
            </p>
            <div className="bar">
              <span style={{ width: current.score.percent + "%" }} />
            </div>
            {current.score.blockers.length > 0 && (
              <p>
                Bloquant :{" "}
                {current.score.blockers.map((b: any) => b.label).join(", ")}.
              </p>
            )}
            <p className="smalltext">
              Évaluation indicative générée par IA à partir de vos documents et
              réponses. La décision appartient à l’organisme ou au financeur.
            </p>
          </div>
        ) : (
          <div className="panel compact">
            <ShieldCheck />
            <h3>Visez des financements précis.</h3>
            <p>
              Ajoutez une ou plusieurs subventions, prêts, concours ou
              financeurs : l’IA vérifie leurs critères dans vos documents et
              vous dit ce qui manque pour chacun.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
const statutsPoint = { ok: "Démontré", partiel: "Partiel", absent: "Absent" } as const;
// AI Act art. 50 : une information rédigée par l'IA et pas encore validée par la startup est signalée
const proposeParIA = (f: any) => Boolean(f && !f.confirmed && f.source !== "declaration");
// Revue d'une rubrique : niveau, points de contrôle, faiblesses, questions attendues, action prioritaire
function RegardInvestisseur({ c }: { c: CritiqueRubrique }) {
  return (
    <div className={"regard " + c.niveau}>
      <div className="regard-tete">
        <small>REGARD INVESTISSEUR · GÉNÉRÉ PAR IA</small>
        <Badge good={c.niveau === "solide"}>{niveaux[c.niveau]}</Badge>
      </div>
      {c.constats.length > 0 && (
        <ul className="regard-points">
          {c.constats.map((x) => (
            <li key={x.point} className={x.statut}>
              <strong>{statutsPoint[x.statut]}</strong> · {x.point}
              {x.note && <span> — {x.note}</span>}
            </li>
          ))}
        </ul>
      )}
      {c.faiblesses.length > 0 && (
        <p>
          <strong>À corriger : </strong>
          {c.faiblesses.join(" · ")}
        </p>
      )}
      {c.questions.length > 0 && (
        <p>
          <strong>Questions qu’on vous posera : </strong>
          {c.questions.join(" · ")}
        </p>
      )}
      {c.action && (
        <p className="regard-action">
          <strong>Action prioritaire : </strong>
          {c.action}
        </p>
      )}
    </div>
  );
}
// Lecture globale du dossier, sur la vue d'ensemble
function LectureInvestisseur({ c }: { c: Critique }) {
  const compte = Object.values(c.rubriques).reduce(
    (n: Record<string, number>, x) => ({ ...n, [x.niveau]: (n[x.niveau] || 0) + 1 }),
    {},
  );
  return (
    <div className="panel lecture">
      <div className="section-title">
        <h3>Lecture investisseur</h3>
        <Badge>Générée par IA · À relire</Badge>
        {c.stade && <Badge>Stade : {c.stade}</Badge>}
      </div>
      <p>{c.synthese}</p>
      <p className="lecture-niveaux">
        {(Object.keys(niveaux) as NiveauRubrique[])
          .filter((k) => compte[k])
          .map((k) => `${compte[k]} ${niveaux[k].toLowerCase()}`)
          .join(" · ")}
      </p>
      {c.priorites.length > 0 && (
        <>
          <h4>À traiter avant l’envoi</h4>
          <ol>
            {c.priorites.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </>
      )}
      {c.alertes.length > 0 && (
        <>
          <h4>Signaux d’alerte</h4>
          <ul>
            {c.alertes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      {c.forces.length > 0 && (
        <>
          <h4>Points forts</h4>
          <ul>
            {c.forces.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      <small>
        Relecture automatique par IA de la démonstration du dossier, sur le modèle
        d’un comité d’investissement. Elle ne juge ni les personnes ni vos
        chances de financement.
      </small>
    </div>
  );
}
function FactEditor({
  requirement: r,
  fact,
  critique,
  save,
}: {
  requirement: any;
  fact: any;
  critique?: CritiqueRubrique;
  save: (s: string) => Promise<void>;
}) {
  const { run, busy } = useAction();
  // texte tenu ici : une nouvelle révision ne doit pas effacer une saisie non confirmée
  const [valeur, setValeur] = useState(fact?.value || "");
  const [modifie, setModifie] = useState(false);
  useEffect(() => {
    if (!modifie) setValeur(fact?.value || "");
  }, [fact?.value]);
  return (
    <form
      className="panel fact-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const r = await run(
          () => save(String(f.get("value"))),
          "Information confirmée",
        );
        if (r !== null) setModifie(false);
      }}
    >
      <div className="section-title">
        <h3>{r.label}</h3>
        <Badge good={fact?.confirmed}>
          {fact?.confirmed
            ? "Confirmé"
            : proposeParIA(fact)
              ? "Proposé par l’IA · À confirmer"
              : fact
                ? "À confirmer"
                : "À compléter"}
        </Badge>
      </div>
      <p>{r.question}</p>
      <textarea
        name="value"
        value={valeur}
        onChange={(e) => {
          setValeur(e.target.value);
          setModifie(true);
        }}
        placeholder="Précisez vos informations, leurs dates et leurs hypothèses…"
        minLength={10}
        required
      />
      {fact?.quote && (
        <blockquote>
          <small>EXTRAIT SOURCE</small>
          {fact.quote}
        </blockquote>
      )}
      {fact?.details?.length > 0 && (
        <div className="complements">
          <small>COMPLÉMENTS TIRÉS DES DOCUMENTS</small>
          <ul>
            {fact.details.map((d: any) => (
              <li key={d.quote}>
                {d.kind === "hypothesis" && <Badge>Hypothèse</Badge>} {d.value}
                <blockquote>{d.quote}</blockquote>
              </li>
            ))}
          </ul>
        </div>
      )}
      {critique && <RegardInvestisseur c={critique} />}
      <button className="button secondary small" disabled={busy}>
        <Check size={16} /> Confirmer cette information
      </button>
    </form>
  );
}
function ContributorInvite({ dossier: d }: { dossier: any }) {
  const { org } = useContext(WorkspaceContext);
  const { run, busy } = useAction();
  if (org?.id !== d.organization_id || org.role !== "owner") return null;
  return (
    <form
      className="panel form-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            api("/invitations", "POST", {
              organizationId: d.organization_id,
              dossierId: d.id,
              email: f.get("email"),
              role: "editor",
            }),
          "Invitation envoyée",
        );
      }}
    >
      <h2>
        {org.kind === "startup"
          ? "Inviter un associé à compléter ce dossier"
          : "Inviter la startup à compléter ce dossier"}
      </h2>
      <p>
        Cette personne pourra compléter ce dossier uniquement. Elle ne rejoint
        pas l’équipe de votre organisation.
      </p>
      <label>
        Adresse email
        <input type="email" name="email" required />
      </label>
      <button className="button secondary" disabled={busy}>
        Inviter à collaborer
      </button>
    </form>
  );
}
function ShareForm({ dossier: d }: { dossier: any }) {
  const [portal, setPortal] = useState<{ id: string; name: string } | null>(
    () => {
      return d.recipient_org
        ? {
            id: d.recipient_org,
            name: d.criteria_snapshot.recipientName || "Financeur partenaire",
          }
        : storedRecipient();
    },
  );
  const { data: financers } = useLoad<any[]>("/directory");
  const { run, busy } = useAction();
  const navigate = useNavigate();
  // 12a : un dossier incomplet se partage ; seules les questions du destinataire bloquent
  const questionsEnAttente =
    d.recipientProgress.completed < d.recipientProgress.total;
  const manquantes = d.score.missing || [];
  const partageBloque = !d.score.attestable || questionsEnAttente;
  return (
    <form
      className="panel form-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(async () => {
          await api("/dossiers/" + d.id + "/applications", "POST", {
            recipientOrg: portal?.id || f.get("org") || undefined,
            recipientEmail:
              portal || f.get("org") ? undefined : f.get("email") || undefined,
            message: f.get("message"),
            documentIds: f.getAll("documents"),
            confirmed: true,
          });
          navigate("/app/candidatures");
        }, "Candidature enregistrée et transmise au destinataire");
      }}
    >
      <h2>Choisissez ce que vous partagez</h2>
      <p>
        Une copie datée de votre dossier sera transmise. Vos modifications
        futures ne sont pas partagées : le destinataire voit seulement le
        pourcentage d’avancement de votre dossier tant que le partage est actif.
      </p>
      <label>
        Financeur de l’annuaire
        {portal && (
          <p>
            Candidature pour <strong>{portal.name}</strong>{" "}
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setPortal(null);
                localStorage.removeItem("fundroad-recipient");
              }}
            >
              Changer
            </button>
          </p>
        )}
        <select name="org" disabled={!!portal}>
          <option value="">Choisir un financeur inscrit</option>
          {/* les fiches non inscrites ne reçoivent pas de dossier : canal officiel sur leur fiche */}
          {financers?.filter((o) => o.claimed).map((o) => (
            <option key={o.id} value={o.id}>
              {o.theme.name || o.name} · {orgKindLabels[o.kind]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ou adresse email du destinataire
        <input
          name="email"
          type="email"
          disabled={!!portal}
          placeholder="contact@fonds.fr"
        />
      </label>
      <label>
        Votre message
        <textarea
          name="message"
          placeholder="Présentez brièvement votre demande…"
        />
      </label>
      <fieldset>
        <legend>Pièces à joindre</legend>
        {d.documents.map((doc: any) => (
          <label className="checkbox" key={doc.id}>
            <input
              type="checkbox"
              name="documents"
              value={doc.id}
              defaultChecked={doc.status === "ready"}
            />
            {doc.name}
          </label>
        ))}
      </fieldset>
      <label className="checkbox">
        <input type="checkbox" required />
        Je confirme le destinataire et les pièces sélectionnées.
      </label>
      {manquantes.length > 0 && (
        <div className="notice">
          <p>
            Le partage demande les {d.score.total} rubriques confirmées :{" "}
            {d.score.completed} sur {d.score.total} aujourd’hui (
            {d.score.percent} %).
          </p>
          <ul>
            {manquantes.map((m: any) => (
              <li key={m.id}>
                <Link to={"/app/dossiers/" + d.id + "?onglet=dossier"}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {questionsEnAttente && (
        <p className="muted">
          Répondez aux questions du destinataire avant le partage.
        </p>
      )}
      <button className="button" disabled={busy || partageBloque}>
        Partager cette version <Send size={17} />
      </button>
    </form>
  );
}
function Directory({ embedded = false }: { embedded?: boolean }) {
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
const stageLabels: Record<string, string> = {
  new: "Nouveau",
  review: "En revue",
  meeting: "Rendez-vous",
  diligence: "Due diligence",
  invested: "En portefeuille",
  declined: "Refusé",
};
// Un incubateur sélectionne et accompagne : mêmes étapes enregistrées, autres mots
const stageLabelsIncubateur: Record<string, string> = {
  new: "Candidature",
  review: "En sélection",
  meeting: "Entretien",
  diligence: "Comité",
  invested: "En programme",
  declined: "Non retenu",
};
const etapes = (kind?: string) =>
  kind === "incubator" ? stageLabelsIncubateur : stageLabels;
// Logo téléversé, sinon initiales sur la couleur du financeur
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
const orgStyle = (o: any) =>
  (o.theme?.accent ? { "--org": o.theme.accent } : {}) as any;
const chips = (text = "") =>
  text
    .split(/[,;·]| et /)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? "s" : ""}`;
const orgKindLabels: Record<string, string> = {
  angel: "Business angel",
  fund: "Fonds",
  network: "Réseau de BA",
  grant: "Organisme public",
  incubator: "Incubateur",
};
function Pipeline() {
  const { org, me } = useContext(WorkspaceContext);
  const [tick, setTick] = useState(0),
    [filter, setFilter] = useState("all"),
    [recherche, setRecherche] = useState(""),
    [tri, setTri] = useState<TriPipeline>("date"),
    [invitation, setInvitation] = useState(false),
    [lienCopie, setLienCopie] = useState(false);
  const { data, error } = useLoad<any>(
    `/organizations/${org.id}/pipeline`,
    tick,
  );
  const { run, busy } = useAction();
  const toast = useContext(ToastContext);
  const rows: any[] = data?.rows || [];
  const active = rows.filter((r) => r.stage !== "declined");
  // filtre d'étape, recherche puis tri : l'export reprend exactement ces lignes
  const shown = trierPipeline(
    filtrerPipeline(
      rows.filter((r) => filter === "all" || r.stage === filter),
      recherche,
    ),
    tri,
  );
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
  const lien = location.origin + "/fonds/" + org.slug;
  // mise en route : les trois étapes qui rendent le pipeline utile
  const etapesFaites = [
    { fait: Boolean(data?.criteria), texte: "Renseignez vos critères d’investissement", to: "/app/portail" },
    { fait: Boolean(org.logo), texte: "Ajoutez le logo de votre organisation", to: "/app/portail" },
    { fait: rows.some((r) => r.source === "application"), texte: "Recevez une première candidature" },
  ];
  const reste = etapesFaites.filter((e) => !e.fait).length;
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setLienCopie(true);
      toast("Lien copié");
    } catch {
      toast("Copie impossible : sélectionnez le lien affiché à la main.");
    }
  };
  const exporter = () => {
    const url = URL.createObjectURL(
      new Blob([csvPipeline(shown)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipeline.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const inviter = (f: FormData) =>
    run(async () => {
      // un dossier au nom de la startup, puis l'invitation : un seul geste, pas d'organisation créée
      const d = await api("/dossiers", "POST", {
        organizationId: org.id,
        name: String(f.get("name")),
        goal: String(f.get("goal") || "investment"),
      });
      await api("/invitations", "POST", {
        organizationId: org.id,
        dossierId: d.id,
        email: String(f.get("email")),
        role: "editor",
      });
      setInvitation(false);
      setTick((t) => t + 1);
    }, "Dossier créé et invitation envoyée");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Bonjour {me.user.name.split(" ")[0]}</h1>
          <p>
            La complétude de chaque dossier reçu, son avancement depuis et son
            adéquation à vos critères.
          </p>
        </div>
        <div className="button-row">
          <button className="button secondary" onClick={copier}>
            <Link2 size={16} /> {lienCopie ? "Lien copié" : "Copier mon lien"}
          </button>
          <button
            className="button"
            onClick={() => setInvitation((x) => !x)}
          >
            <Plus size={16} /> Inviter une startup
          </button>
        </div>
      </div>
      <ErrorBox text={error} />
      {invitation && (
        <form
          className="panel form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            inviter(new FormData(e.currentTarget));
          }}
        >
          <h2>Inviter une startup</h2>
          <p>
            Le dossier est créé dans votre espace et l’invitation part dans le
            même geste. Aucune organisation n’est créée pour la startup.
          </p>
          <label>
            Nom de la startup
            <input name="name" required minLength={2} maxLength={150} />
          </label>
          <label>
            Objectif
            <select name="goal">
              <option value="investment">Investissement</option>
              <option value="grant">Subvention</option>
            </select>
          </label>
          <label>
            Adresse e-mail du contact
            <input name="email" type="email" required />
          </label>
          <div className="button-row">
            <button className="button" disabled={busy}>
              <Send size={16} /> Créer le dossier et inviter
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setInvitation(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      {reste > 0 && (
        <div className="panel">
          <div className="section-title">
            <h3>Mise en route</h3>
            <Badge>
              {etapesFaites.length - reste} / {etapesFaites.length}
            </Badge>
          </div>
          <ol className="mise-en-route">
            {etapesFaites.map((e) => (
              <li key={e.texte} className={e.fait ? "fait" : ""}>
                {e.fait ? <Check size={15} /> : <Clock size={15} />}
                {e.to ? <Link to={e.to}>{e.texte}</Link> : e.texte}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="stat-grid">
        <div>
          <span>Startups suivies</span>
          <strong>{active.length.toString().padStart(2, "0")}</strong>
          <small>Hors dossiers refusés</small>
        </div>
        <div>
          <span>Complétude moyenne</span>
          <strong>
            {avg(active.map((r) => r.score.percent))}
            <em>%</em>
          </strong>
          <small>Sur les neuf rubriques Fund Road</small>
        </div>
        <div>
          <span>Conformes à vos critères</span>
          <strong>
            {active
              .filter((r) => r.fit?.verdict.startsWith("eligible"))
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <small>
            {data?.criteria
              ? "Critères de votre portail vérifiés par l’IA"
              : "Renseignez vos critères pour activer ce suivi"}
          </small>
        </div>
      </div>
      <div className="tabs">
        {["all", ...Object.keys(etapes(org.kind))].map((k) => (
          <button
            key={k}
            className={filter === k ? "active" : ""}
            onClick={() => setFilter(k)}
          >
            {k === "all" ? "Tous" : etapes(org.kind)[k]}
            {(k === "all"
              ? rows.length
              : rows.filter((r) => r.stage === k).length) > 0 && (
              <span>
                {k === "all"
                  ? rows.length
                  : rows.filter((r) => r.stage === k).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="filtres">
        <input
          type="search"
          aria-label="Rechercher une startup"
          placeholder="Rechercher une startup…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select
          aria-label="Trier le pipeline"
          value={tri}
          onChange={(e) => setTri(e.target.value as TriPipeline)}
        >
          {trisPipeline.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
        <button className="button secondary" onClick={exporter} disabled={!shown.length}>
          <Download size={16} /> Exporter ({shown.length})
        </button>
      </div>
      {!shown.length ? (
        <div className="panel">
          <Empty title="Aucune startup ici pour le moment">
            Invitez une startup avec son nom et son e-mail : son dossier est
            créé et elle reçoit le lien d’accès.
          </Empty>
          <button className="button" onClick={() => setInvitation(true)}>
            <Plus size={16} /> Inviter une startup
          </button>
        </div>
      ) : (
        <div className="pipeline">
          <div className="pipeline-head" aria-hidden="true">
            <span>Startup</span>
            <span>Complétude</span>
            <span>Vos critères</span>
            <span>Étape</span>
          </div>
          {shown.map((r) => (
            <div className="pipeline-row" key={r.source + r.id}>
              <Link to={r.href} className="pipeline-name">
                <span className="company-icon small">
                  {(r.startup || r.name)[0]}
                </span>
                <span>
                  <strong>{r.startup || "Startup invitée"}</strong>
                  <small>
                    {r.name} ·{" "}
                    {r.source === "application"
                      ? "reçu le " +
                        new Date(r.created_at).toLocaleDateString("fr")
                      : "dossier ouvert par vous"}
                    {r.updated_since && " · mis à jour depuis"}
                  </small>
                </span>
              </Link>
              <span className="pipeline-metric">
                <strong className="tnum">{r.score.percent} %</strong>
                <span className="bar">
                  <span style={{ width: r.score.percent + "%" }} />
                </span>
                {r.progress > r.score.percent && (
                  <small>Aujourd’hui : {r.progress} %</small>
                )}
              </span>
              <span className="pipeline-metric">
                {r.fit && r.fit.ok + r.fit.blockers.length > 0 ? (
                  <>
                    <strong className="tnum">{r.fit.percent} %</strong>
                    <small>{verdicts[r.fit.verdict][1]}</small>
                  </>
                ) : (
                  <small>
                    {data?.criteria ? "Évaluation en cours" : "Aucun critère"}
                  </small>
                )}
              </span>
              {r.source === "application" ? (
                <select
                  aria-label={"Étape de " + (r.startup || r.name)}
                  value={r.stage}
                  disabled={busy}
                  onChange={(e) =>
                    run(async () => {
                      await api(`/applications/${r.id}/stage`, "PUT", {
                        stage: e.target.value,
                      });
                      setTick((t) => t + 1);
                    })
                  }
                >
                  {Object.entries(etapes(org.kind)).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge>En préparation</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function Applications() {
  const { data, error } = useLoad<any[]>("/applications");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Vos candidatures</h1>
          <p>
            Des versions datées et des échanges dédiés à chaque destinataire.
          </p>
        </div>
      </div>
      <ErrorBox text={error} />
      {!data?.length ? (
        <div className="panel">
          <Empty title="Aucune candidature partagée">
            Ouvrez un dossier puis choisissez Partager pour préparer votre
            première candidature.
          </Empty>
        </div>
      ) : (
        <div className="pipeline">
          <div className="pipeline-head" aria-hidden="true">
            <span>Candidature</span>
            <span>Destinataire</span>
            <span>Partagée le</span>
            <span>Statut</span>
          </div>
          {data.map((a) => (
            <Link className="pipeline-row" to={"/partages/" + a.id} key={a.id}>
              <span className="pipeline-name">
                <span className="company-icon small">{a.name[0]}</span>
                <strong>{a.name}</strong>
              </span>
              <span>
                {a.investor_name ||
                  a.recipient_email ||
                  "Organisation partenaire"}
              </span>
              <time dateTime={a.created_at}>
                {new Date(a.created_at).toLocaleDateString("fr")}
              </time>
              <Badge>
                {a.recipient_org
                  ? { ...etapes(a.recipient_kind), ...(a.recipient_kind !== "incubator" && { new: "Reçu" }) }[a.stage as string]
                  : a.status === "submitted"
                    ? "Envoyé"
                    : "Non envoyé"}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
// Formulaire des critères : listes fixes en cases à cocher, montants en euros, champs propres au type
function Cases({
  name,
  label,
  options,
  valeurs,
}: {
  name: string;
  label: string;
  options: readonly string[];
  valeurs: unknown;
}) {
  const choisis = Array.isArray(valeurs) ? valeurs : [];
  return (
    <fieldset className="cases">
      <legend>{label}</legend>
      {options.map((x) => (
        <label key={x}>
          <input
            type="checkbox"
            name={name}
            value={x}
            defaultChecked={choisis.includes(x)}
          />
          {x}
        </label>
      ))}
    </fieldset>
  );
}
function ChampsCriteres({ kind, c }: { kind: string; c: any }) {
  const d = c.details || {};
  return (
    <>
      <Cases
        name="sectors"
        label="Secteurs"
        options={secteurs}
        valeurs={c.sectors}
      />
      <Cases name="stages" label="Stades" options={stades} valeurs={c.stages} />
      <Cases
        name="regions"
        label="Zones"
        options={regions}
        valeurs={c.regions}
      />
      <div className="form-row">
        <label>
          Ticket minimum (€)
          <input
            name="ticketMin"
            type="number"
            min={0}
            step={1000}
            defaultValue={c.ticketMin ?? ""}
          />
        </label>
        <label>
          Ticket maximum (€)
          <input
            name="ticketMax"
            type="number"
            min={0}
            step={1000}
            defaultValue={c.ticketMax ?? ""}
          />
        </label>
      </div>
      {champsParType[kind as TypeFinanceur]?.map((f) => (
        <label key={f.key} className={f.type === "bool" ? "checkbox" : ""}>
          {f.type === "bool" && (
            <input
              type="checkbox"
              name={"d:" + f.key}
              defaultChecked={!!d[f.key]}
            />
          )}
          {f.label}
          {f.type === "choice" ? (
            <select name={"d:" + f.key} defaultValue={d[f.key] || ""}>
              <option value="">Non précisé</option>
              {f.options!.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === "bool" ? null : (
            <input
              name={"d:" + f.key}
              type={
                f.type === "number"
                  ? "number"
                  : f.type === "date"
                    ? "date"
                    : "text"
              }
              min={f.type === "number" ? 0 : undefined}
              defaultValue={d[f.key] ?? ""}
            />
          )}
        </label>
      ))}
      <label>
        Critères d’exclusion
        <input name="exclusions" defaultValue={c.exclusions || ""} />
      </label>
    </>
  );
}
function lireCriteres(f: FormData, kind: string) {
  const nombre = (v: FormDataEntryValue | null) => (v ? Number(v) : null);
  const lignes = (k: string) =>
    String(f.get(k) || "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  return {
    sectors: f.getAll("sectors"),
    stages: f.getAll("stages"),
    regions: f.getAll("regions"),
    ticketMin: nombre(f.get("ticketMin")),
    ticketMax: nombre(f.get("ticketMax")),
    exclusions: f.get("exclusions") || "",
    questions: lignes("questions"),
    documents: lignes("documents"),
    details: Object.fromEntries(
      (champsParType[kind as TypeFinanceur] || []).map((c) => {
        const v = f.get("d:" + c.key);
        return [
          c.key,
          c.type === "bool"
            ? v === "on"
            : c.type === "number"
              ? nombre(v)
              : v || null,
        ];
      }),
    ),
  };
}
function OrganizationPage() {
  const { org, refresh } = useContext(WorkspaceContext);
  const [tick, setTick] = useState(0);
  const { data: members } = useLoad<any[]>(
    "/organizations/" + org.id + "/members",
    tick,
  );
  const { run, busy } = useAction();
  // action en attente de confirmation : boîte de dialogue interne, jamais celle du navigateur
  const [confirmation, setConfirmation] = useState<
    { action: "owner" | "retrait"; membre: any } | null
  >(null);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Votre organisation</h1>
          <p>Un portail cohérent avec votre façon d’accompagner les projets.</p>
        </div>
        {org.kind !== "startup" && (
          <Link
            className="button secondary"
            to={"/fonds/" + org.slug}
            target="_blank"
          >
            Voir mon portail <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      <div className="content-grid">
        <form
          key={org.id}
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              await api("/organizations/" + org.id, "PUT", {
                theme: {
                  name: f.get("name"),
                  // startup : pas de couleur de portail, on garde la valeur existante
                  accent: f.get("accent") || org.theme.accent || "#eb743c",
                  intro: f.get("intro"),
                },
                // startup : aucun critère à enregistrer, ceux du financeur restent intacts
                ...(org.kind !== "startup" && {
                  criteria: lireCriteres(f, org.kind),
                }),
              });
              refresh();
            }, "Organisation mise à jour");
          }}
        >
          <h2>Identité du portail</h2>
          <label>
            Nom affiché
            <input
              name="name"
              defaultValue={org.theme.name || org.name}
              required
            />
          </label>
          <label>
            Présentation
            <textarea name="intro" defaultValue={org.theme.intro || ""} />
          </label>
          {/* thèse, critères, questions, pièces et couleur du portail : financeurs seulement */}
          {org.kind !== "startup" && (
            <>
              <label>
                Couleur d’accent
                <input
                  type="color"
                  name="accent"
                  defaultValue={org.theme.accent || "#eb743c"}
                />
              </label>
              <h2>Thèse et critères</h2>
              <ChampsCriteres kind={org.kind} c={org.criteria} />
              <label>
                Questions spécifiques — une par ligne
                <textarea
                  name="questions"
                  defaultValue={(org.criteria.questions || []).join("\n")}
                />
              </label>
              <label>
                Pièces demandées — une par ligne
                <textarea
                  name="documents"
                  placeholder={
                    "Pitch deck\nPrévisionnel financier sur 3 ans\nTable de capitalisation"
                  }
                  defaultValue={(org.criteria.documents || []).join("\n")}
                />
              </label>
            </>
          )}
          <button className="button" disabled={busy || org.role !== "owner"}>
            Enregistrer <Check size={16} />
          </button>
        </form>
        <aside>
          <div className="panel">
            <h3>Votre équipe</h3>
            {members?.map((m) => (
              <div className="member-row" key={m.user_id}>
                <span className="avatar">{m.name?.[0]}</span>
                <div>
                  <strong>{m.name}</strong>
                  <small>
                    {m.email} · {libellesRoles[m.role] || m.role}
                  </small>
                </div>
                {m.role !== "owner" && org.role === "owner" && (
                  <button
                    className="button secondary small rendre-proprietaire"
                    onClick={() =>
                      setConfirmation({ action: "owner", membre: m })
                    }
                  >
                    Rendre propriétaire
                  </button>
                )}
                {m.role !== "owner" && org.role === "owner" && (
                  <button
                    className="iconbutton"
                    aria-label={"Retirer " + m.name}
                    onClick={() =>
                      setConfirmation({ action: "retrait", membre: m })
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                run(
                  () =>
                    api("/invitations", "POST", {
                      organizationId: org.id,
                      email: f.get("email"),
                      role: f.get("role"),
                    }),
                  "Invitation envoyée",
                );
              }}
            >
              <label>
                Inviter un collaborateur
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="prenom@organisation.fr"
                />
              </label>
              <label>
                Rôle
                <select name="role">
                  <option value="editor">Éditeur</option>
                  <option value="reviewer">Lecteur / analyste</option>
                </select>
              </label>
              <button
                className="button secondary"
                disabled={busy || org.role !== "owner"}
              >
                <Plus size={16} /> Inviter
              </button>
            </form>
          </div>
          {org.kind !== "startup" && (
            <div className="panel logo-panel">
              <h3>Logo</h3>
              <OrgLogo o={org} size="lg" />
              <label className="button secondary">
                <Upload size={16} /> {org.logo ? "Changer" : "Ajouter"} le logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  disabled={busy || org.role !== "owner"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const body = new FormData();
                    body.append("file", file);
                    run(async () => {
                      await api(`/organizations/${org.id}/logo`, "POST", body);
                      refresh();
                    }, "Logo mis à jour");
                  }}
                />
              </label>
              <small>
                PNG, JPEG ou WebP, 1 Mo maximum. Format carré conseillé.
              </small>
            </div>
          )}
          <div className="panel compact">
            <Globe />
            <h3>Domaine personnalisé</h3>
            <p>
              Le raccordement d’un domaine est accompagné : vérification de
              propriété, HTTPS et configuration des sessions avant activation.
            </p>
          </div>
        </aside>
      </div>
      {confirmation && (
        <ConfirmDialog
          texte={
            confirmation.action === "owner"
              ? `Rendre ${confirmation.membre.name} propriétaire de ${org.name} ? Vous deviendrez éditeur.`
              : `Retirer ${confirmation.membre.name} de l’équipe de ${org.name} ? Cette personne perdra l’accès aux dossiers de l’organisation.`
          }
          confirmer={
            confirmation.action === "owner"
              ? "Rendre propriétaire"
              : "Retirer ce membre"
          }
          busy={busy}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            run(async () => {
              if (confirmation.action === "owner") {
                await api(`/organizations/${org.id}/owner`, "PUT", {
                  userId: confirmation.membre.user_id,
                });
                location.reload();
                return;
              }
              await api(
                `/organizations/${org.id}/members/${confirmation.membre.user_id}`,
                "DELETE",
              );
              setConfirmation(null);
              setTick((t) => t + 1);
            })
          }
        />
      )}
    </>
  );
}
function Partners() {
  const { org } = useContext(WorkspaceContext);
  const [tick, setTick] = useState(0);
  const { data, error } = useLoad("/partners/" + org.id, tick);
  const { run, busy } = useAction();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {org.kind === "startup"
              ? "Parrainez une startup"
              : "Votre partenariat Fund Road"}
          </h1>
          <p>
            {org.kind === "startup"
              ? "Une réduction pour elle, un avantage pour votre prochain achat."
              : "Les commissions sont rattachées à votre organisation, jamais à ses salariés."}
          </p>
        </div>
      </div>
      <ErrorBox text={error} />
      <div className="content-grid">
        <section className="panel">
          <Gift />
          <h2>Votre code de recommandation</h2>
          {data?.codes.map((c: any) => (
            <div className="referral-card" key={c.code}>
              <Badge>
                {c.active && c.approved ? "Actif" : "En attente d’activation"}
              </Badge>
              <strong>{c.code}</strong>
              <p>Conditions : {c.version}</p>
              <button
                className="button secondary"
                onClick={() =>
                  run(
                    () =>
                      navigator.clipboard.writeText(
                        window.location.origin + "/inscription?code=" + c.code,
                      ),
                    "Lien copié",
                  )
                }
              >
                <Link2 size={16} /> Copier le lien
              </button>
            </div>
          ))}
          {!data?.codes.length && (
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await api("/partners/" + org.id, "POST", {});
                  setTick((t) => t + 1);
                })
              }
            >
              Préparer mon code <Plus size={16} />
            </button>
          )}
          <p className="muted">
            Les conditions et avantages doivent être activés avant utilisation
            commerciale.
          </p>
        </section>
        <aside className="panel">
          <h3>Vos avantages</h3>
          {!data?.rewards.length ? (
            <p>Aucun avantage acquis pour le moment.</p>
          ) : (
            data.rewards.map((r: any) => (
              <div className="sample-row" key={r.id}>
                <span>
                  {r.kind === "commission"
                    ? "Commission organisation"
                    : "Remise prochain achat"}
                </span>
                <strong>{(r.amount_cents / 100).toFixed(2)} €</strong>
                <small>{r.terms_version || "Conditions à vérifier"}</small>
                <Badge>{libelleRecompense(r.status)}</Badge>
              </div>
            ))
          )}
          <p className="muted">
            Les remboursements et délais prévus par le programme sont pris en
            compte.
          </p>
        </aside>
      </div>
    </>
  );
}
function Billing() {
  const { org } = useContext(WorkspaceContext);
  const { data: offers } = useLoad<any[]>("/offers");
  const { data: billing, error } = useLoad("/billing/" + org.id);
  const { run, busy } = useAction();
  // Page de retour de Stripe : mesurée une seule fois par arrivée. Ce n'est PAS une confirmation de paiement (le webhook en fait foi).
  useEffect(() => {
    if (new URLSearchParams(location.search).get("success") !== "1") return;
    if (!firstTime("paiement-ok")) return;   // un rechargement ne compte pas deux fois (mémoire ; sessionStorage après consentement)
    track("paiement_retour");
  }, []);
  const [code, setCode] = useState(
    localStorage.getItem("fundroad-code") || "",
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Offre et facturation</h1>
          <p>
            Paiement sécurisé par Stripe. Aucune commission sur les
            financements obtenus.
          </p>
        </div>
        {/* le portail Stripe n'existe qu'une fois un paiement enregistré */}
        {billing?.entitlement?.customer_id && (
          <button
            className="button secondary"
            onClick={() =>
              run(async () => {
                const r = await api("/billing/portal", "POST", {
                  organizationId: org.id,
                });
                window.location.assign(r.url);
              })
            }
          >
            Gérer ma facturation
          </button>
        )}
      </div>
      <ErrorBox text={error} />
      <div className="panel">
        <div className="section-title">
          <h3>
            {org.kind !== "startup"
              ? "Gratuit pendant le lancement"
              : billing?.entitlement?.offer_name || "Découverte"}
          </h3>
          <Badge>
            {billing?.entitlement
              ? libelleDroit(billing.entitlement.status)
              : "Gratuite"}
          </Badge>
        </div>
        <p>
          {billing?.usage?.analyses || 0} analyse(s) ce mois-ci
          {billing?.entitlement?.quota ? ` sur ${billing.entitlement.quota}` : ""}
          {billing?.entitlement?.expires_at &&
            ` · accès jusqu’au ${new Date(billing.entitlement.expires_at).toLocaleDateString("fr")}`}
          .
        </p>
      </div>
      <div className="pricing-grid">
        {offers
          ?.filter((o) => org.kind === "startup" && o.id === "dossier")
          .map((o) => (
            <div className="price-card" key={o.id}>
              <Badge>{o.active ? "Disponible" : "Ouverture prochaine"}</Badge>
              <h3>{o.label}</h3>
              <div className="price">
                {o.price_cents / 100} €
              </div>
              <p>{o.cadence === "month" ? "Par mois" : o.cadence === "quarter" ? "Tous les 90 jours, résiliable à tout moment" : "Forfait 90 jours"}</p>
              <label>
                Code de recommandation
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="START-… ou FUND-…"
                />
              </label>
              <button
                disabled={!o.active || busy}
                className="button secondary"
                onClick={() =>
                  run(async () => {
                    const r = await api("/billing/checkout", "POST", {
                      organizationId: org.id,
                      offerId: o.id,
                      code: code || undefined,
                    });
                    track("checkout_ouvert");   // session ouverte côté serveur ; ni offre ni montant envoyés
                    window.location.assign(r.url);
                  })
                }
              >
                Choisir cette offre
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
// QR code de l'URI TOTP : la bibliothèque n'est chargée qu'à l'ouverture du réglage,
// et la clé ne quitte jamais le navigateur (aucun service externe).
function CodeQR({ uri }: { uri: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let actif = true;
    import("qrcode")
      .then((m) =>
        m.toString(uri, { type: "svg", margin: 1, width: 220 }).then((svg) => {
          if (actif)
            setSrc("data:image/svg+xml;utf8," + encodeURIComponent(svg));
        }),
      )
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [uri]);
  return src ? (
    <img
      src={src}
      width={220}
      height={220}
      alt="QR code à scanner avec votre application d’authentification"
    />
  ) : (
    <p className="muted">Préparation du QR code…</p>
  );
}
function Security() {
  const { me } = useContext(WorkspaceContext);
  const { run, busy } = useAction();
  const [setup, setSetup] = useState<any>(null);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Sécurité</h1>
          <p>Protégez l’accès à vos documents et à votre organisation.</p>
        </div>
      </div>
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(async () => {
            setSetup(
              await api("/auth/two-factor/enable", "POST", {
                password: f.get("password"),
                issuer: "Fund Road",
              }),
            );
          });
        }}
      >
        <ShieldCheck />
        <h2>Double authentification</h2>
        <Badge good={me.user.twoFactorEnabled}>
          {me.user.twoFactorEnabled ? "Activée" : "À configurer"}
        </Badge>
        <label>
          Confirmez votre mot de passe
          <input name="password" type="password" required />
        </label>
        <button className="button" disabled={busy}>
          Configurer
        </button>
        {setup && (
          <>
            <p>
              Scannez ce QR code avec votre application d’authentification.
              Conservez vos codes de secours dans un endroit sûr.
            </p>
            <CodeQR uri={setup.totpURI} />
            <details>
              <summary>Ou saisir la clé à la main</summary>
              <code className="breakall">{setup.totpURI}</code>
            </details>
            <pre>{setup.backupCodes?.join("\n")}</pre>
            <Link to="/double-auth">Confirmer avec un code →</Link>
          </>
        )}
      </form>
      <ChangerNom />
      <ChangerMotDePasse />
      <SupprimerCompte />
    </>
  );
}
// Nom affiché dans l'espace et les e-mails
function ChangerNom() {
  const { me, refresh } = useContext(WorkspaceContext);
  const { run, busy } = useAction();
  return (
    <form
      className="panel form-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(async () => {
          await api("/auth/update-user", "POST", { name: f.get("name") });
          refresh();
        }, "Nom mis à jour");
      }}
    >
      <h2>Votre nom</h2>
      <p>Il apparaît dans votre espace et dans les messages envoyés par Fund Road.</p>
      <label>
        Nom affiché
        <input
          name="name"
          defaultValue={me.user.name || ""}
          required
          minLength={2}
          maxLength={100}
        />
      </label>
      <button className="button secondary" disabled={busy}>
        Enregistrer mon nom
      </button>
    </form>
  );
}
// Mot de passe : better-auth vérifie l'ancien avant d'accepter le nouveau
function ChangerMotDePasse() {
  const { run, busy } = useAction();
  const [fait, setFait] = useState(false);
  return (
    <form
      className="panel form-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const formulaire = e.currentTarget;
        run(async () => {
          await api("/auth/change-password", "POST", {
            currentPassword: f.get("currentPassword"),
            newPassword: f.get("newPassword"),
          });
          formulaire.reset();
          setFait(true);
        }, "Mot de passe changé");
      }}
    >
      <h2>Changer de mot de passe</h2>
      {fait && <p className="muted">Mot de passe mis à jour.</p>}
      <label>
        Mot de passe actuel
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      <label>
        Nouveau mot de passe
        <input
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
        />
        <small>12 caractères minimum.</small>
      </label>
      <button className="button secondary" disabled={busy}>
        Changer mon mot de passe
      </button>
    </form>
  );
}
const libellesRoles: Record<string, string> = {
  owner: "Propriétaire",
  editor: "Éditeur",
  reviewer: "Relecteur",
};
function SupprimerCompte() {
  const { run, busy } = useAction();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  return (
    <>
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setMotDePasse(String(f.get("password")));
          setConfirmation(true);
        }}
      >
        <h2>Supprimer mon compte</h2>
        <p>
          Vos dossiers, documents, versions et partages sont effacés. Les
          factures sont conservées pour les obligations comptables. Si vous
          possédez une organisation avec d’autres membres, transférez-en d’abord
          la propriété depuis la page Mon organisation.
        </p>
        <label>
          Confirmez votre mot de passe
          <input name="password" type="password" required />
        </label>
        <button className="button secondary" disabled={busy}>
          Supprimer mon compte
        </button>
      </form>
      {confirmation && (
        <ConfirmDialog
          texte="Supprimer définitivement votre compte, vos dossiers et leurs documents ? Cette action est irréversible."
          confirmer="Supprimer mon compte"
          busy={busy}
          onCancel={() => setConfirmation(false)}
          onConfirm={() =>
            run(async () => {
              await api("/me/delete", "POST", { password: motDePasse });
              location.href = "/";
            })
          }
        />
      )}
    </>
  );
}
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
function SharedApplication({ embedded = false }: { embedded?: boolean }) {
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
    if (choix === "oui") chargerAnalytics();
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
        Nous mesurons l’audience du site avec Google Analytics, uniquement si
        vous l’acceptez. <Link to="/confiance">En savoir plus</Link>
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
          <Route path="/app/*" element={<Shell />} />
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
createRoot(document.getElementById("root")!).render(<Root />);
