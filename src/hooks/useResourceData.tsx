import { useEffect, useMemo, useRef, useState } from 'react';
import { useResourceDataLoader } from "./resource/useResourceDataLoader";
import { useResourceFormState } from "./resource/useResourceFormState";
import { useResourceActions } from "./resource/useResourceActions";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing resource data with resilience to network issues
 */
export const useResourceData = (
  stepId: number, 
  substepTitle: string,
  resourceType: string,
  defaultValues?: any,
  onDataSaved?: (data: any) => void
) => {
  // Protection against multiple calls to onDataSaved
  const hasCalledInitialDataSavedRef = useRef(false);
  const isInitializingRef = useRef(true);
  const firstLoadCompletedRef = useRef(false);
  const previousDataStringRef = useRef("");
  const manualSaveRequestedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formSubmittedRef = useRef(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  
  // Initialize default values with memoization to prevent loops
  const initialValues = useMemo(() => defaultValues || {}, []);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    };
    
    checkAuth();
  }, []);
  
  // Use the form state management hook with protection against loops
  const {
    formData,
    setFormData,
    handleFormChange,
    triggerManualUpdate
  } = useResourceFormState(initialValues, (data) => {
    // Skip callbacks during initialization or loops
    if (!isInitializingRef.current && onDataSaved) {
      // Only trigger onDataSaved for manual saves or significant changes
      const currentDataString = JSON.stringify(data);
      if ((manualSaveRequestedRef.current || currentDataString !== previousDataStringRef.current) && 
          firstLoadCompletedRef.current) {
        console.log("Data changed after initialization, calling onDataSaved");
        previousDataStringRef.current = currentDataString;
        onDataSaved(data);
        // Reset the manual save flag
        manualSaveRequestedRef.current = false;
      }
    }
  });

  // Use the data loader hook
  const {
    isLoading,
    isOfflineMode,
    resourceId,
    session,
    fetchSession,
    retryLoading
  } = useResourceDataLoader(stepId, substepTitle, resourceType, (loadedData) => {
    // Avoid cascade triggers during initial loading
    isInitializingRef.current = true;
    console.log("Data loaded from resourceDataLoader:", loadedData);
    
    // Check if we really need to update (avoid unnecessary renders)
    if (JSON.stringify(loadedData) !== JSON.stringify(formData)) {
      setFormData(loadedData);
      
      // If we're in offline mode and this is the first load, show warning
      if (loadedData.offlineMode && !showOfflineWarning) {
        setShowOfflineWarning(true);
        toast({
          title: "Mode hors ligne",
          description: "Vos données seront enregistrées localement et synchronisées ultérieurement",
          variant: "warning"
        });
      }
    }
    
    // Delay the end of initialization to avoid loops
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      isInitializingRef.current = false;
      firstLoadCompletedRef.current = true;
      debounceTimerRef.current = null;
    }, 500);
  });

  // Use the resource actions hook with manual save tracking
  const {
    isSaving,
    handleSave,
    handleManualSave: originalHandleManualSave
  } = useResourceActions(
    formData,
    stepId, 
    substepTitle,
    resourceType,
    resourceId
  );
  
  // If offline, save to localStorage
  const saveOfflineData = (data: any) => {
    try {
      const offlineKey = `offline_resource_${stepId}_${substepTitle}_${resourceType}`;
      localStorage.setItem(offlineKey, JSON.stringify(data));
      console.log("Saved data to offline storage");
      return true;
    } catch (err) {
      console.error("Failed to save offline:", err);
      return false;
    }
  };
  
  // Wrap the manual save handler to set our flag and enforce authentication
  const handleManualSave = async (session: any) => {
    console.log("Manual save requested");
    formSubmittedRef.current = true;
    
    if (isOfflineMode) {
      const success = saveOfflineData(formData);
      if (success) {
        toast({
          title: "Enregistré hors ligne",
          description: "Vos données seront synchronisées quand la connexion sera rétablie",
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer vos données hors ligne",
          variant: "destructive"
        });
        return false;
      }
    }
    
    if (!session) {
      // Check for current session
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast({
            title: "Authentification requise",
            description: "Vous devez être connecté pour sauvegarder vos données.",
            variant: "destructive"
          });
          return false;
        }
        session = data.session;
      } catch (err) {
        console.error("Failed to check auth:", err);
        // Fall back to offline mode
        setShowOfflineWarning(true);
        return saveOfflineData(formData);
      }
    }
    
    manualSaveRequestedRef.current = true;
    return originalHandleManualSave(session);
  };

  // Initial values effect - run ONCE in a controlled way
  useEffect(() => {
    // Only process if we have meaningful initial values and haven't called onDataSaved yet
    if (
      initialValues && 
      Object.keys(initialValues).length > 0 && 
      onDataSaved && 
      !hasCalledInitialDataSavedRef.current &&
      !isInitializingRef.current &&
      firstLoadCompletedRef.current
    ) {
      console.log("Initial values setup complete, safe to call onDataSaved once with delay");
      
      // Delay to avoid initialization cascades
      setTimeout(() => {
        if (!hasCalledInitialDataSavedRef.current) {
          hasCalledInitialDataSavedRef.current = true;
          
          // Only trigger after meaningful data changes
          const initialDataString = JSON.stringify(initialValues);
          if (initialDataString !== previousDataStringRef.current && initialDataString.length > 10) {
            previousDataStringRef.current = initialDataString;
            console.log("First and only initial onDataSaved call");
            onDataSaved(initialValues);
          }
        }
      }, 800);
    }
  }, [initialValues, onDataSaved, firstLoadCompletedRef.current]);

  // Auto-save effect triggered when form data changes and user is authenticated
  useEffect(() => {
    // Skip during initialization
    if (isInitializingRef.current || !userId) return;
    
    // Debounce to avoid too many saves
    const currentDataString = JSON.stringify(formData);
    if (currentDataString !== previousDataStringRef.current && 
        currentDataString.length > 20 &&
        firstLoadCompletedRef.current) {
      
      console.log("Data changed, triggering auto-save");
      const saveTimeout = setTimeout(() => {
        // If we're online and have a session, use the online save
        if (!isOfflineMode && session) {
          handleSave(session);
        } 
        // Otherwise save to local storage
        else if (formData) {
          saveOfflineData(formData);
        }
        
        previousDataStringRef.current = currentDataString;
      }, 2000); // 2 second debounce
      
      return () => clearTimeout(saveTimeout);
    }
  }, [formData, session, userId, isOfflineMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    isLoading,
    isSaving,
    isOfflineMode,
    showOfflineWarning,
    handleFormChange,
    handleSave,
    handleManualSave,
    setFormData: triggerManualUpdate,
    session,
    userId,
    retryLoading
  };
};
