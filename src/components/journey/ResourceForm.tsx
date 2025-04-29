
import { ReactNode, useEffect, useRef, useState } from "react";
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
  
  // Utiliser useRef et useState pour gérer formData de façon stable
  const initialFormDataRef = useRef(formData);
  const [stableFormData, setStableFormData] = useState(formData);
  const hasCalledOnDataSavedRef = useRef(false);
  const formUpdateTimerRef = useRef<any>(null);
  
  // Mettre à jour les données stables uniquement si les données initiales changent significativement
  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(stableFormData)) {
      // Utiliser un timer pour éviter les mises à jour trop fréquentes
      if (formUpdateTimerRef.current) {
        clearTimeout(formUpdateTimerRef.current);
      }
      
      formUpdateTimerRef.current = setTimeout(() => {
        console.log("Updating stableFormData after delay");
        setStableFormData(formData);
      }, 500);
    }
    
    return () => {
      if (formUpdateTimerRef.current) {
        clearTimeout(formUpdateTimerRef.current);
      }
    };
  }, [formData]);
  
  // Utiliser les données stables pour le hook useResourceData
  const {
    isLoading,
    isSaving,
    handleSave,
    session
  } = useResourceData(stepId, substepTitle, resourceType, initialFormDataRef.current, (data) => {
    // Éviter les déclenchements multiples de onDataSaved
    if (hasCalledOnDataSavedRef.current) {
      if (onDataSaved && JSON.stringify(data) !== JSON.stringify(stableFormData)) {
        console.log("Calling onDataSaved from ResourceForm after validation");
        onDataSaved(data);
      }
    } else {
      console.log("First onDataSaved call in ResourceForm");
      hasCalledOnDataSavedRef.current = true;
      
      if (onDataSaved) {
        // Delay to prevent loops
        setTimeout(() => {
          onDataSaved(data);
        }, 500);
      }
    }
  });
  
  // Use ref to track unmounting
  const isUnmountingRef = useRef(false);
  const wasManualSaveRef = useRef(false);
  const lastSavedDataRef = useRef<string>("");

  // Convert current formData to string for comparison
  const currentFormDataString = JSON.stringify(stableFormData);

  // Force save on unmount to ensure data persistence, but only if data changed
  useEffect(() => {
    // Store the initial form data for comparison after first render
    if (!lastSavedDataRef.current && stableFormData) {
      lastSavedDataRef.current = JSON.stringify(stableFormData);
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
      handleSave(session);
      lastSavedDataRef.current = currentFormDataString;
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
