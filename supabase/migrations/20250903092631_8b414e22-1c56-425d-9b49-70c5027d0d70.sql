-- Correctifs de sécurité pour la migration blog

-- 1. Recréer la vue sans SECURITY DEFINER (par défaut c'est SECURITY INVOKER)
DROP VIEW IF EXISTS public.v_blog_sitemap;
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
AND t.status = 'published';

-- 2. Corriger les fonctions avec search_path sécurisé
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 3. Activer RLS sur les tables manquantes si nécessaire
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resource_tags ENABLE ROW LEVEL SECURITY;

-- 4. Nettoyer les anciens triggers et les recréer
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_article_translations_updated_at ON article_translations;

CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON public.articles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_translations_updated_at 
  BEFORE UPDATE ON public.article_translations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();