
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
  const saveDebounceTimerRef = useRef<any>(null);
  const saveAttemptCountRef = useRef(0);
  
  // Get save function from useResourceSave hook
  const { handleSave: saveResource, handleManualSave: saveResourceManual } = useResourceSave({
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
    
    // Protection contre les boucles - limiter le nombre de tentatives rapprochées
    saveAttemptCountRef.current += 1;
    if (saveAttemptCountRef.current > 3) {
      const resetCountAndBlock = () => {
        saveAttemptCountRef.current = 0;
        return false;
      };
      
      console.log("Too many save attempts in short period, blocking...");
      setTimeout(() => { saveAttemptCountRef.current = 0; }, 3000);
      return resetCountAndBlock();
    }
    
    // Éviter les sauvegardes simultanées
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
    
    // Debounce les sauvegardes pour éviter les rafales de requêtes
    if (saveDebounceTimerRef.current) {
      clearTimeout(saveDebounceTimerRef.current);
    }
    
    return new Promise((resolve) => {
      saveDebounceTimerRef.current = setTimeout(async () => {
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
            resolve(false);
            return;
          }
          
          const saveResult = await saveResource(currentSession);
          
          if (saveResult) {
            // Mettre à jour la référence uniquement en cas de succès
            lastSavedDataRef.current = currentDataString;
          }
          
          resolve(saveResult);
        } catch (err) {
          console.error("Error during save operation:", err);
          resolve(false);
        } finally {
          // Autoriser de nouvelles sauvegardes après une période minimale
          setTimeout(() => {
            saveInProgressRef.current = false;
          }, 1000);
        }
      }, 400); // Debounce delay
    });
  }, [formData, saveResource, toast, navigate]);
  
  // Version explicitement manuelle pour le bouton de sauvegarde
  const handleManualSave = useCallback(async (currentSession?: any) => {
    console.log("Manual save requested");
    
    // Réinitialiser le compteur pour les sauvegardes manuelles
    saveAttemptCountRef.current = 0;
    
    if (!currentSession) {
      console.error("No valid session available");
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour sauvegarder vos ressources.",
        variant: "destructive"
      });
      navigate("/auth");
      return false;
    }
    
    // Utiliser la version "manuelle" de la sauvegarde
    return saveResourceManual(currentSession);
  }, [saveResourceManual, toast, navigate]);

  return {
    isSaving,
    handleSave,
    handleManualSave
  };
};
