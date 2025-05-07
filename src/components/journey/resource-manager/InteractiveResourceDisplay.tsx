
import { Resource } from "@/types/journey";
import { renderResourceComponent } from "../utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import LazyLoad from "@/components/LazyLoad";
import ResourceNavigation from "./ResourceNavigation";
import ResourceHeader from "./ResourceHeader";

interface InteractiveResourceDisplayProps {
  selectedResource: Resource;
  resourceLocationLabel: string | null;
  stepId: number;
  selectedSubstepTitle: string;
  selectedResourceName: string;
  componentName: string;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
  onRetry: () => void;
  subsubstepTitle?: string | null;
}

export default function InteractiveResourceDisplay({
  selectedResource,
  resourceLocationLabel,
  stepId,
  selectedSubstepTitle,
  selectedResourceName,
  componentName,
  allResources,
  currentIndex,
  totalResources,
  onRetry,
  subsubstepTitle
}: InteractiveResourceDisplayProps) {
  return (
    <div className="mt-4">
      <ResourceHeader 
        selectedResource={selectedResource} 
        resourceLocationLabel={resourceLocationLabel}
        onRetry={onRetry}
      />
      
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      
      {isBrowser() ? (
        <div 
          className="min-h-[400px] relative border border-slate-700 rounded-lg p-4 bg-slate-800/30" 
          data-component-name={componentName}
        >
          <LazyLoad 
            priority={true} 
            showLoader={true} 
            height={400} 
            delay={0}
            className="resource-wrapper"
          >
            {renderResourceComponent(
              componentName, 
              stepId, 
              selectedSubstepTitle,
              subsubstepTitle
            )}
          </LazyLoad>
        </div>
      ) : (
        <div className="p-6 text-center border rounded-lg">
          <p className="text-muted-foreground">Les ressources interactives ne sont disponibles que dans un navigateur.</p>
        </div>
      )}
      
      {totalResources > 1 && (
        <ResourceNavigation 
          stepId={stepId}
          substepTitle={selectedSubstepTitle}
          currentResource={selectedResource}
          allResources={allResources}
          currentIndex={currentIndex}
          totalResources={totalResources}
        />
      )}
    </div>
  );
}
