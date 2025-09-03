-- SOLUTION SÉCURITÉ: Créer des vues matérialisées pour éviter les problèmes SECURITY DEFINER

-- 1. Supprimer les vues problématiques
DROP VIEW IF EXISTS public.v_blog_sitemap;
DROP VIEW IF EXISTS public.v_public_blog_articles;

-- 2. Créer des tables dédiées pour les données publiques (alternative aux vues)
-- Table pour le cache du sitemap (données publiques uniquement)
CREATE TABLE IF NOT EXISTS public.blog_sitemap_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL,
  loc TEXT NOT NULL,
  lastmod TIMESTAMPTZ NOT NULL,
  priority NUMERIC NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Désactiver RLS sur cette table car elle ne contient que des données publiques
-- Toutes les données qui y sont insérées sont déjà validées comme publiques

-- 3. Fonction pour rafraîchir le cache sitemap (sans SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.refresh_blog_sitemap_cache()
RETURNS void
LANGUAGE plpgsql
-- Pas de SECURITY DEFINER - utilise les permissions de l'utilisateur
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

-- 4. Créer une vue simple sur le cache (pas de RLS, pas de SECURITY DEFINER)
CREATE VIEW public.v_blog_sitemap AS
SELECT lang, loc, lastmod, priority, slug, title
FROM public.blog_sitemap_cache;

-- 5. Permissions publiques sur la vue et le cache
GRANT SELECT ON public.v_blog_sitemap TO anon, authenticated;
GRANT SELECT ON public.blog_sitemap_cache TO anon, authenticated;

-- 6. Remplir le cache initial
SELECT public.refresh_blog_sitemap_cache();

-- 7. Créer une fonction trigger pour maintenir le cache à jour
CREATE OR REPLACE FUNCTION public.update_sitemap_cache_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Rafraîchir le cache quand les articles sont modifiés
  PERFORM public.refresh_blog_sitemap_cache();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers pour maintenir le cache à jour
CREATE TRIGGER update_sitemap_on_articles_change
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();

CREATE TRIGGER update_sitemap_on_translations_change
  AFTER INSERT OR UPDATE OR DELETE ON public.article_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_sitemap_cache_trigger();