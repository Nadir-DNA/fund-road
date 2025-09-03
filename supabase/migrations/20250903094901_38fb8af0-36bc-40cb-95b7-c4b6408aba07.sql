-- CORRECTIF SÉCURITÉ: Ordre correct de suppression/recréation

-- 1. D'abord supprimer les triggers qui dépendent des fonctions
DROP TRIGGER IF EXISTS update_sitemap_on_articles_change ON public.articles;
DROP TRIGGER IF EXISTS update_sitemap_on_translations_change ON public.article_translations;

-- 2. Maintenant supprimer et recréer les fonctions avec les bonnes propriétés de sécurité
DROP FUNCTION IF EXISTS public.update_sitemap_cache_trigger();
DROP FUNCTION IF EXISTS public.refresh_blog_sitemap_cache();
DROP FUNCTION IF EXISTS public.is_published_article(UUID);

-- 3. Recréer les fonctions avec SECURITY INVOKER et search_path sécurisé
CREATE OR REPLACE FUNCTION public.refresh_blog_sitemap_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.blog_sitemap_cache;
  
  INSERT INTO public.blog_sitemap_cache (lang, loc, lastmod, priority, slug, title)
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
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sitemap_cache_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_blog_sitemap_cache();
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_published_article(article_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT is_published FROM public.articles WHERE id = article_id;
$$;

-- 4. Activer RLS sur la table cache
ALTER TABLE public.blog_sitemap_cache ENABLE ROW LEVEL SECURITY;

-- Policy pour l'accès public en lecture seule
CREATE POLICY "Public read access to sitemap cache" 
ON public.blog_sitemap_cache 
FOR SELECT 
USING (true);

-- 5. Recréer les triggers
CREATE TRIGGER update_sitemap_on_articles_change
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();

CREATE TRIGGER update_sitemap_on_translations_change
  AFTER INSERT OR UPDATE OR DELETE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();