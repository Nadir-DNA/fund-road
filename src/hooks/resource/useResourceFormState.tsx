
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing form state with protections against feedback loops
 */
export const useResourceFormState = (
  initialValues: any = {},
  onDataChanged?: (data: any) => void
) => {
  const [formData, setFormData] = useState<any>(initialValues);
  const isInitialRenderRef = useRef(true);
  const debounceTimerRef = useRef<any>(null);
  
  // Seule mise à jour sûre initiale
  useEffect(() => {
    if (isInitialRenderRef.current && initialValues && Object.keys(initialValues).length > 0) {
      console.log("Initial form data set:", initialValues);
      setFormData(initialValues);
      isInitialRenderRef.current = false;
    }
  }, [initialValues]);

  // Handle form field changes with debounce
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      
      // Debounce the onDataChanged callback to avoid rapid updates
      if (onDataChanged) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          console.log("Calling onDataChanged after debounce");
          onDataChanged(updated);
        }, 300);
      }
      
      return updated;
    });
  }, [onDataChanged]);

  // Update all form data at once with protection
  const updateFormData = useCallback((data: any) => {
    // Prevent unnecessary updates
    if (JSON.stringify(data) === JSON.stringify(formData)) {
      console.log("Skipping identical form data update");
      return;
    }
    
    console.log("Updating all form data");
    setFormData(data);
    
    // Same debounce pattern for bulk updates
    if (onDataChanged) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        onDataChanged(data);
      }, 300);
    }
  }, [formData, onDataChanged]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData: updateFormData,
    handleFormChange
  };
};
