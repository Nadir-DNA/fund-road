// Pile locale JETABLE pour rejouer le parcours de bout en bout, sans paiement réel :
// base Postgres créée puis supprimée sur le serveur LOCAL de développement, API + worker Fund Road, faux Stripe / IA / SMTP,
// et un Searchtide jetable (base temporaire) qui reçoit les événements du pixel. Rien de tout cela ne touche la production.
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { visites } from "../../scripts/visites-engagees.mjs";
import { startFakeAI, startFakeStripe, startSmtpSink } from "./fakes.ts";

// Ports configurables (MESURE_API_PORT, MESURE_WEB_PORT) : deux exécutions peuvent tourner en parallèle. Le lanceur (scripts/test-mesure.mjs)
// choisit deux ports libres s'ils ne sont pas donnés ; valeurs par défaut hors lanceur : 3184 (API, attendu par vite.config.ts) et 5191.
export const API_PORT = Number(process.env.MESURE_API_PORT || 3184);
export const WEB_PORT = Number(process.env.MESURE_WEB_PORT || 5191);
export const WEB_ORIGIN = `http://localhost:${WEB_PORT}`;
export const SEARCHTIDE_DIR = process.env.SEARCHTIDE_DIR || join(process.env.HOME || "", "projects", "searchtide");
const PATH = process.env.PATH || "";

const urlFor = (base: string, name: string) => base.replace(/\/[^/?]+(\?.*)?$/, `/${name}$1`);
const waitFor = async (probe: () => Promise<boolean>, what: string, ms = 30_000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await probe().catch(() => false)) return; await new Promise((r) => setTimeout(r, 250)); }
  throw new Error(`${what} : délai dépassé`);
};

