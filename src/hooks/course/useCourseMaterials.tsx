
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook pour récupérer les matériels de cours depuis Supabase
 */
export const useCourseMaterials = (stepId: number, substepTitle: string | null) => {
  return useQuery({
    queryKey: ['course-materials', stepId, substepTitle],
    queryFn: async () => {
      try {
        console.log(`Fetching course materials for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
        
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
        
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching course materials:", error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} materials for step ${stepId}:`, data);
        return data || [];
      } catch (err) {
        console.error("Failed to fetch course materials:", err);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les matériaux de cours",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
