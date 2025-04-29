
import { useCallback, useRef } from 'react';
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
  const lastSavedContentRef = useRef('');
  const toastShownRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);
  const initialSaveCompletedRef = useRef(false);
  const manualSaveRef = useRef(false);
  const savesAttemptedRef = useRef(0);
  const firstRenderRef = useRef(true);
  
  // Skip the very first save attempt to avoid initialization loops
  if (firstRenderRef.current) {
    console.log("Skipping first save attempt due to initialization");
    lastSavedContentRef.current = JSON.stringify(formData || {});
    firstRenderRef.current = false;
  }
  
  const handleSave = useCallback(async (session?: any) => {
    console.log("handleSave called with session:", session ? "present" : "not present");
    
    // Increment attempt counter to detect loops
    savesAttemptedRef.current += 1;
    
    // Protect against rapid save loops
    if (savesAttemptedRef.current > 3 && !manualSaveRef.current) {
      console.warn("Too many save attempts detected, throttling to prevent loops");
      setTimeout(() => { savesAttemptedRef.current = 0; }, 5000);
      return false;
    }
    
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
    
    // Don't save during initialization 
    if (!initialSaveCompletedRef.current) {
      console.log("Initial save protection activated, marking as completed");
      initialSaveCompletedRef.current = true;
      return true;
    }
    
    // Check if content has changed to prevent unnecessary saves
    const contentSignature = JSON.stringify(formData);
    if (contentSignature === lastSavedContentRef.current) {
      console.log("Content unchanged, skipping save");
      return true;
    }
    
    // Skip saves with very small content
    if (contentSignature.length < 10 && !manualSaveRef.current) {
      console.log("Content too minimal, skipping automatic save");
      return true;
    }
    
    setIsSaving(true);
    
    try {
      console.log(`Saving resource: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}, resourceId=${resourceId}`);
      
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
        
        result = await supabase
          .from('user_resources')
          .insert(resourceData)
          .select();
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

        // Update the last saved content signature
        lastSavedContentRef.current = contentSignature;
        
        // Only show toast for manual saves or first successful save, and limit frequency
        if ((manualSaveRef.current || !toastShownRef.current) && contentSignature.length > 20) {
          toast({
            title: "Ressource sauvegardée",
            description: "Vos données ont été enregistrées avec succès."
          });
          
          // Set flag to avoid showing toast too frequently
          toastShownRef.current = true;
          manualSaveRef.current = false;
          
          // Reset toast flag after longer delay
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          
          saveTimeoutRef.current = setTimeout(() => {
            toastShownRef.current = false;
          }, 30000); // 30 seconds to really reduce frequency
        }
        
        // Reset save attempts counter after successful save
        savesAttemptedRef.current = 0;
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
    } finally {
      setIsSaving(false);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate, onSaved, setIsSaving, toast]);

  // Mark a save as "manual" (triggered by the user)
  const handleManualSave = useCallback(async (session?: any) => {
    manualSaveRef.current = true;
    // Reset attempt counter for manual saves
    savesAttemptedRef.current = 0;
    return handleSave(session);
  }, [handleSave]);

  return { 
    handleSave,
    handleManualSave
  };
}
