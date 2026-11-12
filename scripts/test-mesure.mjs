// Lance les tests de mesure (Playwright) en ne transmettant que DATABASE_URL de .env.local (Postgres LOCAL de développement).
// Aucun autre secret de .env.local (SMTP, IA, Stripe) n'est passé aux tests.
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
const env = { ...process.env };
if (!env.DATABASE_URL && existsSync(".env.local")) env.DATABASE_URL = readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1];
if (!env.DATABASE_URL || !/127\.0\.0\.1|localhost/.test(env.DATABASE_URL)) { console.error("DATABASE_URL local requis (Postgres de développement)."); process.exit(2); }
// Deux ports libres (API et interface) sauf s'ils sont imposés : deux exécutions simultanées ne se gênent plus.
const libre = () => new Promise((resolve) => { const s = createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => resolve(String(p))); }); });
env.MESURE_API_PORT ||= await libre();
env.MESURE_WEB_PORT ||= await libre();
console.log(`Ports de test : API ${env.MESURE_API_PORT}, interface ${env.MESURE_WEB_PORT}`);
const r = spawnSync("npx", ["playwright", "test", "-c", "playwright.mesure.config.ts", ...process.argv.slice(2)], { stdio: "inherit", env });
process.exit(r.status ?? 1);