export async function startStack(o: { checkoutUrl: string; appUrl?: string }) {
  const admin = process.env.DATABASE_URL!;
  if (!/127\.0\.0\.1|localhost/.test(admin)) throw new Error("Refus : cette pile n'utilise qu'un Postgres local (DATABASE_URL de .env.local)");
  if (!existsSync(join(SEARCHTIDE_DIR, "server", "index.ts"))) throw new Error(`Searchtide introuvable dans ${SEARCHTIDE_DIR} (variable SEARCHTIDE_DIR)`);
  const children: ChildProcess[] = [];
  const dbName = "fr_stack_" + randomUUID().slice(0, 8);
  const root = new pg.Client({ connectionString: urlFor(admin, "postgres") }); await root.connect();
  await root.query(`CREATE DATABASE ${dbName}`);
  const databaseUrl = urlFor(admin, dbName);
  const secret = randomUUID() + randomUUID();
  const stripe = await startFakeStripe(o.checkoutUrl), ai = await startFakeAI(), sink = await startSmtpSink();
  const dataDir = mkdtempSync(join(tmpdir(), "fr-stack-"));
  const base = { PATH, HOME: process.env.HOME || tmpdir(), NODE_ENV: "development", DATABASE_URL: databaseUrl, BETTER_AUTH_SECRET: secret, APP_URL: o.appUrl ?? WEB_ORIGIN, DATA_DIR: join(dataDir, "documents") };
  execFileSync("npx", ["tsx", "server/migrate.ts"], { env: base, stdio: "pipe" });
  const db = new pg.Client({ connectionString: databaseUrl }); await db.connect();
  await db.query("INSERT INTO offers(id,label,price_cents,cadence,quota,stripe_price_id,active) VALUES ('pilote','Pilote',0,'once',99,NULL,true),('dossier','Dossier financement',14900,'quarter',10,'price_test_fake',true) ON CONFLICT(id) DO UPDATE SET stripe_price_id=EXCLUDED.stripe_price_id, active=true");

  const env = {
    ...base, PORT: String(API_PORT), REQUIRE_EMAIL_VERIFICATION: "true",
    SMTP_URL: `smtp://127.0.0.1:${sink.port}`, MAIL_FROM: "Fund Road <test@exemple.test>",
    OPENAI_API_KEY: "test", OPENAI_MODEL: "fake", OPENAI_BASE_URL: `http://127.0.0.1:${ai.port}`,
    STRIPE_SECRET_KEY: "sk_test_fake", STRIPE_CONTEXT: "acct_TestFake000000", STRIPE_WEBHOOK_SECRET: "whsec_test_fake", FAKE_STRIPE_PORT: String(stripe.port),
  };
  const apiLog: string[] = [];
  const spawnTs = (args: string[], extra: string[] = []) => { const c = spawn("npx", ["tsx", ...extra, ...args], { env, stdio: "pipe" }); children.push(c); for (const f of [c.stdout, c.stderr]) f?.on("data", (d) => apiLog.push(String(d))); return c; };
  spawnTs(["server/index.ts"], ["--import", "./tests/support/fake-stripe-preload.mjs"]);
  spawnTs(["server/worker.ts"], ["--import", "./tests/support/fake-stripe-preload.mjs"]);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${API_PORT}/api/health`)).ok, "API Fund Road");

  // Searchtide jetable : reçoit les événements du pixel, base temporaire, aucune sauvegarde, aucune vérification de version.
  const apiKey = "cle-jetable-" + randomUUID();
  const stDb = join(dataDir, "searchtide.db");
  const st = spawn(process.execPath, ["--no-warnings", "server/index.ts"], { cwd: SEARCHTIDE_DIR, stdio: "pipe", env: { PATH, HOME: process.env.HOME || tmpdir(), DATABASE_PATH: stDb, HOST: "127.0.0.1", PORT: "0", SECRET: "s".repeat(40), ADMIN_PASSWORD: "motdepasse-jetable-1", API_KEY: apiKey, NODE_ENV: "test", TRUST_PROXY: "1", UPDATE_CHECK: "0", BACKUP_DIR: join(dataDir, "backups") } });
  children.push(st);
  let out = ""; st.stdout?.on("data", (d) => (out += d)); st.stderr?.on("data", (d) => (out += d));
  await waitFor(async () => /\[Searchtide\] PORT=\d+/.test(out), "Searchtide jetable");
  const searchtide = `http://127.0.0.1:${/PORT=(\d+)/.exec(out)![1]}`;
  const login = await fetch(`${searchtide}/api/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "motdepasse-jetable-1" }) });
  const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const site = await (await fetch(`${searchtide}/api/sites`, { method: "POST", headers: { cookie, "content-type": "application/json" }, body: JSON.stringify({ domain: "fund-road.com" }) })).json() as { id: string };

  return {
    api: `http://127.0.0.1:${API_PORT}`, db, sink, stripe, ai, apiLog,
    searchtide: { base: searchtide, cookie, siteId: site.id,
      /** Événements reçus par le Searchtide jetable : nom, campagne, canal, page. */
      traffic: async () => ((await (await fetch(`${searchtide}/api/sites/${site.id}/traffic?days=1`, { headers: { cookie } })).json()) as any),
      /** Visites / visites engagées du jour (même requête que le runbook). */
      visites: () => { const d = new Date().toISOString().slice(0, 10); return visites(stDb, "fund-road.com", d, d) as { visites: number; visites_engagees: number; trafic_non_confirme: number }; },
      /** Lignes exactes reçues (lecture seule de la base temporaire du Searchtide jetable). */
      rows: () => { const d = new DatabaseSync(stDb, { readOnly: true }); try { return d.prepare("SELECT type, name, path, channel, utm_source, utm_medium, utm_campaign FROM events ORDER BY id").all() as Record<string, string | null>[]; } finally { d.close(); } },
    },
    stop: async () => {
      for (const c of children) c.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 800));
      await db.end().catch(() => {});
      await root.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`).catch(() => {});
      await root.end().catch(() => {});
      await Promise.all([stripe.close(), ai.close(), sink.close()]);
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}
