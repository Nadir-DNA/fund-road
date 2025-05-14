
import { supabase } from "@/integrations/supabase/client";
import { UserResource } from "./types";
import { toast } from "@/components/ui/use-toast";

export const useUserResource = () => {
  const getUserResource = async (userId: string, stepId: number, substepTitle: string, resourceType: string) => {
    try {
      // Utiliser order + limit pour garantir un seul résultat même en cas de doublons
      const { data, error } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', userId)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        // Ne pas considérer comme une erreur quand aucune donnée n'est trouvée
        if (error.code === 'PGRST116') {
          console.log("Aucune ressource trouvée pour l'utilisateur");
          return null;
        }
        console.error("Erreur lors de la récupération de la ressource utilisateur:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Erreur inattendue lors de la récupération de la ressource utilisateur:", error);
      
      // Notifications d'erreur uniquement pour les erreurs inattendues
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos données. Veuillez réessayer ultérieurement.",
        variant: "destructive"
      });
      
      return null;
    }
  };

  return { getUserResource };
};
