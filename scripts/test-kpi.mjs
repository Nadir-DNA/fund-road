// Lance le test des requêtes de mesure (M1) en ne transmettant que DATABASE_URL de .env.local (Postgres LOCAL de développement).
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
const env = { ...process.env };
if (!env.DATABASE_URL && existsSync(".env.local")) env.DATABASE_URL = readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1];
if (!env.DATABASE_URL || !/127\.0\.0\.1|localhost/.test(env.DATABASE_URL)) { console.error("DATABASE_URL local requis (Postgres de développement)."); process.exit(2); }
const r = spawnSync("npx", ["tsx", "--test", "tests/kpi.integration.ts"], { stdio: "inherit", env });
process.exit(r.status ?? 1);
