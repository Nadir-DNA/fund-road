
import { renderResourceComponent } from "../utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { Resource } from "@/types/journey";
import { useState, useEffect } from "react";

interface ResourceManagerContentProps {
  selectedResource: Resource | undefined;
  stepId: number;
  selectedSubstepTitle: string;
  selectedResourceName: string;
}

export default function ResourceManagerContent({
  selectedResource,
  stepId,
  selectedSubstepTitle,
  selectedResourceName
}: ResourceManagerContentProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedResource) {
      setError("Ressource non trouvée ou non disponible.");
      console.warn(`Resource not found: ${selectedResourceName} for step ${stepId}, substep ${selectedSubstepTitle}`);
    } else {
      setError(null);
      console.log(`Rendering resource:`, {
        title: selectedResource.title,
        componentName: selectedResource.componentName || selectedResourceName,
        type: selectedResource.type
      });
    }
  }, [selectedResource, selectedResourceName, stepId, selectedSubstepTitle]);
  
  if (!selectedResource) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{error || "Ressource non trouvée ou non disponible."}</p>
      </div>
    );
  }
  
  const componentName = selectedResource.componentName || selectedResourceName;
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{selectedResource.title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      {isBrowser() && renderResourceComponent(
        componentName, 
        stepId, 
        selectedSubstepTitle
      )}
    </div>
  );
}
