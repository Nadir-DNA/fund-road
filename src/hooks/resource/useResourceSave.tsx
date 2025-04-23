
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useResourceSession } from "./useResourceSession";

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
  const { requireAuth } = useResourceSession();

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Will throw if not authenticated, redirecting to auth page
      const session = await requireAuth();
      
      try {
        console.log(`Saving resource: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}, resourceId=${resourceId}`);
        console.log("Form data:", formData);
        
        let result;
        if (resourceId) {
          // Update existing
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
          // Insert new with all required fields
          const resourceData = {
            user_id: session.user.id,
            step_id: stepId,
            substep_title: substepTitle,
            resource_type: resourceType,
            content: formData
          };
          
          result = await supabase
            .from('user_resources')
            .insert(resourceData)
            .select();
            
          console.log("Insert result:", result);
        }
        
        const { error, data } = result;
        if (error) throw error;
        
        if (data && data[0] && onSaved) {
          onSaved(data[0].id);
        }

        toast({
          title: "Ressource sauvegardée",
          description: "Vos données ont été enregistrées avec succès."
        });
      } catch (error: any) {
        console.error("Erreur lors de la sauvegarde de la ressource:", error);
        toast({
          title: "Erreur de sauvegarde",
          description: error.message || "Une erreur est survenue lors de la sauvegarde.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // This will happen if requireAuth fails - user will be redirected to auth
      console.error("Auth error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate, onSaved, setIsSaving, toast, requireAuth]);

  return { handleSave };
}
