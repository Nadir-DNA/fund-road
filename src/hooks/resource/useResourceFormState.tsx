
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
  const previousDataRef = useRef<string>("");
  
  // Seule mise à jour sûre initiale
  useEffect(() => {
    if (isInitialRenderRef.current && initialValues && Object.keys(initialValues).length > 0) {
      console.log("Initial form data set:", initialValues);
      setFormData(initialValues);
      previousDataRef.current = JSON.stringify(initialValues);
      isInitialRenderRef.current = false;
    }
  }, [initialValues]);

  // Handle form field changes with debounce
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      
      // Vérifier si les données ont réellement changé
      const updatedString = JSON.stringify(updated);
      if (updatedString === previousDataRef.current) {
        console.log("No actual data change detected, skipping callback");
        return updated;
      }
      
      previousDataRef.current = updatedString;
      
      // Debounce the onDataChanged callback to avoid rapid updates
      if (onDataChanged) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          console.log("Calling onDataChanged after debounce");
          onDataChanged(updated);
        }, 500); // Increased to reduce frequency
      }
      
      return updated;
    });
  }, [onDataChanged]);

  // Update all form data at once with protection
  const updateFormData = useCallback((data: any) => {
    // Convert to string for proper comparison
    const dataString = JSON.stringify(data);
    
    // Prevent unnecessary updates and loops
    if (dataString === previousDataRef.current) {
      console.log("Skipping identical form data update");
      return;
    }
    
    previousDataRef.current = dataString;
    console.log("Updating all form data");
    setFormData(data);
    
    // Same debounce pattern for bulk updates with increased delay
    if (onDataChanged) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        console.log("Calling onDataChanged after bulk update debounce");
        onDataChanged(data);
      }, 600);
    }
  }, [onDataChanged]);
  
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
