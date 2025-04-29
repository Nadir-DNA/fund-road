
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
  const previousDataRef = useRef<string>(JSON.stringify(initialValues || {}));
  const updatesCountRef = useRef(0);
  
  // Safe initial update
  useEffect(() => {
    if (isInitialRenderRef.current && initialValues && Object.keys(initialValues).length > 0) {
      console.log("Initial form data set:", initialValues);
      setFormData(initialValues);
      previousDataRef.current = JSON.stringify(initialValues);
      isInitialRenderRef.current = false;
    }
  }, []);  // Empty dependency array to run only once

  // Handle form field changes with debounce
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      
      // Check if data has actually changed
      const updatedString = JSON.stringify(updated);
      if (updatedString === previousDataRef.current) {
        console.log("No actual data change detected, skipping callback");
        return updated;
      }
      
      previousDataRef.current = updatedString;
      
      // Limit update frequency
      updatesCountRef.current += 1;
      if (updatesCountRef.current > 10) {
        setTimeout(() => { updatesCountRef.current = 0; }, 2000);
        console.log("Too many updates in short period, throttling callbacks");
        return updated;
      }
      
      // Debounce the onDataChanged callback
      if (onDataChanged) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          console.log("Calling onDataChanged after debounce");
          onDataChanged(updated);
        }, 800);  // Increased debounce time
      }
      
      return updated;
    });
  }, [onDataChanged]);

  // Update all form data at once with protection
  const updateFormData = useCallback((data: any) => {
    // Skip if data is null or undefined
    if (!data) {
      console.log("Skipping update with null/undefined data");
      return;
    }
    
    // Convert to string for proper comparison
    const dataString = JSON.stringify(data);
    
    // Prevent unnecessary updates and loops
    if (dataString === previousDataRef.current) {
      console.log("Skipping identical form data update");
      return;
    }
    
    // Throttle updates
    updatesCountRef.current += 1;
    if (updatesCountRef.current > 5) {
      setTimeout(() => { updatesCountRef.current = 0; }, 2000);
      console.log("Too many bulk updates, throttling");
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
      }, 1000);
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
