
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CourseMaterial } from "./types";

export const useCourseMaterialsQuery = (stepId: number, substepTitle: string | null, subsubstepTitle?: string | null) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: courseMaterials, isLoading, error, refetch } = useQuery({
    queryKey: ['courseMaterials', stepId, substepTitle, subsubstepTitle],
    queryFn: async () => {
      try {
        console.log(`Récupération des matériaux pour l'étape: ${stepId}, sous-étape: ${substepTitle || 'étape principale'}, sous-sous-étape: ${subsubstepTitle || 'aucune'}`);
        
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("Aucune session trouvée lors de la récupération des matériaux");
          return [];
        }
        
        console.log("Construction de la requête Supabase");
        let query = supabase
          .from('entrepreneur_resources')
          .select('*');
          
        // Add filter conditions
        const filters = [];
        
        // Always filter by step_id
        filters.push(`step_id.eq.${stepId}`);
        
        // Filter by substep_title
        if (substepTitle) {
          filters.push(`substep_title.eq.${substepTitle}`);
          console.log(`Filtrage par sous-étape: "${substepTitle}"`);
        } else {
          filters.push(`substep_title.is.null`);
          console.log("Filtrage pour l'étape principale (substep_title IS NULL)");
        }
        
        // Filter by subsubstep_title if provided
        if (subsubstepTitle) {
          filters.push(`subsubstep_title.eq.${subsubstepTitle}`);
          console.log(`Filtrage par sous-sous-étape: "${subsubstepTitle}"`);
        }
        
        // Apply all filters with or logic
        query = query.eq('step_id', stepId);
        
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        if (subsubstepTitle) {
          query = query.eq('subsubstep_title', subsubstepTitle);
        }
        
        console.log("Exécution de la requête Supabase");
        const { data, error } = await query;
          
        if (error) {
          console.error("Erreur de requête Supabase:", error);
          throw error;
        }
        
        console.log(`Récupéré ${data?.length || 0} matériaux de cours:`, data);
        
        if (data && data.length > 0) {
          console.log("Traitement des matériaux récupérés...");
          setMaterials(data as CourseMaterial[]);
          return data as CourseMaterial[];
        } else {
          console.log("Aucun matériau trouvé pour cette étape/sous-étape/sous-sous-étape");
          return [];
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des matériaux du cours:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  return {
    materials: courseMaterials || materials,
    isLoading,
    error,
    refetch
  };
};
