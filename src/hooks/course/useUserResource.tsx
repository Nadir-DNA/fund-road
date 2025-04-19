
import { supabase } from "@/integrations/supabase/client";
import { UserResource } from "./types";

export const useUserResource = () => {
  const getUserResource = async (userId: string, stepId: number, substepTitle: string, resourceType: string) => {
    try {
      const { data, error } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', userId)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching user resource:", error);
      return null;
    }
  };

  return { getUserResource };
};

