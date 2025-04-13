
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useResourceData } from "@/hooks/useResourceData";
import ExportPanel from "./resource-form/ExportPanel";
import FormSkeleton from "./resource-form/FormSkeleton";
import FormContent from "./resource-form/FormContent";
import SaveButton from "./resource-form/SaveButton";

interface ResourceFormProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  children: React.ReactNode;
  onDataSaved?: (data: any) => void;
  defaultValues?: any;
}

export default function ResourceForm({
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  children,
  onDataSaved,
  defaultValues = {}
}: ResourceFormProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData
  } = useResourceData(stepId, substepTitle, resourceType, defaultValues, onDataSaved);

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent>
        <FormContent 
          children={children}
          formData={formData}
          handleFormChange={handleFormChange}
          setFormData={setFormData}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 pt-4 mt-4">
        <SaveButton isSaving={isSaving} handleSave={handleSave} />
        
        <ExportPanel 
          formData={formData}
          resourceType={resourceType}
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      </CardFooter>
    </Card>
  );
}
