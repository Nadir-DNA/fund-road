import test from "node:test";
import assert from "node:assert/strict";
import { TRACK_EVENTS, UTM_KEYS, mesureAutorisee, parseUtm, pickUtm, withUtm } from "../shared/track.ts";

test("événements : exactement les cinq noms fixes, sans donnée personnelle", () => {
  assert.deepEqual([...TRACK_EVENTS], ["compte_cree", "dossier_cree", "analyse_ok", "checkout_ouvert", "paiement_retour"]);
  for (const n of TRACK_EVENTS) assert.match(n, /^[a-z_]+$/, n);
});

test("parseUtm : trois clés connues, valeurs bornées et sûres", () => {
  assert.deepEqual(UTM_KEYS, ["utm_source", "utm_medium", "utm_campaign"]);
  assert.deepEqual(parseUtm("?utm_source=linkedin&utm_medium=prospection&utm_campaign=incubateurs&utm_term=x&a=1"), {
    utm_source: "linkedin", utm_medium: "prospection", utm_campaign: "incubateurs",
  });
  assert.deepEqual(parseUtm("?utm_source=<script>alert(1)</script>"), {}, "caractères dangereux refusés");
  assert.equal(parseUtm("?utm_source=" + "a".repeat(300)).utm_source?.length, 100);
  assert.deepEqual(parseUtm(""), {});
});

test("pickUtm : la campagne de l'adresse remplace celle gardée ; sans campagne on garde celle de la visite", () => {
  const kept = { utm_source: "a" };
  assert.deepEqual(pickUtm("?utm_source=b", kept), { utm_source: "b" });
  assert.equal(pickUtm("?x=1", kept), kept);
  assert.equal(pickUtm("", null), null);
  assert.equal(pickUtm("", {}), null);
});

test("withUtm : ajoute les UTM manquants, ne touche pas une adresse qui en a déjà, ne change rien sans campagne", () => {
  const u = { utm_source: "a", utm_medium: "m", utm_campaign: "c" };
  assert.equal(withUtm("/inscription?profil=financeur", u), "/inscription?profil=financeur&utm_source=a&utm_medium=m&utm_campaign=c");
  assert.equal(withUtm("/app", u), "/app?utm_source=a&utm_medium=m&utm_campaign=c");
  assert.equal(withUtm("/app?success=1#h", { utm_campaign: "c" }), "/app?success=1&utm_campaign=c#h");
  assert.equal(withUtm("/x?utm_source=deja", u), "/x?utm_source=deja");
  assert.equal(withUtm("/app", null), "/app");
});

test("consentement : seul un « oui » explicite autorise la mesure ; refus et absence de choix non", () => {
  assert.equal(mesureAutorisee("oui"), true);
  assert.equal(mesureAutorisee("non"), false);
  assert.equal(mesureAutorisee(null), false);
  assert.equal(mesureAutorisee(undefined), false);
  assert.equal(mesureAutorisee(""), false);
});
