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
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
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
  stades,
  types,
  type TypeFinanceur,
} from "../shared/criteria";
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
  if (!r.ok)
    throw new Error(
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
function useAction() {
  const toast = useContext(ToastContext);
  const [busy, setBusy] = useState(false);
  return {
    busy,
    run: async (fn: () => Promise<any>, success?: string) => {
      setBusy(true);
      try {
        const r = await fn();
        if (success) toast(success);
        return r;
      } catch (e: any) {
        toast(e.message);
        return null;
      } finally {
        setBusy(false);
      }
    },
  };
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
}: {
  children: ReactNode;
  gsapPage?: boolean;
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
            <Link className="button small accent" to="/inscription">
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
      <footer>
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
      </footer>
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
                  <Link className="button accent" to="/inscription">
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
                  <Link className="button accent" to="/inscription?profil=financeur">
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
        "Dossier de financement, même incomplet",
        "Dépôt de vos pièces",
        "Annuaire et envoi aux financeurs",
        "Une analyse IA offerte chaque mois",
      ],
      cta: "Commencer gratuitement",
    },
    {
      badge: "Startups",
      label: dossier?.label || "Dossier financement",
      price: dossier ? dossier.price_cents / 100 + " €" : "—",
      unit: " HT / 90 jours",
      features: [
        "Analyses IA de vos documents",
        "Critères des aides et des financeurs",
        "Exports PDF et Word",
        "Partages révocables et suivi des étapes",
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
                to="/inscription"
              >
                {p.cta} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        <p className="muted">
          Aucune commission sur les levées ni sur les subventions obtenues.
        </p>
      </main>
    </PublicLayout>
  );
}
const profilInscription = () => {
  try {
    return sessionStorage.getItem("fundroad-profil") || "startup";
  } catch {
    return "startup";
  }
};
function AuthPage() {
  const location = useLocation(),
    signup = location.pathname === "/inscription",
    navigate = useNavigate();
  // arrivée depuis la page Financeurs : type d'organisation présélectionné ensuite
  if (new URLSearchParams(location.search).get("profil") === "financeur")
    try {
      sessionStorage.setItem("fundroad-profil", "fund");
    } catch {}
  const { run, busy } = useAction();
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    const result = await run(async () => {
      const r = await api(
        signup ? "/auth/sign-up/email" : "/auth/sign-in/email",
        "POST",
        {
          name: f.get("name"),
          email: f.get("email"),
          password: f.get("password"),
        },
      );
      if (r.twoFactorRedirect) {
        navigate("/double-auth");
        return null;
      }
      return r;
    });
    if (result) navigate("/app");
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
        <form className="auth-card" onSubmit={submit}>
          <Badge>
            {signup ? "Bienvenue sur Fund Road" : "Heureux de vous retrouver"}
          </Badge>
          <h2>{signup ? "Créer votre compte" : "Se connecter"}</h2>
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
const links = [
  ["/app", "Vue d’ensemble", LayoutDashboard],
  ["/app/dossiers", "Mes dossiers", FolderOpen],
  ["/app/candidatures", "Candidatures", Send],
  ["/app/annuaire", "Annuaire", Search],
  ["/app/portail", "Mon organisation", Building2],
  ["/app/partenaires", "Recommandations", Gift],
  ["/app/facturation", "Facturation", CreditCard],
  ["/app/securite", "Sécurité", ShieldCheck],
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
          <div className="workspace-switch">
            <span className="company-icon small">{org?.name?.[0] || "+"}</span>
            <select
              aria-label="Organisation active"
              value={org?.id || ""}
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
          <small className="nav-label">VOTRE ESPACE</small>
          <nav>
            {links.map(([to, label, Icon]) => (
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
              <Onboarding />
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
          run(async () => {
            await api("/organizations", "POST", {
              name: f.get("name"),
              kind: f.get("kind"),
            });
            refresh();
          });
        }}
      >
        <label>
          Nom de votre organisation
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
        <button disabled={busy} className="button">
          Créer mon espace <ArrowRight size={16} />
        </button>
      </form>
    </>
  );
}
function storedRecipient(): { id: string; name: string } | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem("fundroad-recipient") || "null",
    );
    return value?.id && value?.name ? value : null;
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
              sessionStorage.removeItem("fundroad-recipient");
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
          rows.map((d) => (
            <Link
              to={"/app/dossiers/" + d.id}
              className="dossier-card"
              key={d.id}
            >
              <div className="dossier-top">
                <span className="company-icon">{d.name[0]}</span>
                <div>
                  <h3>{d.name}</h3>
                  <small>
                    {d.goal === "grant" ? "Subvention" : "Investissement"} · Mis
                    à jour le {new Date(d.updated_at).toLocaleDateString("fr")}
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
              <div className="dossier-bottom">
                <span>
                  {d.score.completed} rubriques confirmées sur {d.score.total}
                </span>
                <span>
                  Continuer <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
    </>
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
  // nombre de documents attendus avant de lancer l'analyse (0 : rien en attente)
  const [auto, setAuto] = useState(0);
  const [survol, setSurvol] = useState(false);
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
  // analyse lancée seule dès que tous les documents déposés sont visibles et lus
  useEffect(() => {
    if (!auto || envoi || docs.length < auto || enLecture || analyseEnCours)
      return;
    setAuto(0);
    if (!aiReady || !docs.some((x) => x.status === "ready")) return;
    api("/dossiers/" + d.id + "/analyze", "POST", {})
      .then(refresh)
      .catch((e) => toast(e.message));
  }, [auto, envoi, docs.length, enLecture, analyseEnCours]);
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
    setAuto(docs.length + deposes);
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
  } else if (auto) {
    pct = 35;
    etape = "Lancement de l’analyse";
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
          documents maximum. L’analyse se lance automatiquement.
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
    [tab, setTab] = useState("overview"),
    [attestation, setAttestation] = useState("");
  const { data: d, error } = useLoad("/dossiers/" + id, tick);
  const { data: cfg } = useLoad("/config");
  const { run, busy } = useAction();
  const { org } = useContext(WorkspaceContext);
  const navigate = useNavigate();
  const refresh = () => setTick((t) => t + 1);
  useEffect(() => {
    if (
      !d?.jobs.some((j: any) => ["queued", "running"].includes(j.status)) &&
      !d?.documents.some((x: any) => x.status === "queued")
    )
      return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [d]);
  if (!d) return <ErrorBox text={error || "Chargement…"} />;
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
          {org.role === "owner" && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                confirm(
                  `Supprimer définitivement « ${d.name} », ses documents, ses versions et ses partages ? Cette action est irréversible.`,
                ) &&
                run(async () => {
                  await api("/dossiers/" + id, "DELETE");
                  navigate("/app/dossiers");
                }, "Dossier supprimé")
              }
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
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
                          onClick={() =>
                            confirm("Révoquer cette attestation ? Sa page publique l’indiquera.") &&
                            run(async () => {
                              await api("/attestations/" + x.id + "/revoke", "POST", {});
                              refresh();
                            })
                          }
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
            {requirements
              .filter(
                (r) =>
                  tab === "dossier" ||
                  d.score.missing.some((m: any) => m.id === r.id),
              )
              .map((r) => (
                <FactEditor
                  key={r.id + ":" + d.revision}
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
            {j.kind === "analysis" ? "Analyse IA" : "Extraction"} :{" "}
            {j.status === "done"
              ? "terminée"
              : j.status === "running"
                ? "en cours"
                : j.status === "queued"
                  ? "en attente"
                  : j.error}
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
  const evals: any[] = d.evaluations;
  const current = evals.find((e) => e.program.id === openId) || evals[0];
  const analyzing = d.jobs.some(
    (j: any) =>
      j.kind === "analysis" && ["queued", "running"].includes(j.status),
  );
  const available = (list || []).filter(
    (x) => !evals.some((e) => e.program.id === x.id),
  );
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
              onClick={() =>
                run(async () => {
                  await api(`/dossiers/${d.id}/analyze`, "POST", {});
                  refresh();
                }, "Vérification lancée pour tous les programmes")
              }
            >
              {analyzing ? "Vérification en cours…" : "Tout vérifier"}
            </button>
          </div>
          <p>
            Évaluez le même dossier face à plusieurs subventions, prêts,
            concours ou financeurs. Chaque évaluation a son propre verdict.
          </p>
          <label>
            Ajouter un programme ou un financeur
            <select
              value=""
              disabled={busy}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                run(async () => {
                  await api(
                    `/dossiers/${d.id}/programs/${encodeURIComponent(id)}`,
                    "PUT",
                    { revision: d.revision },
                  );
                  setOpenId(id);
                  refresh();
                }, "Ajouté. Lancez la vérification.");
              }}
            >
              <option value="">Choisir…</option>
              {[
                "Subvention",
                "Prêt",
                "Concours",
                "Subvention et fonds propres",
              ].map((kind) => (
                <optgroup
                  key={kind}
                  label={
                    kind === "Subvention et fonds propres"
                      ? "Financeurs et programmes en fonds propres"
                      : kind + "s"
                  }
                >
                  {available
                    .filter((x) => x.kind === kind)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name} · {x.operator}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
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
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(async () => {
                    await api(
                      `/dossiers/${d.id}/declarations/${encodeURIComponent(c.id)}`,
                      "PUT",
                      { revision: d.revision, answer: f.get("answer") },
                    );
                    refresh();
                  }, "Réponse enregistrée. Relancez la vérification pour la prendre en compte.");
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
              Évaluation indicative à partir de vos documents et réponses. La
              décision appartient à l’organisme ou au financeur.
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
// Revue d'une rubrique : niveau, points de contrôle, faiblesses, questions attendues, action prioritaire
function RegardInvestisseur({ c }: { c: CritiqueRubrique }) {
  return (
    <div className={"regard " + c.niveau}>
      <div className="regard-tete">
        <small>REGARD INVESTISSEUR</small>
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
        Relecture automatique de la démonstration du dossier, sur le modèle
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
  return (
    <form
      className="panel fact-card"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() => save(String(f.get("value"))), "Information confirmée");
      }}
    >
      <div className="section-title">
        <h3>{r.label}</h3>
        <Badge good={fact?.confirmed}>
          {fact?.confirmed ? "Confirmé" : fact ? "À confirmer" : "À compléter"}
        </Badge>
      </div>
      <p>{r.question}</p>
      <textarea
        name="value"
        defaultValue={fact?.value || ""}
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
  if (org.id !== d.organization_id || org.role !== "owner") return null;
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
      <h2>Inviter la startup à compléter ce dossier</h2>
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
  const incomplete =
    !d.score.attestable ||
    d.recipientProgress.completed < d.recipientProgress.total;
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
                sessionStorage.removeItem("fundroad-recipient");
              }}
            >
              Changer
            </button>
          </p>
        )}
        <select name="org" disabled={!!portal}>
          <option value="">Choisir un financeur inscrit</option>
          {financers?.map((o) => (
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
            <input type="checkbox" name="documents" value={doc.id} />
            {doc.name}
          </label>
        ))}
      </fieldset>
      <label className="checkbox">
        <input type="checkbox" required />
        Je confirme le destinataire et les pièces sélectionnées.
      </label>
      {incomplete && (
        <p className="muted">
          Confirmez les neuf rubriques et répondez aux questions du destinataire
          avant le partage.
        </p>
      )}
      <button className="button" disabled={busy || incomplete}>
        Partager cette version <Send size={17} />
      </button>
    </form>
  );
}
function Directory({ embedded = false }: { embedded?: boolean }) {
  const { data, error } = useLoad<any[]>("/directory");
  const [search, setSearch] = useState("");
  const [f, setF] = useState({ type: "", secteur: "", stade: "", region: "" });
  const rows = data?.filter(
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
  if (f.secteur && rows)
    rows.sort(
      (a, b) =>
        Number(!(a.criteria?.sectors || []).includes(f.secteur)) -
        Number(!(b.criteria?.sectors || []).includes(f.secteur)),
    );
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
      </div>
      <ErrorBox text={error} />
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
                    <dd>{resume(o.criteria).ticket || "À préciser"}</dd>
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
    [filter, setFilter] = useState("all");
  const { data, error } = useLoad<any>(
    `/organizations/${org.id}/pipeline`,
    tick,
  );
  const { run, busy } = useAction();
  const rows: any[] = data?.rows || [];
  const active = rows.filter((r) => r.stage !== "declined");
  const shown = rows.filter((r) => filter === "all" || r.stage === filter);
  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
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
          <Link className="button secondary" to="/app/portail">
            Mes critères
          </Link>
          <Link className="button" to={"/fonds/" + org.slug} target="_blank">
            Mon lien de candidature <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <ErrorBox text={error} />
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
      {!shown.length ? (
        <div className="panel">
          <Empty title="Aucune startup ici pour le moment">
            Partagez le lien de votre portail ou invitez une startup à compléter
            son dossier.
          </Empty>
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
                  accent: f.get("accent"),
                  intro: f.get("intro"),
                },
                criteria: lireCriteres(f, org.kind),
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
            Couleur d’accent
            <input
              type="color"
              name="accent"
              defaultValue={org.theme.accent || "#eb743c"}
            />
          </label>
          <label>
            Présentation
            <textarea name="intro" defaultValue={org.theme.intro || ""} />
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
                      confirm(
                        `Rendre ${m.name} propriétaire de ${org.name} ? Vous deviendrez éditeur.`,
                      ) &&
                      run(async () => {
                        await api(`/organizations/${org.id}/owner`, "PUT", {
                          userId: m.user_id,
                        });
                        location.reload();
                      })
                    }
                  >
                    Rendre propriétaire
                  </button>
                )}
                {m.role !== "owner" && org.role === "owner" && (
                  <button
                    className="iconbutton"
                    aria-label="Retirer ce membre"
                    onClick={() =>
                      run(async () => {
                        await api(
                          `/organizations/${org.id}/members/${m.user_id}`,
                          "DELETE",
                        );
                        setTick((t) => t + 1);
                      })
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
                <Badge>{r.status}</Badge>
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
  const [code, setCode] = useState(
    sessionStorage.getItem("fundroad-code") || "",
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
            {{ active: "Active", past_due: "Paiement en échec", cancelled: "Résiliée" }[
              billing?.entitlement?.status as string
            ] || (billing?.entitlement ? billing.entitlement.status : "Gratuite")}
          </Badge>
        </div>
        <p>
          {billing?.usage?.analyses || 0} analyse(s) ce mois-ci
          {billing?.entitlement?.quota ? ` sur ${billing.entitlement.quota}` : ""}
          {billing?.entitlement?.expires_at &&
            ` · accès jusqu’au ${new Date(billing.entitlement.expires_at).toLocaleDateString("fr")}`}
          .
        </p>
        <label>
          Code de recommandation
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="START-… ou FUND-…"
          />
        </label>
      </div>
      <div className="pricing-grid">
        {offers
          ?.filter((o) => org.kind === "startup" && o.id === "dossier")
          .map((o) => (
            <div className="price-card" key={o.id}>
              <Badge>{o.active ? "Disponible" : "Ouverture prochaine"}</Badge>
              <h3>{o.label}</h3>
              <div className="price">
                {o.price_cents / 100} €<small> HT</small>
              </div>
              <p>{o.cadence === "month" ? "Par mois" : "Forfait 90 jours"}</p>
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
              Ajoutez cette URI dans votre application d’authentification.
              Conservez vos codes de secours dans un endroit sûr.
            </p>
            <code className="breakall">{setup.totpURI}</code>
            <pre>{setup.backupCodes?.join("\n")}</pre>
            <Link to="/double-auth">Confirmer avec un code →</Link>
          </>
        )}
      </form>
      <SupprimerCompte />
    </>
  );
}
const libellesRoles: Record<string, string> = {
  owner: "Propriétaire",
  editor: "Éditeur",
  reviewer: "Relecteur",
};
function SupprimerCompte() {
  const { run, busy } = useAction();
  return (
    <form
      className="panel form-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (
          !confirm(
            "Supprimer définitivement votre compte, vos dossiers et leurs documents ? Cette action est irréversible.",
          )
        )
          return;
        run(async () => {
          await api("/me/delete", "POST", { password: f.get("password") });
          location.href = "/";
        });
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
            navigate("/app");
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
function Portal() {
  const { slug } = useParams();
  const { data: o, error } = useLoad("/portals/" + slug);
  const navigate = useNavigate();
  const { run, busy } = useAction();
  const c = o?.criteria || {};
  const name = o?.theme?.name || o?.name;
  useEffect(() => {
    if (name)
      document.title = `${name} : critères, ticket et candidature | Fund Road`;
  }, [name]);
  return (
    <PublicLayout>
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
                    [Coins, "Ticket", resume(c).ticket],
                    [Seedling, "Stade", resume(c).stage],
                    [MapPin, "Zone", resume(c).geography],
                    [Building2, "Secteurs", resume(c).sectors],
                  ].map(([Icon, t, v]: any) => (
                    <div key={t}>
                      <dt>
                        <Icon size={14} /> {t}
                      </dt>
                      <dd>{v || "À préciser"}</dd>
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
                        sessionStorage.setItem(
                          "fundroad-recipient",
                          JSON.stringify({
                            id: o.id,
                            name: o.theme.name || o.name,
                          }),
                        );
                        navigate("/app/dossiers");
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
                    canal officiel du financeur.
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
          </>
        )}
      </main>
    </PublicLayout>
  );
}
function Invitation() {
  const { token } = useParams();
  const { run, busy } = useAction();
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <main className="section">
        <div className="panel verification">
          <h1>Rejoindre le dossier</h1>
          <p>
            Connectez-vous avec l’adresse qui a reçu l’invitation, puis
            acceptez-la.
          </p>
          <Link to="/connexion">Se connecter</Link>
          <button
            className="button"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api("/invitations/" + token + "/accept", "POST", {});
                navigate("/app");
              })
            }
          >
            Accepter l’invitation
          </button>
        </div>
      </main>
    </PublicLayout>
  );
}
function SharedApplication() {
  const { id } = useParams();
  const [tick, setTick] = useState(0);
  const { data: a, error } = useLoad("/applications/" + id, tick);
  const { run, busy } = useAction();
  return (
    <PublicLayout>
      <main className="section">
        <ErrorBox text={error} />
        {a && (
          <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">DOSSIER PARTAGÉ · VERSION DATÉE</div>
                <h1>{a.snapshot.name}</h1>
                <p>{a.message}</p>
              </div>
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
            <div className="content-grid">
              <section>
                {a.questions?.length > 0 && (
                  <div className="panel">
                    <h2>Compléments demandés par ce financeur</h2>
                    <p>
                      {a.questions.filter((q: any) => q.answer?.trim()).length}{" "}
                      / {a.questions.length} réponses reçues · échanges mis à
                      jour après le partage.
                    </p>
                    {a.questions.map((q: any) => (
                      <div key={q.id}>
                        <h3>{q.body}</h3>
                        <p className="preline">
                          {q.answer || "En attente de réponse"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {requirements.map((r) => (
                  <div className="panel" key={r.id}>
                    <h3>{r.label}</h3>
                    <p className="preline">
                      {a.snapshot.state.facts[r.id]?.value || "À compléter"}
                    </p>
                  </div>
                ))}
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
                        <p key={n.id}>{n.body}</p>
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
                          await api(
                            "/applications/" + id + "/questions",
                            "POST",
                            { body: f.get("body") },
                          );
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
      </main>
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
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 6500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && /^(START|FUND)-[A-F0-9]+$/.test(code))
      sessionStorage.setItem("fundroad-code", code);
  }, []);
  return (
    <ToastContext.Provider value={setToast}>
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
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
createRoot(document.getElementById("root")!).render(<Root />);
