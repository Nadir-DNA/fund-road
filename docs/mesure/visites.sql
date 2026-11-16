-- Visites et visites engagées, d'après la base du pixel Searchtide (Cockpit), EN LECTURE SEULE.
-- Paramètres : :site = domaine du site (ex. fund-road.com), :from / :to = jours AAAA-MM-JJ inclus.
-- Une « visite » = un visiteur-jour (l'empreinte du pixel change chaque jour : aucun suivi d'un jour à l'autre, aucun cookie).
-- Une visite est « engagée » si elle a déclenché ≥ 1 événement « cta-… » OU vu ≥ 2 pages.
-- Le reste est « trafic non confirmé » : visites vues une seule page sans CTA. Ce n'est PAS un diagnostic de robot : seul un agent
-- utilisateur reconnu est écarté à l'entrée, et aucun pays ni type d'appareil n'est jamais exclu.
WITH v AS (
  SELECT e.visitor, e.day,
         COUNT(*) FILTER (WHERE e.type = 'pageview')                              AS pages,
         COUNT(DISTINCT CASE WHEN e.type = 'pageview' THEN e.path END)             AS pages_distinctes,
         COUNT(*) FILTER (WHERE e.type = 'event' AND e.name LIKE 'cta-%')          AS ctas
  FROM events e JOIN sites s ON s.id = e.site_id
  WHERE s.domain = :site AND e.day BETWEEN :from AND :to
  GROUP BY e.visitor, e.day
)
SELECT COUNT(*)                                                         AS visites,
       COUNT(*) FILTER (WHERE ctas >= 1 OR pages_distinctes >= 2)       AS visites_engagees,
       COUNT(*) FILTER (WHERE NOT (ctas >= 1 OR pages_distinctes >= 2)) AS trafic_non_confirme
FROM v;
