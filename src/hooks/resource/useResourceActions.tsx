
import { useState, useCallback } from 'react';
import { useResourceSave } from "./useResourceSave";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for resource actions like saving
 */
export const useResourceActions = (
  formData: any,
  stepId: number,
  substepTitle: string,
  resourceType: string,
  resourceId: string | null
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get save function from useResourceSave hook
  const { handleSave: saveResource } = useResourceSave({
    formData,
    stepId,
    substepTitle,
    resourceType,
    resourceId,
    onSaved: (id) => {
      console.log("Resource saved with ID:", id);
    },
    setIsSaving,
  });
  
  // Wrapper function for handleSave with session
  const handleSave = useCallback(async (currentSession?: any) => {
    console.log("Save triggered with data:", formData);
    try {
      if (!currentSession) {
        console.error("No valid session available for saving");
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour sauvegarder vos ressources.",
          variant: "destructive"
        });
        navigate("/auth");
        return false;
      }
      
      return await saveResource(currentSession);
    } catch (err) {
      console.error("Error during save operation:", err);
      return false;
    }
  }, [formData, saveResource, toast, navigate]);

  return {
    isSaving,
    handleSave
  };
};
