// Lance les tests de mesure (Playwright) en ne transmettant que DATABASE_URL de .env.local (Postgres LOCAL de développement).
// Aucun autre secret de .env.local (SMTP, IA, Stripe) n'est passé aux tests.
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
const env = { ...process.env };
if (!env.DATABASE_URL && existsSync(".env.local")) env.DATABASE_URL = readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1];
if (!env.DATABASE_URL || !/127\.0\.0\.1|localhost/.test(env.DATABASE_URL)) { console.error("DATABASE_URL local requis (Postgres de développement)."); process.exit(2); }
const r = spawnSync("npx", ["playwright", "test", "-c", "playwright.mesure.config.ts", ...process.argv.slice(2)], { stdio: "inherit", env });
process.exit(r.status ?? 1);
