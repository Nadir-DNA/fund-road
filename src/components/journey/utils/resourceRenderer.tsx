
import React from "react";
import { Suspense } from "react";
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
          <Suspense fallback={<div className="flex justify-center p-4"><LoadingIndicator size="sm" /></div>}>
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

  // More lightweight fallback with reduced timeout
  return (
    <Suspense fallback={<div className="flex justify-center p-4"><LoadingIndicator size="sm" /></div>}>
      <Component stepId={stepId} substepTitle={substepTitle} subsubstepTitle={subsubstepTitle} />
    </Suspense>
  );
};
