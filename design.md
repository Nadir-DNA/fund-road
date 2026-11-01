# Design — Fund Road

Charte verrouillée : toute nouvelle page la suit. Les valeurs vivent dans [app/tokens.css](app/tokens.css) ; aucune couleur ni police en dur dans les composants.

## Genre et ton
SaaS moderne (modern-minimal). Le visiteur doit comprendre en une seconde qu’il est face à un logiciel : logo, produit visible, CTA clairs.

## Marque
- Logo : pictogramme épingle-route + « Fund Road ». Fichiers dans `public/brand/` (`fundroad-mark.png`, version blanche, logo complet).
- Charte de la bannière : bleu nuit `#0a192c` (`--color-brand`, `--color-night`), orange route `#eb743c` (`--color-accent`), blanc. Navigation et hero en bleu nuit avec le logo blanc ; route et coup de pinceau orange en SVG.
- Accent orange : CTA principaux, progression, scores. Texte orange sur fond clair : `--color-accent-2` (plus foncé, contraste suffisant).

## Typographie
Archivo (grotesque classique, proche du logo) partout, JetBrains Mono pour les données techniques. Icônes : Font Awesome (libre), via `app/icons.tsx`. Titres serrés (-0.02 à -0.035em), jamais en italique.

## Structure
- Accueil : Workbench. Hero sombre (titre à gauche, texte et CTA à droite) suivi d’une vraie capture de l’application ; visite guidée en trois étapes avec captures ; grille de fonctionnalités ; bande financeurs ; FAQ ; appel final.
- Les captures viennent de l’application réelle (`public/screens/`), régénérées avec le dossier de démonstration « Atelier Demain ».
- Application : barre latérale blanche, onglets en pilule, panneaux blancs 12 px de rayon et ombre légère.

## Boutons
Pilule. Primaire bleu pétrole sur fond clair, sarcelle sur fond sombre. Secondaire blanc bordé.

## Interdits
Chiffres ou logos clients inventés, faux témoignages, dégradés sur le texte, glassmorphism, sur-titres en capitales espacées.
