
import { ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceData } from "@/hooks/useResourceData";
import FormSkeleton from "./resource-form/FormSkeleton";
import FormContent from "./resource-form/FormContent";
import SaveButton from "./resource-form/SaveButton";

interface ResourceFormProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  children: ReactNode;
  onDataSaved?: (data: any) => void;
  formData: any; // Données contrôlées par le parent
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
  exportPanel
}: ResourceFormProps) {
  
  // Utiliser useRef pour éviter les boucles de rendu avec les données initiales
  const initialFormDataRef = useRef(formData);
  const hasCalledOnDataSavedRef = useRef(false);
  
  const {
    isLoading,
    isSaving,
    handleSave,
    session
  } = useResourceData(stepId, substepTitle, resourceType, initialFormDataRef.current, (data) => {
    // Éviter les déclenchements multiples de onDataSaved lors de l'initialisation
    if (hasCalledOnDataSavedRef.current) {
      if (onDataSaved) onDataSaved(data);
    } else {
      hasCalledOnDataSavedRef.current = true;
    }
  });
  
  // Use ref to track unmounting
  const isUnmountingRef = useRef(false);
  const wasManualSaveRef = useRef(false);
  const lastSavedDataRef = useRef<string>("");

  // Convert current formData to string for comparison
  const currentFormDataString = JSON.stringify(formData);

  // Force save on unmount to ensure data persistence, but only if data changed
  useEffect(() => {
    // Store the initial form data for comparison after first render
    if (!lastSavedDataRef.current && formData) {
      lastSavedDataRef.current = JSON.stringify(formData);
    }

    return () => {
      console.log("ResourceForm unmounting - checking if save needed");
      if (session && !isUnmountingRef.current) {
        isUnmountingRef.current = true;
        
        // Only save if data actually changed since last save
        if (currentFormDataString !== lastSavedDataRef.current) {
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
  const onSaveClick = () => {
    console.log("Manual save button clicked");
    wasManualSaveRef.current = true;
    if (session) {
      const saveResult = handleSave(session);
      if (saveResult) {
        lastSavedDataRef.current = currentFormDataString;
      }
    } else {
      console.log("No session available for manual save");
    }
  };

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
