-- Liens entrants vers /fonds/kima-ventures, demandés par Shikamaru le 20/11/2026.
-- NE PAS EXÉCUTER avant la mise en ligne de la fiche : ces UPDATE sont visibles immédiatement en production.
-- À appliquer en même temps que le déploiement qui publie contenus/kima-ventures.md.

-- Kima : le champ Stade passe de « Pré-amorçage, Amorçage » à tous les stades du référentiel.
-- L'énumération shared/criteria.ts n'a pas de valeur « Tous stades » : on retient les sept valeurs
-- existantes (Idée → Croissance), ce qui évite d'ajouter un cas aux filtres de l'annuaire.
UPDATE investors
SET stage = 'Idée, Prototype, Pré-amorçage, Amorçage, Série A, Série B et plus, Croissance',
    criteria = criteria || jsonb_build_object(
      'stages',
      '["Idée","Prototype","Pré-amorçage","Amorçage","Série A","Série B et plus","Croissance"]'::jsonb
    ),
    updated_at = now()
WHERE slug = 'kima-ventures';

-- Les trois pages sources sont générées depuis la base : aucun fichier de contenu ne les décrit.
-- Aucune autre fiche n'est touchée, aucun titre, aucune URL, aucun sitemap.

-- 22 impressions, position 6,5 — hors fenêtre de mesure S1
UPDATE investors
SET criteria = criteria || jsonb_build_object(
      'voirAussi',
      jsonb_build_array(jsonb_build_object(
        'href', '/fonds/kima-ventures',
        'label', 'Kima Ventures, 150 k€ en ticket unique'
      ))
    ),
    updated_at = now()
WHERE slug = 'seed4soft';

-- 18 impressions, position 7,2 — hors fenêtre de mesure S1
UPDATE investors
SET criteria = criteria || jsonb_build_object(
      'voirAussi',
      jsonb_build_array(jsonb_build_object(
        'href', '/fonds/kima-ventures',
        'label', 'un ticket standardisé de 150 000 €, tous stades'
      ))
    ),
    updated_at = now()
WHERE slug = 'breega';

-- 11 impressions, position 14,8 — hors fenêtre de mesure S1
UPDATE investors
SET criteria = criteria || jsonb_build_object(
      'voirAussi',
      jsonb_build_array(jsonb_build_object(
        'href', '/fonds/kima-ventures',
        'label', 'Kima Ventures finance deux startups par semaine'
      ))
    ),
    updated_at = now()
WHERE slug = '360-capital';

-- Contrôle après application (doit renvoyer trois lignes avec voirAussi) :
-- SELECT slug, criteria->'voirAussi' FROM investors WHERE slug IN ('seed4soft','breega','360-capital');

-- Retour arrière :
-- UPDATE investors SET criteria = criteria - 'voirAussi' WHERE slug IN ('seed4soft','breega','360-capital');
