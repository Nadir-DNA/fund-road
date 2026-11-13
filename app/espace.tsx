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
import {
  api,
  Badge,
  BasculeTheme,
  CLE_ANALYSE,
  ConfirmDialog,
  Directory,
  DUREE_ANALYSE,
  Empty,
  ErrorBox,
  fichiersDuDepot,
  iconesMenu,
  Logo,
  orgKindLabels,
  PublicLayout,
  SharedApplication,
  ToastContext,
  useAction,
  useLoad,
  verdicts,
  WorkspaceContext,
  stageLabels,
  stageLabelsIncubateur,
  profilInscription,
  proposeParIA,
  etapes,
  OrgLogo,
  orgStyle,
  chips,
  plural,
} from "./main.tsx";

// Invité sur un dossier, sans organisation : ses dossiers, et la possibilité d'en créer une
const liensInvite = [
  ["/app", "Dossiers partagés", FolderOpen],
  ["/app/nouvelle-organisation", "Créer mon organisation", Building2],
] as const;

export function Shell() {
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
