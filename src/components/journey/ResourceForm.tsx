
import React, { useState } from "react";  // Add explicit React import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, AlertCircle } from "lucide-react";
import { useResourceData } from "@/hooks/useResourceData";
import ExportPanel from "./resource-form/ExportPanel";

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

  // Pass handleFormChange down to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        formData,
        onChange: handleFormChange,
        setFormData
      });
    }
    return child;
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {childrenWithProps}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 pt-4 mt-4">
        <div>
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-white rounded-full"/>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </span>
            )}
          </Button>
        </div>
        
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
