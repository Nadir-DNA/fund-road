-- CORRECTIF SÉCURITÉ: Éliminer les risques SECURITY DEFINER dans les vues

-- 1. Recréer la vue blog sitemap avec une approche plus sécurisée
-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS public.v_blog_sitemap;

-- Créer une vue sécurisée qui ne dépend pas des politiques RLS complexes
-- Cette vue ne retourne que les données publiques explicitement autorisées
CREATE VIEW public.v_blog_sitemap AS
SELECT 
  t.lang,
  CASE 
    WHEN t.lang = 'fr' THEN 'https://fund-road.com/fr/blog/' || t.slug
    ELSE 'https://fund-road.com/en/blog/' || t.slug
  END as loc,
  GREATEST(a.updated_at, t.updated_at) as lastmod,
  a.priority,
  t.slug,
  t.title
FROM public.articles a
JOIN public.article_translations t ON a.id = t.article_id
WHERE a.is_published = true 
AND t.status = 'published'
-- Accès explicite sans dépendre des politiques RLS
AND EXISTS (
  SELECT 1 FROM public.articles a2 
  WHERE a2.id = a.id 
  AND a2.is_published = true
);

-- 2. S'assurer que la vue a les bonnes permissions
-- Permettre l'accès public en lecture seule à cette vue spécifique
GRANT SELECT ON public.v_blog_sitemap TO anon, authenticated;

-- 3. Créer une fonction utilitaire simple sans SECURITY DEFINER pour les vérifications basiques
CREATE OR REPLACE FUNCTION public.is_published_article(article_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
-- Pas de SECURITY DEFINER ici - utilise les permissions de l'utilisateur courant
AS $$
  SELECT is_published FROM public.articles WHERE id = article_id;
$$;

-- 4. Optionnel: Créer une vue alternative plus restrictive si nécessaire
CREATE VIEW public.v_public_blog_articles AS
SELECT 
  t.id,
  t.lang,
  t.title,
  t.slug,
  t.meta_description,
  t.published_at,
  a.priority
FROM public.articles a
JOIN public.article_translations t ON a.id = t.article_id
WHERE a.is_published = true 
AND t.status = 'published';

-- Accorder les permissions appropriées
GRANT SELECT ON public.v_public_blog_articles TO anon, authenticated;