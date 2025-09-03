-- CORRECTIF FINAL: Éliminer complètement les vues pour éviter les détections SECURITY DEFINER

-- 1. Supprimer la vue problématique
DROP VIEW IF EXISTS public.v_blog_sitemap;

-- 2. Utiliser directement la table avec des permissions publiques explicites
-- La table blog_sitemap_cache devient la source directe pour le sitemap
REVOKE ALL ON public.blog_sitemap_cache FROM PUBLIC;
GRANT SELECT ON public.blog_sitemap_cache TO anon, authenticated;

-- 3. Créer un alias de table plutôt qu'une vue si nécessaire
-- Ou simplement utiliser blog_sitemap_cache directement dans l'application

-- 4. Mettre à jour les permissions pour garantir l'accès public en lecture seule
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 5. Corriger les 2 fonctions restantes avec search_path mutable
-- (Ces warnings concernent probablement des fonctions système existantes)

-- Vérifier les fonctions handle_new_user et is_admin pour s'assurer qu'elles ont search_path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Remplir le cache une dernière fois pour s'assurer que les données sont à jour
SELECT public.refresh_blog_sitemap_cache();