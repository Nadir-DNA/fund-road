
import React from "react";
import { Suspense, useState, useEffect, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap } from "../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import CourseContentDisplay from "../CourseContentDisplay";

// Create a stable loading component to prevent re-renders
const StableLoadingFallback = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => {
      clearTimeout(timeout);
      console.log("Loading fallback unmounted");
    };
  }, []);
  
  return (
    <div className="flex justify-center p-6 min-h-[200px] items-center">
      <LoadingIndicator size="md" />
    </div>
  );
};

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  console.log(`Rendering resource: ${componentName} for step ${stepId}, substep ${substepTitle}`);
  
  if (!componentName) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Sélectionnez une ressource pour commencer
      </div>
    );
  }
  
  // Special case for course content
  if (componentName === 'CourseContentDisplay') {
    try {
      const savedCourseData = localStorage.getItem('currentCourseContent');
      if (savedCourseData) {
        const { content, title } = JSON.parse(savedCourseData);
        console.log("Found saved course content:", title);
        return (
          <Suspense fallback={<StableLoadingFallback />}>
            <CourseContentDisplay 
              stepId={stepId}
              substepTitle={substepTitle} 
              stepTitle={title || 'Course Content'}
              courseContent={content}
            />
          </Suspense>
        );
      }
    } catch (e) {
      console.error('Failed to parse course content from localStorage:', e);
    }
  }

  // Check if component exists in the map
  const Component = resourceComponentsMap[componentName];
  
  if (!Component) {
    console.error(`Resource component not found: ${componentName}`);
    toast({
      title: "Resource error",
      description: `The component "${componentName}" was not found in the resource map.`,
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-muted-foreground border border-red-400 rounded">
        Resource unavailable: "{componentName}" is not a known component.
        <pre className="text-xs mt-2 bg-slate-800 p-2 rounded">
          {`Component: ${componentName}\nStep: ${stepId}\nSubstep: ${substepTitle}`}
        </pre>
      </div>
    );
  }

  console.log(`Found component for: ${componentName}`);

  // Use a memoized key to prevent unnecessary re-renders
  const componentKey = `${componentName}-${stepId}-${substepTitle}-${subsubstepTitle || ''}`;

  // Return the component with a stable key and error boundary
  try {
    return (
      <Suspense fallback={<StableLoadingFallback />}>
        <div 
          key={componentKey} 
          id={`resource-container-${componentName}`}
          className="resource-component-wrapper"
        >
          <Component 
            stepId={stepId} 
            substepTitle={substepTitle} 
            subsubstepTitle={subsubstepTitle} 
          />
        </div>
      </Suspense>
    );
  } catch (error) {
    console.error("Error rendering resource component:", error);
    toast({
      title: "Error",
      description: "Failed to render the resource component",
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-red-400 border border-red-400 rounded">
        Error rendering component: {componentName}
      </div>
    );
  }
};
