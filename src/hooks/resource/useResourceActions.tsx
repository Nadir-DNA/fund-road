
import { useState, useCallback, useRef } from 'react';
import { useResourceSave } from "./useResourceSave";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for resource actions like saving with protection contre les boucles infinies
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
  const lastSavedDataRef = useRef<string>(JSON.stringify(formData || {}));
  const saveInProgressRef = useRef(false);
  
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
  
  // Wrapper function for handleSave with session and protection contre les boucles
  const handleSave = useCallback(async (currentSession?: any) => {
    console.log("Save triggered with data:", formData);
    
    // Éviter les sauvegardes simultanées ou trop fréquentes
    if (saveInProgressRef.current) {
      console.log("Save already in progress, skipping");
      return false;
    }
    
    // Éviter de sauvegarder des données identiques à la dernière sauvegarde
    const currentDataString = JSON.stringify(formData || {});
    if (currentDataString === lastSavedDataRef.current) {
      console.log("No changes detected since last save, skipping");
      return true;
    }
    
    try {
      saveInProgressRef.current = true;
      
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
      
      const saveResult = await saveResource(currentSession);
      
      if (saveResult) {
        // Mettre à jour la référence uniquement en cas de succès
        lastSavedDataRef.current = currentDataString;
      }
      
      return saveResult;
    } catch (err) {
      console.error("Error during save operation:", err);
      return false;
    } finally {
      // Autoriser de nouvelles sauvegardes après une période minimale
      setTimeout(() => {
        saveInProgressRef.current = false;
      }, 1000);
    }
  }, [formData, saveResource, toast, navigate]);

  return {
    isSaving,
    handleSave
  };
};
