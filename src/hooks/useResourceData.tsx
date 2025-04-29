
import { useEffect, useMemo, useRef } from 'react';
import { useResourceDataLoader } from "./resource/useResourceDataLoader";
import { useResourceFormState } from "./resource/useResourceFormState";
import { useResourceActions } from "./resource/useResourceActions";

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
  
  // Initialize default values with memoization to prevent loops
  const initialValues = useMemo(() => defaultValues || {}, []);
  
  // Use the form state management hook with protection against loops
  const {
    formData,
    setFormData,
    handleFormChange
  } = useResourceFormState(initialValues, (data) => {
    // Skip callbacks during initialization or loops
    if (!isInitializingRef.current && onDataSaved) {
      // Compare with previous data to avoid unnecessary callbacks
      const currentDataString = JSON.stringify(data);
      if (currentDataString !== previousDataStringRef.current) {
        console.log("Data changed after initialization, calling onDataSaved");
        previousDataStringRef.current = currentDataString;
        onDataSaved(data);
      }
    }
  });

  // Use the data loader hook
  const {
    isLoading,
    resourceId,
    session,
    fetchSession
  } = useResourceDataLoader(stepId, substepTitle, resourceType, (loadedData) => {
    // Avoid cascade triggers during initial loading
    isInitializingRef.current = true;
    console.log("Data loaded from resourceDataLoader:", loadedData);
    
    // Check if we really need to update (avoid unnecessary renders)
    if (JSON.stringify(loadedData) !== JSON.stringify(formData)) {
      setFormData(loadedData);
    }
    
    // Delay the end of initialization to avoid loops
    setTimeout(() => {
      isInitializingRef.current = false;
      firstLoadCompletedRef.current = true;
    }, 500);
  });

  // Use the resource actions hook
  const {
    isSaving,
    handleSave,
    handleManualSave
  } = useResourceActions(
    formData,
    stepId, 
    substepTitle,
    resourceType,
    resourceId
  );

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
          
          // Compare with current form data to avoid unnecessary updates
          const initialDataString = JSON.stringify(initialValues);
          if (initialDataString !== previousDataStringRef.current) {
            previousDataStringRef.current = initialDataString;
            console.log("First and only initial onDataSaved call");
            onDataSaved(initialValues);
          }
        }
      }, 800);
    }
  }, [initialValues, onDataSaved, firstLoadCompletedRef.current]);

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    handleManualSave,
    setFormData,
    session
  };
};
