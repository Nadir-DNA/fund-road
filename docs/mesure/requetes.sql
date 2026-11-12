-- Fund Road : requêtes de mesure, EN LECTURE SEULE (aucune écriture, aucun contenu de document, aucun e-mail ni nom).
-- Chaque bloc commence par « -- name: » ; les tests (tests/kpi.integration.ts) les exécutent tels quels sur une base jetable.
-- Les faits de la base font foi : un bloqueur de publicité n'altère aucun de ces nombres.
-- Paramètres : $1 = jour (date, Europe/Paris) pour les compteurs quotidiens ; $2 = identifiants des organisations d'équipe/test
-- (uuid[], JAMAIS des noms). Dans Cockpit, $2 s'écrit en clair dans l'indicateur : ARRAY['<uuid>', …]::uuid[].

-- name: clients_payants
-- Définition : droit actif d'une offre à PRIX > 0, lié à un paiement Stripe : un abonnement (subscription_id) OU un achat unique
-- (offre de cadence « once », ouverte en mode « payment » : le webhook signé n'écrit alors que customer_id, subscription_id reste nul).
-- Un droit n'est créé que par le webhook signé avec payment_status='paid' ; l'offre « pilote » à 0 € et toute attribution manuelle
-- d'une offre à abonnement (scripts/offrir-acces.ts ne crée que des droits pilote) ne sont pas comptées.
SELECT count(*) FROM entitlements e JOIN offers o ON o.id=e.offer_id
WHERE e.status='active' AND o.price_cents>0 AND (e.subscription_id IS NOT NULL OR o.cadence='once');

-- name: pilotes_actifs
SELECT count(*) FROM entitlements e JOIN offers o ON o.id=e.offer_id
WHERE e.status='active' AND o.price_cents=0 AND o.id='pilote';

-- name: comptes_utilisateurs_externes_jour
-- Utilisateurs inscrits ce jour-là, hors membres d'une organisation d'équipe (un utilisateur sans organisation compte).
SELECT count(*) FROM "user" u
WHERE ("createdAt" AT TIME ZONE 'Europe/Paris')::date=$1::date
  AND NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id=u.id AND m.organization_id = ANY($2::uuid[]));

-- name: comptes_confirmes_jour
SELECT count(*) FROM "user" u
WHERE u."emailVerified" = true AND ("createdAt" AT TIME ZONE 'Europe/Paris')::date=$1::date
  AND NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id=u.id AND m.organization_id = ANY($2::uuid[]));

-- name: organisations_externes_jour
-- Espaces (organisations) créés ce jour-là, hors équipe/test.
SELECT count(*) FROM organizations o
WHERE NOT (o.id = ANY($2::uuid[])) AND (o.created_at AT TIME ZONE 'Europe/Paris')::date=$1::date;

-- name: dossiers_crees_jour
SELECT count(*) FROM dossiers d
WHERE NOT (d.organization_id = ANY($2::uuid[])) AND (d.created_at AT TIME ZONE 'Europe/Paris')::date=$1::date;

-- name: dossiers_analyse_reussie_jour
-- Dossiers dont une analyse (jobs.kind='analysis') s'est terminée avec succès ce jour-là (jour de lancement de l'analyse).
SELECT count(DISTINCT d.id) FROM dossiers d
JOIN jobs j ON j.dossier_id=d.id AND j.kind='analysis' AND j.status='done'
WHERE NOT (d.organization_id = ANY($2::uuid[])) AND (j.created_at AT TIME ZONE 'Europe/Paris')::date=$1::date;

-- name: dossiers_actives
-- Critère d'activation du protocole des pilotes, par dossier réel : compte vérifié, ≥ 1 document dont l'extraction a réussi,
-- ≥ 5 faits confirmés avec leur source (dossiers.state->'facts' : un objet par rubrique {value, source, confirmed, kind, quote}),
-- 0 conflit non résolu (dossiers.state->'conflicts' : liste de textes, vide = aucun). Le contenu des faits n'est jamais sélectionné.
-- $1 = identifiants des organisations d'équipe/test (uuid[]).
SELECT count(*) FROM dossiers d
WHERE NOT (d.organization_id = ANY($1::uuid[]))
  AND (SELECT count(*) FROM jsonb_each(d.state->'facts') f
       WHERE (f.value->>'confirmed')::boolean IS TRUE AND coalesce(f.value->>'source','') <> '') >= 5
  AND jsonb_array_length(coalesce(d.state->'conflicts','[]'::jsonb)) = 0
  AND EXISTS (SELECT 1 FROM documents x WHERE x.dossier_id=d.id AND x.status='ready')
  AND EXISTS (SELECT 1 FROM members m JOIN "user" u ON u.id=m.user_id
              WHERE m.organization_id=d.organization_id AND u."emailVerified" = true);
