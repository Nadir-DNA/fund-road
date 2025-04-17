
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
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
  children: React.ReactNode;
  onDataSaved?: (data: any) => void;
  defaultValues?: any;
  exportPanel?: React.ReactNode; // Add this prop to the interface
}

export default function ResourceForm({
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  children,
  onDataSaved,
  defaultValues = {},
  exportPanel  // Include the prop in the function parameters
}: ResourceFormProps) {
  
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
    <Card className="w-full max-w-[95vw] lg:max-w-5xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      
      <CardContent className="pt-4 pb-6">
        <FormContent 
          children={children}
          formData={formData}
          handleFormChange={handleFormChange}
          setFormData={setFormData}
        />
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-4 pt-4 mt-2 gap-4">
        <SaveButton isSaving={isSaving} handleSave={handleSave} />
        
        {exportPanel}
      </CardFooter>
    </Card>
  );
}
