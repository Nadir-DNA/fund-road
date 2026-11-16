// Tests de mesure SANS serveur, base, e-mail ni Stripe : seul le front est servi, toutes les API sont simulées par le test.
// Filet de sécurité : le domaine du suivi est résolu vers un port fermé, aucun envoi ne peut atteindre le vrai Cockpit.
// (Ne pas utiliser playwright.config.ts : son serveur local envoie des e-mails et appelle l'IA selon .env.local.)
import { defineConfig } from "@playwright/test";

const WEB = Number(process.env.MESURE_WEB_PORT || 5191);   // le lanceur choisit des ports libres ; voir tests/support/stack.ts

export default defineConfig({
  testDir: "./tests/mesure",
  outputDir: `test-results/mesure-${WEB}`,   // un dossier par exécution : deux exécutions en parallèle ne se gênent pas
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { launchOptions: { args: ["--host-resolver-rules=MAP stats.nadirdaoudi.com 127.0.0.1:9"] }, baseURL: `http://localhost:${WEB}`, viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: `npx vite --host 127.0.0.1 --port ${WEB}`, url: `http://127.0.0.1:${WEB}/`, reuseExistingServer: false, timeout: 60_000 },
});
