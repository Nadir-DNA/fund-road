
import { renderResourceComponent } from "../utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { Resource } from "@/types/journey";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import CourseContentDisplay from "../CourseContentDisplay";
import LazyLoad from "@/components/LazyLoad";

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
  const [isReady, setIsReady] = useState(false);
  const componentId = useRef(`resource-${Math.random().toString(36).substring(7)}`);
  
  // Effect to handle resource initialization
  useEffect(() => {
    console.log("ResourceManagerContent: Resource changed or mounted", { 
      resource: selectedResource?.title, 
      componentName: selectedResource?.componentName || selectedResourceName
    });
    
    setIsLoading(true);
    setError(null);
    
    // Short timer to ensure component is rendered
    const timer = setTimeout(() => {
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
      
      // Additional delay to ensure component is fully loaded
      setTimeout(() => {
        setIsReady(true);
        console.log("Resource manager content marked as ready");
      }, 200);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      console.log("ResourceManagerContent: Unmounting");
    };
  }, [selectedResource, selectedResourceName, stepId, selectedSubstepTitle]);
  
  // If resource not found
  if (!selectedResource) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{error || "Ressource non trouvée ou non disponible."}</p>
      </div>
    );
  }

  // Special handling for course content
  if (selectedResource.type === 'course' && selectedResource.courseContent) {
    console.log("Rendering course content resource:", selectedResource.title);
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{selectedResource.title}</h3>
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
      </div>
    );
  }
  
  // Default rendering for other resource types
  const componentName = selectedResource.componentName || selectedResourceName;
  console.log(`Rendering resource component: ${componentName}`);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{selectedResource.title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      {isBrowser() && (
        <div 
          className="min-h-[400px] relative" 
          id={`resource-wrapper-${componentId.current}`}
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
      )}
    </div>
  );
}
