
import { useEffect, useMemo } from 'react';
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
  // Initialize default values
  const initialValues = useMemo(() => defaultValues || {}, [defaultValues]);
  
  // Use the form state management hook
  const {
    formData,
    setFormData,
    handleFormChange
  } = useResourceFormState(initialValues, onDataSaved);

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
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved) {
      onDataSaved(initialValues);
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
