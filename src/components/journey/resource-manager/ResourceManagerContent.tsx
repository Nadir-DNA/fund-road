
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
  const hasInitializedRef = useRef(false);
  const componentMountedRef = useRef(true);

  // Effect to handle resource initialization
  useEffect(() => {
    componentMountedRef.current = true;
    setIsLoading(true);
    
    if (!selectedResource && !hasInitializedRef.current) {
      setError("Ressource non trouvée ou non disponible.");
      console.warn(`Resource not found: ${selectedResourceName} for step ${stepId}, substep ${selectedSubstepTitle}`);
      setIsLoading(false);
    } else if (selectedResource) {
      setError(null);
      console.log("Resource found:", {
        title: selectedResource.title,
        type: selectedResource.type,
        componentName: selectedResource.componentName || selectedResourceName
      });
      
      // Add a small delay to ensure proper loading
      setTimeout(() => {
        if (componentMountedRef.current) {
          setIsLoading(false);
        }
      }, 500);
    }
    
    hasInitializedRef.current = true;
    
    return () => {
      componentMountedRef.current = false;
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
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{selectedResource.title}</h3>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
        <LazyLoad priority={true} showLoader={true} height={400}>
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
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{selectedResource.title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      {isBrowser() && (
        <div className="min-h-[400px] relative">
          <LazyLoad priority={true} showLoader={true} height={400}>
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
