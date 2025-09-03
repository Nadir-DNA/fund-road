-- CORRECTIF DE SÉCURITÉ CRITIQUE: Protéger les adresses email des utilisateurs

-- 1. Supprimer la policy dangereuse qui expose tout publiquement
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2. Créer une nouvelle policy sécurisée : les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 3. Policy pour que les utilisateurs puissent créer leur propre profil
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Ajouter une table publique séparée pour les informations non-sensibles si nécessaire
CREATE TABLE IF NOT EXISTS public.public_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS sur la nouvelle table
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Policy pour que tout le monde puisse voir les profils publics (sans email)
CREATE POLICY "Anyone can view public profiles" 
ON public.public_profiles 
FOR SELECT 
USING (true);

-- Policy pour que les utilisateurs puissent gérer leur profil public
CREATE POLICY "Users can manage own public profile" 
ON public.public_profiles 
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Fonction pour synchroniser les profils publics
CREATE OR REPLACE FUNCTION sync_public_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.public_profiles (id, display_name, avatar_url)
    VALUES (NEW.id, 
            COALESCE(NEW.username, 'Utilisateur'), 
            NEW.avatar_url)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.public_profiles 
    SET display_name = COALESCE(NEW.username, 'Utilisateur'),
        avatar_url = NEW.avatar_url,
        updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger pour synchroniser automatiquement
CREATE TRIGGER sync_public_profile_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_public_profile();

-- 6. Peupler la table publique avec les données existantes (sans les emails)
INSERT INTO public.public_profiles (id, display_name, avatar_url)
SELECT 
  id, 
  'Utilisateur' AS display_name,  -- Remplacer les emails par un nom générique
  avatar_url
FROM public.profiles
ON CONFLICT (id) DO NOTHING;