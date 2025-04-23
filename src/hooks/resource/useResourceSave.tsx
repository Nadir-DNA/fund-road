
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SaveOptions {
  formData: any;
  stepId: number;
  substepTitle: string;
  resourceType: string;
  resourceId: string | null;
  onSaved?: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
}

export function useResourceSave({
  formData,
  stepId,
  substepTitle,
  resourceType,
  resourceId,
  onSaved,
  setIsSaving
}: SaveOptions) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = useCallback(async (session?: any) => {
    console.log("handleSave called with session:", session ? "present" : "not present");
    try {
      setIsSaving(true);
      
      if (!session || !session.user) {
        console.error("No valid session available");
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour sauvegarder vos ressources.",
          variant: "destructive"
        });
        navigate("/auth");
        return false;
      }
      
      try {
        console.log(`Saving resource: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}, resourceId=${resourceId}`);
        console.log("Form data:", formData);
        
        // Ensure we have valid content to save
        if (!formData || typeof formData !== 'object') {
          throw new Error("Invalid form data for saving");
        }
        
        let result;
        
        if (resourceId) {
          // Update existing
          console.log(`Updating resource with ID: ${resourceId}`);
          result = await supabase
            .from('user_resources')
            .update({
              content: formData,
              updated_at: new Date().toISOString()
            })
            .eq('id', resourceId)
            .select();
            
          console.log("Update result:", result);
        } else {
          // Create new resource
          console.log("Creating new resource");
          // Ensure all required fields are present
          const resourceData = {
            user_id: session.user.id,
            step_id: stepId,
            substep_title: substepTitle,
            resource_type: resourceType,
            content: formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("Resource data to insert:", resourceData);
          
          result = await supabase
            .from('user_resources')
            .insert(resourceData)
            .select();
            
          console.log("Insert result:", result);
        }
        
        const { error, data } = result;
        if (error) {
          console.error("Supabase error during save:", error);
          throw error;
        }
        
        if (data && data[0]) {
          console.log("Successfully saved resource with ID:", data[0].id);
          if (onSaved) {
            onSaved(data[0].id);
          }

          toast({
            title: "Ressource sauvegardée",
            description: "Vos données ont été enregistrées avec succès."
          });
          
          return true;
        } else {
          console.error("No data returned from save operation");
          throw new Error("Aucune donnée retournée lors de la sauvegarde");
        }
      } catch (error: any) {
        console.error("Erreur lors de la sauvegarde de la ressource:", error);
        toast({
          title: "Erreur de sauvegarde",
          description: error.message || "Une erreur est survenue lors de la sauvegarde.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error during save:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate, onSaved, setIsSaving, toast]);

  return { handleSave };
}
