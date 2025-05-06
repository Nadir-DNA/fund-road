
import React from "react";
import { Suspense, useState, useEffect, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap } from "../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import CourseContentDisplay from "../CourseContentDisplay";

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
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
      description: `The component "${componentName}" was not found.`,
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-muted-foreground">
        Resource unavailable: "{componentName}" is not a known component
      </div>
    );
  }

  console.log(`Rendering resource component: ${componentName} for step ${stepId}, substep ${substepTitle}`);

  // Prevent unnecessary re-renders by using a stable component reference
  return (
    <Suspense fallback={<StableLoadingFallback />}>
      <ResourceComponentWrapper>
        <Component 
          stepId={stepId} 
          substepTitle={substepTitle} 
          subsubstepTitle={subsubstepTitle} 
        />
      </ResourceComponentWrapper>
    </Suspense>
  );
};

// Wrapper to prevent unnecessary re-renders
const ResourceComponentWrapper = ({ children }: { children: React.ReactNode }) => {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    console.log("Resource component mounted");
    return () => {
      mountedRef.current = false;
      console.log("Resource component unmounted");
    };
  }, []);
  
  return <>{children}</>;
};

// Create a stable loading component to prevent re-renders
const StableLoadingFallback = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const id = setTimeout(() => {
      console.log("Stable loading fallback timeout completed");
    }, 1000);
    
    return () => {
      clearTimeout(id);
      console.log("Loading fallback unmounting as resource is ready");
    };
  }, []);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="flex justify-center p-6 min-h-[200px] items-center">
      <LoadingIndicator size="md" />
    </div>
  );
};
