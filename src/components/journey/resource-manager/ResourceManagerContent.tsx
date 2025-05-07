
import { useState, useEffect, useRef } from "react";
import { Resource } from "@/types/journey";
import { getResourceNavigationInfo, getResourceLocationLabel } from "@/utils/resourceHelpers";
import ResourceErrorDisplay from "./ResourceErrorDisplay";
import ResourceLoadingState from "./ResourceLoadingState";
import CourseResourceDisplay from "./CourseResourceDisplay";
import InteractiveResourceDisplay from "./InteractiveResourceDisplay";

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
  
  // Get navigation information - passing substepTitle to filter properly
  const { currentIndex, totalResources, allResources } = getResourceNavigationInfo(
    stepId, 
    selectedResourceName,
    selectedSubstepTitle
  );
  
  // Get resource location label
  const resourceLocationLabel = getResourceLocationLabel(stepId, selectedResourceName);
  
  // Effect to handle resource initialization
  useEffect(() => {
    mountedRef.current = true;
    console.log("ResourceManagerContent: Resource changed or mounted", { 
      resource: selectedResource?.title, 
      componentName: selectedResource?.componentName || selectedResourceName,
      navigationInfo: { currentIndex, totalResources },
      context: { stepId, substep: selectedSubstepTitle }
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
    return <ResourceErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // Display loading state
  if (isLoading) {
    return <ResourceLoadingState />;
  }

  // Special handling for course content
  if (selectedResource.type === 'course' && selectedResource.courseContent) {
    console.log("Rendering course content resource:", selectedResource.title);
    return (
      <CourseResourceDisplay
        selectedResource={selectedResource}
        resourceLocationLabel={resourceLocationLabel}
        stepId={stepId}
        selectedSubstepTitle={selectedSubstepTitle}
        allResources={allResources}
        currentIndex={currentIndex}
        totalResources={totalResources}
        onRetry={handleRetry}
      />
    );
  }
  
  // Default rendering for other resource types
  const componentName = selectedResource.componentName || selectedResourceName;
  console.log(`Rendering resource component: ${componentName}`);
  
  return (
    <InteractiveResourceDisplay
      selectedResource={selectedResource}
      resourceLocationLabel={resourceLocationLabel}
      stepId={stepId}
      selectedSubstepTitle={selectedSubstepTitle}
      selectedResourceName={selectedResourceName}
      componentName={componentName}
      allResources={allResources}
      currentIndex={currentIndex}
      totalResources={totalResources}
      onRetry={handleRetry}
      subsubstepTitle={selectedResource.subsubstepTitle}
    />
  );
}
