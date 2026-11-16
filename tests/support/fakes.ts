// Faux services locaux pour les parcours de test : aucun appel externe, tout est journalisé pour être contrôlé ensuite.
import http from "node:http";
import net from "node:net";
import type { AddressInfo } from "node:net";

const listen = (server: http.Server | net.Server) => new Promise<number>((resolve) => server.listen(0, "127.0.0.1", () => resolve((server.address() as AddressInfo).port)));
const readBody = (req: http.IncomingMessage) => new Promise<string>((resolve) => { let b = ""; req.on("data", (d) => (b += d)).on("end", () => resolve(b)); });

/** Faux Stripe : ne sait ouvrir qu'une session Checkout ; journalise chaque appel (méthode + chemin). */
export async function startFakeStripe(checkoutUrl: string) {
  const calls: string[] = [];
  const server = http.createServer(async (req, res) => {
    const body = await readBody(req);
    calls.push(`${req.method} ${req.url}`);
    res.setHeader("content-type", "application/json");
    if (req.method === "POST" && req.url === "/v1/checkout/sessions") {
      const mode = new URLSearchParams(body).get("mode");
      return res.end(JSON.stringify({ id: "cs_test_fake", object: "checkout.session", mode, url: checkoutUrl, livemode: false }));
    }
    res.statusCode = 404; res.end(JSON.stringify({ error: { message: "Non simulé par le faux Stripe : " + req.url } }));
  });
  const port = await listen(server);
  return { port, calls, close: () => new Promise<void>((r) => server.close(() => r())) };
}

/** Faux serveur IA (Chat Completions). Rubriques : les cinq premières ; chaque fait cite le début réel du document reçu. */
export async function startFakeAI() {
  const calls: string[] = [];
  const server = http.createServer(async (req, res) => {
    const body = JSON.parse((await readBody(req)) || "{}");
    const system: string = body.messages?.[0]?.content ?? "";
    calls.push(system.slice(0, 40));
    const input = JSON.parse(body.messages?.[1]?.content ?? "{}");
    let content: unknown = {};
    if (/Tu structures un dossier/.test(system)) {
      const docs: { id: string; text?: string; extracted?: string; content?: string }[] = Array.isArray(input.documents) ? input.documents : [];
      const doc = docs[0];
      const text = String(doc?.text ?? doc?.extracted ?? doc?.content ?? "");
      const quote = text.trim().slice(0, 40);
      const ids: string[] = (input.requirements ?? []).slice(0, 5).map((r: { id: string }) => r.id);
      content = { summary: "Résumé de test synthétique.", conflicts: [], facts: quote && doc ? ids.map((id) => ({ id, value: "Information de test synthétique, sans valeur réelle.", source: doc.id, quote, kind: "document" })) : [] };
    }
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }));
  });
  const port = await listen(server);
  return { port, calls, close: () => new Promise<void>((r) => server.close(() => r())) };
}

/** Faux SMTP : accepte tout, garde chaque message (texte brut) pour en extraire le lien de confirmation. Aucun envoi réel.
 *  pause() coupe le serveur (les envois échouent), resume() le rétablit sur le même port. */
export async function startSmtpSink() {
  const mails: string[] = [];
  const sockets = new Set<net.Socket>();
  const server = net.createServer((s) => {
    sockets.add(s); s.on("close", () => sockets.delete(s)); s.on("error", () => {});
    let inData = false, buf = "";
    const w = (t: string) => s.write(t + "\r\n");
    w("220 sink ESMTP");
    s.on("data", (d) => {
      buf += d.toString();
      if (inData) { if (buf.includes("\r\n.\r\n")) { mails.push(buf.replace(/\r\n\.\r\n$/, "")); inData = false; buf = ""; w("250 ok"); } return; }
      for (const l of buf.split("\r\n").filter(Boolean)) {
        const c = l.toUpperCase();
        if (c.startsWith("EHLO") || c.startsWith("HELO")) w("250 sink");
        else if (c === "DATA") { w("354 go"); inData = true; buf = ""; return; }
        else if (c === "QUIT") { w("221 bye"); s.end(); } else w("250 ok");
      }
      buf = "";
    });
  });
  const port = await listen(server);
  return {
    port, mails,
    pause: () => new Promise<void>((r) => { for (const s of sockets) s.destroy(); server.close(() => r()); }),
    resume: () => new Promise<void>((r) => server.listen(port, "127.0.0.1", () => r())),
    close: () => new Promise<void>((r) => { for (const s of sockets) s.destroy(); server.close(() => r()); }),
  };
}
