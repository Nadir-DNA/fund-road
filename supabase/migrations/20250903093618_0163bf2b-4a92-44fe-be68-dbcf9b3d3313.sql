-- CORRECTIF SÉCURITÉ CRITIQUE: Activer RLS sur toutes les tables publiques

-- 1. Sécuriser la table articles_backup (contient des données sensibles)
ALTER TABLE public.articles_backup ENABLE ROW LEVEL SECURITY;

-- Policy restrictive : seuls les admins peuvent accéder à la sauvegarde
CREATE POLICY "Only admins can access articles backup" 
ON public.articles_backup 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- 2. Vérifier et activer RLS sur toutes les tables qui pourraient en avoir besoin
-- (Certaines pourraient avoir été créées sans RLS)

-- Entrepreneur resources
ALTER TABLE public.entrepreneur_resources ENABLE ROW LEVEL SECURITY;

-- Créer une policy par défaut sécurisée si elle n'existe pas
CREATE POLICY "Only authenticated users can view resources" 
ON public.entrepreneur_resources 
FOR SELECT 
TO authenticated
USING (true);

-- Policy pour les admins pour gérer les ressources
CREATE POLICY "Admins can manage entrepreneur resources" 
ON public.entrepreneur_resources 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- 3. Optionnel : Supprimer la table backup après migration réussie
-- (Décommentez si vous voulez la supprimer définitivement)
-- DROP TABLE IF EXISTS public.articles_backup;