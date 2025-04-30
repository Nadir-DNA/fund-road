
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceData } from "@/hooks/useResourceData";
import FormSkeleton from "./resource-form/FormSkeleton";
import SaveButton from "./resource-form/SaveButton";

interface ResourceFormProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  children: ReactNode;
  onDataSaved?: (data: any) => void;
  formData?: any; // Controlled data from parent
  defaultValues?: any; // Uncontrolled initial values
  exportPanel?: React.ReactNode;
}

export default function ResourceForm({
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  children,
  onDataSaved,
  formData,
  defaultValues,
  exportPanel
}: ResourceFormProps) {
  
  // Use ref for stable values to prevent loops
  const onDataSavedRef = useRef(onDataSaved);
  onDataSavedRef.current = onDataSaved;
  
  const initialDataRef = useRef(formData || defaultValues);
  const hasCalledOnDataSavedRef = useRef(false);
  const [stableInitialData] = useState(initialDataRef.current); // Use only once at mount
  const manualSaveTriggeredRef = useRef(false);
  
  // Use ResourceData hook with stable initial data to prevent loops
  const {
    formData: hookFormData,
    isLoading,
    isSaving,
    handleSave,
    handleManualSave,
    session
  } = useResourceData(stepId, substepTitle, resourceType, stableInitialData, useCallback((data) => {
    // Only call parent's onDataSaved for manual saves or after initial load
    if (onDataSavedRef.current && data && Object.keys(data).length > 0) {
      if (hasCalledOnDataSavedRef.current || manualSaveTriggeredRef.current) {
        // Normal update or manual save
        console.log("Calling onDataSaved from ResourceForm after validation");
        onDataSavedRef.current(data);
        // Reset manual save flag
        manualSaveTriggeredRef.current = false;
      } else {
        // First call - mark flag and delay to prevent loops
        console.log("First onDataSaved call in ResourceForm");
        hasCalledOnDataSavedRef.current = true;
        
        // Skip auto-call for initial data to prevent loops
        if (JSON.stringify(data).length > 20) {
          setTimeout(() => {
            if (onDataSavedRef.current) {
              console.log("Delayed first onDataSaved to prevent loops");
              onDataSavedRef.current(data);
            }
          }, 500);
        } else {
          console.log("Initial data too small, skipping first onDataSaved call");
        }
      }
    }
  }, []));
  
  // Use ref to track unmounting
  const isUnmountingRef = useRef(false);
  const lastSavedDataRef = useRef<string>("");

  // Convert current formData to string for comparison
  const currentFormDataString = JSON.stringify(hookFormData);

  // Force save on unmount to ensure data persistence, but only if data changed
  useEffect(() => {
    // Store the initial form data for comparison after first render
    if (!lastSavedDataRef.current && hookFormData) {
      lastSavedDataRef.current = JSON.stringify(hookFormData);
    }

    return () => {
      console.log("ResourceForm unmounting - checking if save needed");
      if (session && !isUnmountingRef.current) {
        isUnmountingRef.current = true;
        
        // Only save if data actually changed since last save
        if (currentFormDataString !== lastSavedDataRef.current && currentFormDataString.length > 20) {
          console.log("Data changed, triggering final save");
          handleSave(session);
          lastSavedDataRef.current = currentFormDataString;
        } else {
          console.log("No data changes detected, skipping final save");
        }
      } else {
        console.log("No session available for final save or save already triggered");
      }
    };
  }, [handleSave, session, currentFormDataString]);

  // Handle manual save button click
  const onSaveClick = useCallback(() => {
    console.log("Manual save button clicked");
    manualSaveTriggeredRef.current = true;
    if (session) {
      handleManualSave(session);
      lastSavedDataRef.current = currentFormDataString;
    } else {
      console.log("No session available for manual save");
    }
  }, [session, handleManualSave, currentFormDataString]);

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Card className="w-full max-w-[95vw] lg:max-w-5xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      
      <CardContent className="pt-4 pb-6">
        {children}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-4 pt-4 mt-2 gap-4">
        <SaveButton isSaving={isSaving} handleSave={onSaveClick} />
        {exportPanel}
      </CardFooter>
    </Card>
  );
}
