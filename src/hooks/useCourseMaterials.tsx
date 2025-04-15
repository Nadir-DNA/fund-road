
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface CourseMaterial {
  id: string;
  step_id: number;
  substep_title: string;
  title: string;
  description: string;
  resource_type: string;
  file_url: string | null;
  is_mandatory: boolean;
  course_content: string | null;
}

export const useCourseMaterials = (stepId: number, substepTitle: string | null) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchMaterials = async () => {
    setIsLoading(true);
    
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder aux ressources du cours.",
        variant: "destructive",
      });
      navigate("/auth");
      return [];
    }
    
    try {
      // Query builder
      let query = supabase
        .from('entrepreneur_resources')
        .select('*')
        .eq('step_id', stepId);
        
      // Add substep filter if applicable
      if (substepTitle) {
        query = query.eq('substep_title', substepTitle);
      }
        
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      if (data) {
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUserProgress = async (userId: string, stepId: number, substepTitle: string | null) => {
    if (!substepTitle) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_substep_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .single();
        
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
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching user resource:", error);
      return null;
    }
  };
  
  return {
    materials,
    isLoading,
    fetchMaterials,
    getUserProgress,
    getUserResource,
  };
};
