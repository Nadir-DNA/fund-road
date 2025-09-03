
import { supabase } from "@/integrations/supabase/client";
import { UserProgress } from "./types";

export const useUserProgress = () => {
  const getUserProgress = async (userId: string, stepId: number, substepTitle: string | null) => {
    if (!substepTitle) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_substep_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      return null;
    }
  };

  return { getUserProgress };
};

