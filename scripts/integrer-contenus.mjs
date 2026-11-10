#!/usr/bin/env node
// Intègre les contenus éditoriaux validés (contenus-seo/*.md) dans le dépôt :
// front-matter + Markdown -> shared/editorial.generated.ts (HTML + FAQPage).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";

const SRC = process.argv[2] ?? join(process.env.HOME, "OpenBot/Shared/projets/fundroad/contenus-seo");
const ROOT = new URL("..", import.meta.url).pathname;
const DEST = join(ROOT, "contenus");

const cleanText = (s) => String(s)
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/\s+/g, " ")
  .trim();

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("front-matter absent");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"|"$/g, "");
  }
  return { meta, body: text.slice(m[0].length) };
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => `<a href="${href}">${label}</a>`);
}

function renderMarkdown(md) {
  // Les questions de la FAQ sont en gras dans les sources : on les rend en h3,
  // pour qu'elles soient structurées et correspondent au JSON-LD FAQPage.
  let inFaq = false;
  const lines = md.split("\n").map((line) => {
    if (/^##\s+Questions fréquentes/.test(line)) { inFaq = true; return line; }
    if (/^##\s+/.test(line)) { inFaq = false; return line; }
    const q = line.match(/^\*\*(.+\?)\*\*$/);
    return inFaq && q ? `### ${q[1]}` : line;
  });
  const out = [];
  let para = [];
  let list = null;
  let table = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((x) => `<li>${inline(x)}</li>`).join("")}</${list.tag}>`); list = null; } };
  const flushTable = () => {
    if (!table) return;
    const head = table.header.map((c) => `<th>${inline(c)}</th>`).join("");
    const rows = table.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("");
    out.push(`<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`);
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) { flushAll(); while (i < lines.length && !/^```/.test(lines[i + 1])) i++; i++; continue; }
    if (!line.trim()) { flushAll(); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushAll(); const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (/^\|.*\|$/.test(line) && /^\|[\s:|-]+\|$/.test(lines[i + 1] ?? "")) {
      flushAll();
      table = { header: line.split("|").slice(1, -1).map((c) => c.trim()), rows: [] };
      i++;
      while (i + 1 < lines.length && /^\|.*\|$/.test(lines[i + 1])) { i++; table.rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim())); }
      flushTable();
      continue;
    }
    const ul = line.match(/^\s*-\s+(.*)$/), ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara(); flushTable();
      const tag = ul ? "ul" : "ol";
      if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push((ul ?? ol)[1]);
      continue;
    }
    flushList(); flushTable(); para.push(line.trim());
  }
  flushAll();
  return out.join("\n");
}

const files = readdirSync(SRC).filter((f) => f.endsWith(".md"));
const pages = files.map((file) => {
  const raw = readFileSync(join(SRC, file), "utf8");
  const { meta, body } = frontMatter(raw);
  if (meta.statut !== "prêt-à-intégrer") throw new Error(`${file} : statut « ${meta.statut} »`);
  const faqMatch = body.match(/```json\n([\s\S]*?)\n```/);
  const faq = faqMatch ? JSON.parse(faqMatch[1]) : null;
  if (faq)
    for (const item of faq.mainEntity) {
      item.name = cleanText(item.name);
      item.acceptedAnswer.text = cleanText(item.acceptedAnswer.text);
    }
  const text = body.replace(/```json\n[\s\S]*?\n```/g, "");
  const withoutTitle = text.replace(/^\s*#\s+.*\n+/, "");
  return { file, url: meta.url, title: meta.title, description: meta.meta_description, h1: meta.h1, date: meta.date_verification, validated: meta.statut === "prêt-à-intégrer", md: withoutTitle, faq, faqType: faq?.["@type"] };
});

const byFile = new Map(pages.map((p) => [p.file, p.url]));
for (const p of pages) {
  p.md = p.md.replace(/\]\(([^)/]+)\.md\)/g, (_m, name) => `](${byFile.get(name + ".md") ?? name + ".md"})`);
  p.html = renderMarkdown(p.md);
}

mkdirSync(DEST, { recursive: true });
for (const p of pages) copyFileSync(join(SRC, p.file), join(DEST, p.file));

const entries = pages.map((p) => `  ${JSON.stringify(p.url)}: {\n    title: ${JSON.stringify(p.title)},\n    description: ${JSON.stringify(p.description)},\n    h1: ${JSON.stringify(p.h1)},\n    date: ${JSON.stringify(p.date)},\n    validated: ${JSON.stringify(p.validated)},\n    html: ${JSON.stringify(p.html)},\n    faq: ${JSON.stringify(p.faq)},\n  },`).join("\n");
writeFileSync(join(ROOT, "shared/editorial.generated.ts"), `// Généré par scripts/integrer-contenus.mjs — ne pas éditer à la main.\nexport type EditorialPage = { title: string; description: string; h1: string; date: string; validated: boolean; html: string; faq: any };\nexport const editorial: Record<string, EditorialPage> = {\n${entries}\n};\n`);
console.log(`${pages.length} contenus intégrés : ${pages.map((p) => p.url).join(", ")}`);
