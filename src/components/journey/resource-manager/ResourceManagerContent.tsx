
import { renderResourceComponent } from "../utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { Resource } from "@/types/journey";

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
  if (!selectedResource) {
    console.log("No resource selected or resource not found:", selectedResourceName);
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Ressource non trouvée ou non disponible.</p>
      </div>
    );
  }
  
  console.log("Rendering resource component:", {
    resourceName: selectedResourceName,
    componentName: selectedResource.componentName,
    resourceType: selectedResource.type
  });
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{selectedResource.title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      {isBrowser() && renderResourceComponent(
        selectedResource.componentName || selectedResourceName, 
        stepId, 
        selectedSubstepTitle
      )}
    </div>
  );
}
