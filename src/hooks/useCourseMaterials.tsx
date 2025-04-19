
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface CourseMaterial {
  id: string;
  step_id: number;
  substep_title: string | null;
  title: string;
  description: string;
  resource_type: string;
  file_url: string | null;
  is_mandatory: boolean;
  course_content: string | null;
  component_name: string | null;
}

export const useCourseMaterials = (stepId: number, substepTitle: string | null) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Utiliser React Query pour obtenir les matériaux de cours
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
        
        // Construire la requête de base
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
          
        // Filtrer par substep_title si disponible
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          // Si pas de substepTitle, chercher les ressources pour l'étape principale
          query = query.is('substep_title', null);
        }
        
        // Exécuter la requête
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
  
  const getUserResource = async (userId: string, stepId: number, substepTitle: string, resourceType: string) => {
    try {
      const { data, error } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', userId)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data is found
        
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching user resource:", error);
      return null;
    }
  };
  
  const createOrUpdateResourceTemplate = async (resourceData: Partial<CourseMaterial>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }
      
      // Vérifier si l'utilisateur est administrateur
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.session.user.id)
        .single();
        
      if (!userProfile?.is_admin) {
        throw new Error("Vous n'avez pas les permissions nécessaires");
      }
      
      // Créer ou mettre à jour le modèle de ressource
      const { data, error } = await supabase
        .from('entrepreneur_resources')
        .upsert({
          step_id: resourceData.step_id!,
          substep_title: resourceData.substep_title!,
          substep_index: resourceData.substep_title?.toLowerCase().replace(/\s+/g, '-') || 'default', // Use substep_index instead of substep_id
          title: resourceData.title!,
          description: resourceData.description,
          resource_type: resourceData.resource_type!,
          file_url: resourceData.file_url,
          is_mandatory: resourceData.is_mandatory || false,
          course_content: resourceData.course_content
        }, { 
          onConflict: 'step_id,substep_title,resource_type' 
        }).select();
      
      if (error) throw error;
      
      // Refresh materials list after creating/updating
      refetch();
      
      toast({
        title: "Succès",
        description: "Ressource créée ou mise à jour avec succès",
        variant: "default",
      });
      
      return data;
      
    } catch (error: any) {
      console.error("Error creating/updating resource template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
      return null;
    }
  };
  
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
