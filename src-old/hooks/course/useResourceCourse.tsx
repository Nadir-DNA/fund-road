
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useResourceCourse = (stepId: number, substepTitle: string | null) => {
  return useQuery({
    queryKey: ['resource-course', stepId, substepTitle],
    queryFn: async () => {
      console.log(`Fetching course for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
      
      let query = supabase
        .from('entrepreneur_resources')
        .select('*')
        .eq('step_id', stepId)
        .eq('resource_type', 'course');
      
      // Handle substep filtering
      if (substepTitle) {
        query = query.eq('substep_title', substepTitle);
      } else {
        query = query.is('substep_title', null);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error("Error fetching course:", error);
        throw error;
      }
      
      console.log(`Found course for step ${stepId}:`, data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: stepId > 0,
  });
};
