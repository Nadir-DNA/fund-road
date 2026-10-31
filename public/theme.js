// Applique le thème choisi avant le premier affichage, pour éviter un flash clair en mode sombre
try {
  const t = localStorage.getItem("fundroad-theme");
  if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
} catch {}
