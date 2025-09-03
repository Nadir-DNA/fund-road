
import { CourseMaterial } from "../types";
import { supabase } from "@/integrations/supabase/client";

export const validateResourceData = async (resourceData: Partial<CourseMaterial>) => {
  if (!resourceData.step_id || !resourceData.title || !resourceData.resource_type) {
    throw new Error("Les champs obligatoires sont manquants");
  }

  // Check if user is admin
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) {
    throw new Error("Vous devez être connecté pour effectuer cette action");
  }
  
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.session.user.id)
    .single();
    
  if (!userProfile?.is_admin) {
    throw new Error("Vous n'avez pas les permissions nécessaires");
  }

  return true;
};
