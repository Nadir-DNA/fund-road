import { spawn } from "node:child_process";
// Worker complet par défaut ; `--extract-only` interdit tout appel IA.
const worker = process.argv.includes("--extract-only")
  ? ["worker", "--", "--extract-only"]
  : ["worker"];
const children = [["server"], ["dev"], worker].map((args) =>
  spawn("npm", ["run", ...args], { stdio: "inherit" }),
);
let closing = false;
function stop(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 1000).unref();
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => {
    if (!closing) stop(code || 0);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
