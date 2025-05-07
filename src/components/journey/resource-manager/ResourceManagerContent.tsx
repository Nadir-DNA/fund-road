
import { renderResourceComponent } from "../utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { Resource } from "@/types/journey";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import CourseContentDisplay from "../CourseContentDisplay";
import LazyLoad from "@/components/LazyLoad";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ResourceNavigation from "./ResourceNavigation";
import { getAllStepResources, getResourceNavigationInfo, getResourceLocationLabel } from "@/utils/resourceHelpers";

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
  const [isLoading, setIsLoading] = useState(true);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Get navigation information
  const { currentIndex, totalResources, allResources } = getResourceNavigationInfo(
    stepId, 
    selectedResourceName
  );
  
  // Get resource location label
  const resourceLocationLabel = getResourceLocationLabel(stepId, selectedResourceName);
  
  // Effect to handle resource initialization
  useEffect(() => {
    mountedRef.current = true;
    console.log("ResourceManagerContent: Resource changed or mounted", { 
      resource: selectedResource?.title, 
      componentName: selectedResource?.componentName || selectedResourceName,
      navigationInfo: { currentIndex, totalResources }
    });
    
    setIsLoading(true);
    setError(null);
    
    // Clear any existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Short timer to ensure component is rendered
    renderTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      
      if (!selectedResource) {
        setError("Ressource non trouvée ou non disponible.");
        console.warn(`Resource not found: ${selectedResourceName} for step ${stepId}, substep ${selectedSubstepTitle}`);
      } else {
        console.log("Resource ready to render:", {
          title: selectedResource.title,
          type: selectedResource.type,
          componentName: selectedResource.componentName || selectedResourceName
        });
      }
      setIsLoading(false);
    }, 300);
    
    // Set a safety timeout to prevent indefinite loading state
    const safetyTimeout = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        console.log("Safety timeout triggered - forcing loading to complete");
        setIsLoading(false);
      }
    }, 5000);
    
    return () => { 
      mountedRef.current = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      clearTimeout(safetyTimeout);
    };
  }, [selectedResource, selectedResourceName, stepId, selectedSubstepTitle, renderAttempts, currentIndex, totalResources]);
  
  // Function to retry rendering
  const handleRetry = () => {
    console.log("Retrying resource render");
    setRenderAttempts(prev => prev + 1);
    setIsLoading(true);
    setError(null);
  };
  
  // If resource not found
  if (!selectedResource) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{error || "Ressource non trouvée ou non disponible."}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={handleRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="md" />
        <span className="ml-2">Chargement de la ressource...</span>
      </div>
    );
  }

  // Special handling for course content
  if (selectedResource.type === 'course' && selectedResource.courseContent) {
    console.log("Rendering course content resource:", selectedResource.title);
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <span className="text-xs font-mono text-muted-foreground mr-2">
                {resourceLocationLabel}
              </span>
              <h3 className="text-lg font-medium">{selectedResource.title}</h3>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
        <LazyLoad priority={true} showLoader={true} height={400} delay={100}>
          <CourseContentDisplay 
            stepId={stepId}
            substepTitle={selectedSubstepTitle}
            stepTitle={selectedResource.title}
            courseContent={selectedResource.courseContent}
          />
        </LazyLoad>
        
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
  
  // Default rendering for other resource types
  const componentName = selectedResource.componentName || selectedResourceName;
  console.log(`Rendering resource component: ${componentName}`);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center">
            <span className="text-xs font-mono text-muted-foreground mr-2">
              {resourceLocationLabel}
            </span>
            <h3 className="text-lg font-medium">{selectedResource.title}</h3>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRetry}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
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
              selectedResource.subsubstepTitle
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
