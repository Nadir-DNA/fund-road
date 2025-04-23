
import { ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useResourceData } from "@/hooks/useResourceData";
import FormSkeleton from "./resource-form/FormSkeleton";
import FormContent from "./resource-form/FormContent";
import SaveButton from "./resource-form/SaveButton";
import { supabase } from "@/integrations/supabase/client";

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
  
  const {
    isLoading,
    isSaving,
    handleSave,
    session
  } = useResourceData(stepId, substepTitle, resourceType, formData, onDataSaved);

  // Force save on unmount to ensure data persistence
  useEffect(() => {
    return () => {
      console.log("ResourceForm unmounting - triggering final save");
      handleSave(session);
    };
  }, [handleSave, session]);

  // Handle manual save button click
  const onSaveClick = () => {
    handleSave(session);
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
