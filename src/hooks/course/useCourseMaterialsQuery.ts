
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
          toast({
            title: "Connexion requise",
            description: "Vous devez être connecté pour accéder aux ressources du cours.",
            variant: "destructive",
          });
          navigate("/auth");
          return [];
        }
        
        console.log("Construction de la requête Supabase");
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
          
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
          console.log(`Filtrage par sous-étape: "${substepTitle}"`);
        } else {
          query = query.is('substep_title', null);
          console.log("Filtrage pour l'étape principale (substep_title IS NULL)");
        }
        
        // Add filter for subsubstep_title if provided
        if (subsubstepTitle) {
          query = query.eq('subsubstep_title', subsubstepTitle);
          console.log(`Filtrage par sous-sous-étape: "${subsubstepTitle}"`);
        }
        
        console.log("Exécution de la requête Supabase");
        const { data, error } = await query;
          
        if (error) {
          console.error("Erreur de requête Supabase:", error);
          throw error;
        }
        
        console.log(`Récupéré ${data?.length || 0} matériaux de cours:`, data);
        
        if (data && data.length > 0) {
          data.forEach((item, index) => {
            console.log(`Matériau ${index + 1}:`, {
              id: item.id,
              step_id: item.step_id,
              substep_title: item.substep_title,
              subsubstep_title: item.subsubstep_title,
              title: item.title,
              resource_type: item.resource_type,
              course_content: item.course_content ? `[Contenu disponible, ${item.course_content.length} caractères]` : 'Non disponible'
            });
          });
          
          setMaterials(data as CourseMaterial[]);
          return data as CourseMaterial[];
        } else {
          console.log("Aucun matériau trouvé pour cette étape/sous-étape/sous-sous-étape");
          return [];
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des matériaux du cours:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les ressources du cours.",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
  
  return {
    materials: courseMaterials || materials,
    isLoading,
    error,
    refetch
  };
};
