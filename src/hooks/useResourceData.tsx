
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
  
  // Initialize default values with memoization
  const initialValues = useMemo(() => defaultValues || {}, [defaultValues]);
  
  // Use the form state management hook with protection contre les boucles
  const {
    formData,
    setFormData,
    handleFormChange
  } = useResourceFormState(initialValues, (data) => {
    // Éviter les déclenchements en cascade pendant l'initialisation
    if (hasCalledInitialDataSavedRef.current && onDataSaved) {
      onDataSaved(data);
    }
  });

  // Use the data loader hook
  const {
    isLoading,
    resourceId,
    session,
    fetchSession
  } = useResourceDataLoader(stepId, substepTitle, resourceType, setFormData);

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

  // Initial values effect ONLY once
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved && !hasCalledInitialDataSavedRef.current) {
      console.log("Setting initial values, delaying onDataSaved call");
      setTimeout(() => {
        hasCalledInitialDataSavedRef.current = true;
        if (onDataSaved) {
          onDataSaved(initialValues);
        }
      }, 500); // Delay to avoid initialization loops
    }
  }, [initialValues, onDataSaved]);

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
