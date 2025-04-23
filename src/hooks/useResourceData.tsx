
import { useState, useMemo, useCallback } from 'react';
import { useResourceSession } from "./resource/useResourceSession";
import { useResourceDataFetch } from "./resource/useResourceDataFetch";
import { useResourceSave } from "./resource/useResourceSave";

interface UserResource {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  resource_type: string;
  content: any;
  created_at?: string;
  updated_at?: string;
}

export const useResourceData = (
  stepId: number, 
  substepTitle: string,
  resourceType: string,
  defaultValues?: any,
  onDataSaved?: (data: any) => void
) => {
  const initialValues = useMemo(() => defaultValues || {}, [defaultValues]);
  const [formData, setFormData] = useState<any>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const { requireAuth } = useResourceSession();

  // Initial values effect ONLY once
  useMemo(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved) {
      onDataSaved(initialValues);
    }
  }, [initialValues, onDataSaved]);

  // Fetch data from Supabase
  useResourceDataFetch({
    stepId,
    substepTitle,
    resourceType,
    onData: (data) => {
      console.log("Data fetched and passed to onData callback:", data);
      if (onDataSaved) onDataSaved(data);
    },
    setFormData,
    setResourceId,
    setIsLoading,
  });

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      if (onDataSaved) onDataSaved(updated);
      return updated;
    });
  }, [onDataSaved]);

  const handleSave = useCallback(async () => {
    console.log("Manual save triggered with data:", formData);
    try {
      // Ensure we have a valid session
      const session = await requireAuth();
      
      if (!session) {
        console.error("No valid session for saving");
        return;
      }

      // Call the save hook
      const { handleSave: saveResource } = useResourceSave({
        formData,
        stepId,
        substepTitle,
        resourceType,
        resourceId,
        onSaved: (id) => {
          console.log("Resource saved with ID:", id);
          setResourceId(id);
        },
        setIsSaving,
      });
      
      await saveResource();
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, requireAuth]);

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData
  };
};
