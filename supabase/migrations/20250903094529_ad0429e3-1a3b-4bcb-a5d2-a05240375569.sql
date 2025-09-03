-- CORRECTIFS FINAUX SÉCURITÉ: RLS et fonctions

-- 1. Activer RLS sur la nouvelle table cache
ALTER TABLE public.blog_sitemap_cache ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'accès public en lecture (données pré-validées comme publiques)
CREATE POLICY "Public read access to sitemap cache" 
ON public.blog_sitemap_cache 
FOR SELECT 
USING (true);

-- 2. Corriger les fonctions sans search_path sécurisé
DROP FUNCTION IF EXISTS public.refresh_blog_sitemap_cache();
CREATE OR REPLACE FUNCTION public.refresh_blog_sitemap_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Pas DEFINER
SET search_path = public  -- Chemin sécurisé
AS $$
BEGIN
  -- Supprimer les anciennes données
  DELETE FROM public.blog_sitemap_cache;
  
  -- Insérer uniquement les articles explicitement publics
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

-- 3. Corriger la fonction trigger
DROP FUNCTION IF EXISTS public.update_sitemap_cache_trigger();
CREATE OR REPLACE FUNCTION public.update_sitemap_cache_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Rafraîchir le cache quand les articles sont modifiés
  PERFORM public.refresh_blog_sitemap_cache();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Corriger la fonction utilitaire créée précédemment
DROP FUNCTION IF EXISTS public.is_published_article(UUID);
CREATE OR REPLACE FUNCTION public.is_published_article(article_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT is_published FROM public.articles WHERE id = article_id;
$$;

-- 5. Recréer les triggers avec les fonctions corrigées
DROP TRIGGER IF EXISTS update_sitemap_on_articles_change ON public.articles;
DROP TRIGGER IF EXISTS update_sitemap_on_translations_change ON public.article_translations;

CREATE TRIGGER update_sitemap_on_articles_change
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();

CREATE TRIGGER update_sitemap_on_translations_change
  AFTER INSERT OR UPDATE OR DELETE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();