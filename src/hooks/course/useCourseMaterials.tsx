
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CourseMaterial } from "./types";
import { useUserProgress } from "./useUserProgress";
import { useUserResource } from "./useUserResource";
import { useResourceTemplate } from "./useResourceTemplate";

export const useCourseMaterials = (stepId: number, substepTitle: string | null) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getUserProgress } = useUserProgress();
  const { getUserResource } = useUserResource();
  const { createOrUpdateResourceTemplate } = useResourceTemplate();
  
  const { data: courseMaterials, isLoading, error, refetch } = useQuery({
    queryKey: ['courseMaterials', stepId, substepTitle],
    queryFn: async () => {
      try {
        console.log(`Fetching course materials for step: ${stepId}, substep: ${substepTitle || 'main step'}`);
        
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("No session found when fetching course materials");
          toast({
            title: "Connexion requise",
            description: "Vous devez être connecté pour accéder aux ressources du cours.",
            variant: "destructive",
          });
          navigate("/auth");
          return [];
        }
        
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
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} course materials`, data);
        
        if (data && data.length > 0) {
          setMaterials(data as CourseMaterial[]);
          return data as CourseMaterial[];
        }
        
        return [];
      } catch (error: any) {
        console.error("Error fetching course materials:", error);
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
    refetch,
    getUserProgress,
    getUserResource,
    createOrUpdateResourceTemplate
  };
};

