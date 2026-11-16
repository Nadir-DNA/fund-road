// Préchargé dans le serveur de TEST (node --import) : toute requête sortante vers api.stripe.com est redirigée vers le faux Stripe local.
// Échec FERMÉ : sans FAKE_STRIPE_PORT, ou vers un autre hôte Stripe, la requête est refusée — jamais d'appel live.
import https from "node:https";
import http from "node:http";
import { syncBuiltinESMExports } from "node:module";


const realRequest = https.request;
https.request = function (...args) {
  const opts = typeof args[0] === "string" || args[0] instanceof URL ? args[1] ?? {} : args[0];
  const host = String((typeof args[0] === "string" ? new URL(args[0]).hostname : args[0] instanceof URL ? args[0].hostname : opts.hostname || opts.host) || "");
  if (/(^|\.)stripe\.com$/.test(host)) {
    const port = Number(process.env.FAKE_STRIPE_PORT || 0);
    if (!port) throw new Error("Appel Stripe refusé : le faux Stripe de test n'est pas démarré (aucun appel live)");
    const cb = args.find((a) => typeof a === "function");
    const { agent, protocol, ...rest } = opts;
    const req = http.request({ ...rest, host: "127.0.0.1", hostname: "127.0.0.1", port }, cb);
    // Le SDK Stripe attend « secureConnect » (TLS) avant d'écrire sa requête : le faux Stripe est en HTTP clair, on l'émet à la connexion.
    req.once("socket", (socket) => { if (socket.connecting) socket.once("connect", () => socket.emit("secureConnect")); });
    return req;
  }
  return realRequest.apply(this, args);
};
syncBuiltinESMExports();
