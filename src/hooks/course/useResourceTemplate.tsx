
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CourseMaterial } from "./types";

export const useResourceTemplate = () => {
  const { toast } = useToast();

  const createOrUpdateResourceTemplate = async (resourceData: Partial<CourseMaterial>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }
      
      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.session.user.id)
        .single();
        
      if (!userProfile?.is_admin) {
        throw new Error("Vous n'avez pas les permissions nécessaires");
      }
      
      const { data, error } = await supabase
        .from('entrepreneur_resources')
        .upsert({
          step_id: resourceData.step_id!,
          substep_title: resourceData.substep_title!,
          substep_index: resourceData.substep_title?.toLowerCase().replace(/\s+/g, '-') || 'default',
          title: resourceData.title!,
          description: resourceData.description,
          resource_type: resourceData.resource_type!,
          file_url: resourceData.file_url,
          is_mandatory: resourceData.is_mandatory || false,
          course_content: resourceData.course_content
        }, { 
          onConflict: 'step_id,substep_title,resource_type' 
        })
        .select();
      
      if (error) throw error;
      
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

  return { createOrUpdateResourceTemplate };
};

