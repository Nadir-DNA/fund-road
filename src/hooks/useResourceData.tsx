
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
  // Protection contre les appels multiples à onDataSaved
  const hasCalledInitialDataSavedRef = useRef(false);
  const isInitializingRef = useRef(true);
  
  // Initialize default values with memoization pour éviter les boucles
  const initialValues = useMemo(() => defaultValues || {}, [defaultValues]);
  
  // Use the form state management hook with protection contre les boucles
  const {
    formData,
    setFormData,
    handleFormChange
  } = useResourceFormState(initialValues, (data) => {
    // Éviter les déclenchements pendant l'initialisation ou les boucles
    if (!isInitializingRef.current && hasCalledInitialDataSavedRef.current && onDataSaved) {
      console.log("Data changed after initialization, safe to call onDataSaved");
      onDataSaved(data);
    }
  });

  // Use the data loader hook
  const {
    isLoading,
    resourceId,
    session,
    fetchSession
  } = useResourceDataLoader(stepId, substepTitle, resourceType, (loadedData) => {
    // Éviter les déclenchements en cascade lors du chargement initial
    isInitializingRef.current = true;
    console.log("Data loaded from resourceDataLoader:", loadedData);
    setFormData(loadedData);
    
    // Différer la fin de l'initialisation pour éviter les boucles
    setTimeout(() => {
      isInitializingRef.current = false;
    }, 500);
  });

  // Use the resource actions hook
  const {
    isSaving,
    handleSave
  } = useResourceActions(
    formData,
    stepId, 
    substepTitle,
    resourceType,
    resourceId
  );

  // Initial values effect - exécuté UNE SEULE FOIS de façon contrôlée
  useEffect(() => {
    if (
      initialValues && 
      Object.keys(initialValues).length > 0 && 
      onDataSaved && 
      !hasCalledInitialDataSavedRef.current &&
      !isInitializingRef.current
    ) {
      console.log("Setting initial values, calling onDataSaved once with delay");
      
      // Délai pour éviter les cascades d'initialisation
      setTimeout(() => {
        if (!hasCalledInitialDataSavedRef.current) {
          hasCalledInitialDataSavedRef.current = true;
          if (onDataSaved) {
            console.log("First and only initial onDataSaved call");
            onDataSaved(initialValues);
          }
        }
      }, 800);
    }
  }, [initialValues, onDataSaved, isInitializingRef.current]);

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData,
    session
  };
};
