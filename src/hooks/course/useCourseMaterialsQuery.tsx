
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CourseMaterial } from "./types";

export const useCourseMaterialsQuery = (stepId: number, substepTitle: string | null, subsubstepTitle?: string | null) => {
  const { data: materials, isLoading, error, refetch } = useQuery<CourseMaterial[], Error>({
    queryKey: ['course-materials', stepId, substepTitle, subsubstepTitle],
    queryFn: async () => {
      try {
        console.log(`Fetching materials for step ${stepId}, substep ${substepTitle || 'null'}, subsubstep ${subsubstepTitle || 'null'}`);
        
        let query = supabase.from('entrepreneur_resources').select('*').eq('step_id', stepId);
        
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        if (subsubstepTitle) {
          query = query.eq('subsubstep_title', subsubstepTitle);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching course materials:', error);
          throw new Error(`Failed to fetch course materials: ${error.message}`);
        }
        
        console.log(`Found ${data?.length || 0} materials`);
        return data as CourseMaterial[];
      } catch (err) {
        console.error('Error in useCourseMaterialsQuery:', err);
        throw err;
      }
    }
  });
  
  return { materials, isLoading, error, refetch };
};
