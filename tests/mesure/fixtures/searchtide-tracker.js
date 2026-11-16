// Script de suivi Searchtide : <script defer src="https://VOTRE-INSTANCE/script.js" data-site="exemple.com"></script>
(function () {
  var s = document.currentScript;
  if (!s || navigator.webdriver) return;
  // Exclure ses propres visites : ouvrir une page du site avec ?searchtide=ignore (ou =track pour annuler)
  try {
    if (/[?&]searchtide=ignore\b/.test(location.search)) localStorage.setItem("searchtide-ignore", "1");
    if (/[?&]searchtide=track\b/.test(location.search)) localStorage.removeItem("searchtide-ignore");
    if (localStorage.getItem("searchtide-ignore")) return;
  } catch (e) { /* stockage bloqué : on compte la visite */ }
  var site = s.getAttribute("data-site") || location.hostname.replace(/^www\./, "");
  var endpoint = new URL("/api/collect", s.src).href;
  var last;

  function send(name, referrer) {
    var body = JSON.stringify({ site: site, url: location.href, referrer: referrer === undefined ? document.referrer : referrer, lang: navigator.language, name: name });
    if (!(navigator.sendBeacon && navigator.sendBeacon(endpoint, body))) {
      fetch(endpoint, { method: "POST", body: body, keepalive: true });
    }
  }

  function pageview() {
    if (last === location.pathname) return;
    // Navigation interne : le référent est la page précédente, pas le site d'entrée.
    var referrer = last ? location.origin + last : document.referrer;
    last = location.pathname;
    send(undefined, referrer);
  }

  // Applications monopages : suivre les changements d'URL.
  // replaceState n'est PAS intercepté : un routeur qui réécrit l'URL ne doit pas créer une vue en double.
  var push = history.pushState;
  history.pushState = function () { push.apply(this, arguments); pageview(); };
  addEventListener("popstate", pageview);

  // Événements personnalisés : searchtide("inscription") ou <a data-searchtide="clic-cta">
  window.searchtide = send;
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-searchtide]");
    if (el) send(el.getAttribute("data-searchtide"));
  });

  pageview();
})();
