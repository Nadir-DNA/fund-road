
import { useState, useCallback } from 'react';

/**
 * Hook for managing form state
 */
export const useResourceFormState = (
  initialValues: any = {},
  onDataChanged?: (data: any) => void
) => {
  const [formData, setFormData] = useState<any>(initialValues);

  // Handle form field changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      if (onDataChanged) onDataChanged(updated);
      return updated;
    });
  }, [onDataChanged]);

  // Update all form data at once
  const updateFormData = useCallback((data: any) => {
    setFormData(data);
    if (onDataChanged) onDataChanged(data);
  }, [onDataChanged]);

  return {
    formData,
    setFormData: updateFormData,
    handleFormChange
  };
};
