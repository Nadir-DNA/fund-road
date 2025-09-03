
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
  const manualUpdateTriggeredRef = useRef(false);
  
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
      if (updatesCountRef.current > 10 && !manualUpdateTriggeredRef.current) {
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
          // Only call if we have meaningful data (not empty)
          if (updatedString.length > 10) {
            onDataChanged(updated);
          } else {
            console.log("Data too small, skipping callback");
          }
        }, 1000);  // Increased debounce time
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
    
    // Throttle updates unless it's a manual update
    updatesCountRef.current += 1;
    if (updatesCountRef.current > 5 && !manualUpdateTriggeredRef.current) {
      setTimeout(() => { updatesCountRef.current = 0; }, 2000);
      console.log("Too many bulk updates, throttling");
      return;
    }
    
    previousDataRef.current = dataString;
    console.log("Updating all form data");
    setFormData(data);
    
    // Skip callback for minor updates
    if (dataString.length < 10) {
      console.log("Data too minimal, skipping callback");
      return;
    }
    
    // Same debounce pattern for bulk updates with increased delay
    if (onDataChanged) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        console.log("Calling onDataChanged after bulk update debounce");
        onDataChanged(data);
      }, 1200);
    }
  }, [onDataChanged]);
  
  // Method to trigger a manual update that bypasses throttling
  const triggerManualUpdate = useCallback((data: any) => {
    manualUpdateTriggeredRef.current = true;
    updateFormData(data);
    // Reset the flag after a delay
    setTimeout(() => {
      manualUpdateTriggeredRef.current = false;
    }, 1000);
  }, [updateFormData]);
  
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
    triggerManualUpdate,
    handleFormChange
  };
};
