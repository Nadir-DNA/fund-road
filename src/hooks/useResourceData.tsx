
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
  const initialValues = useMemo(() => defaultValues || {}, []);
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);

  // Initial values effect ONLY once
  useMemo(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved) {
      onDataSaved(initialValues);
    }
  }, []);

  useResourceDataFetch({
    stepId,
    substepTitle,
    resourceType,
    onData: (data) => onDataSaved && onDataSaved(data),
    setFormData,
    setResourceId,
    setIsLoading,
  });

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (onDataSaved) onDataSaved(updated);
      return updated;
    });
  }, [onDataSaved]);

  const { handleSave } = useResourceSave({
    formData,
    stepId,
    substepTitle,
    resourceType,
    resourceId,
    onSaved: (id) => setResourceId(id),
    setIsSaving,
  });

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData
  };
};
