
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Hook pour récupérer les matériels de cours depuis Supabase
 */
export const useCourseMaterials = (stepId: number, substepTitle: string | null, subsubstepTitle?: string | null) => {
  const query = useQuery({
    queryKey: ['course-materials', stepId, substepTitle, subsubstepTitle],
    queryFn: async () => {
      try {
        console.log(`Fetching course materials for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
        
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
        
        // Properly handle null substep_title
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          // For main step, look for NULL substep_title values
          query = query.is('substep_title', null);
        }
        
        // Add subsubstepTitle filter if provided
        if (subsubstepTitle) {
          query = query.eq('subsubstep_title', subsubstepTitle);
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
    // Force refetch when stepId or substepTitle changes
    enabled: stepId > 0,
  });

  // Return a structured object with materials property
  return {
    materials: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
