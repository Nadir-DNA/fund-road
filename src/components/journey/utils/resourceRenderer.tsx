
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

  console.log(`Rendering resource component: ${componentName} for step: ${stepId}, substep: ${substepTitle}`);
  
  const resourceProps = {
    stepId,
    substepTitle,
    subsubstepTitle
  };

  // Special case for course content
  if (componentName === 'CourseContentDisplay') {
    try {
      const savedCourseData = localStorage.getItem('currentCourseContent');
      if (savedCourseData) {
        const { content, title } = JSON.parse(savedCourseData);
        return (
          <Suspense fallback={<div className="flex justify-center p-8"><LoadingIndicator size="lg" /></div>}>
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
    console.error(`Composant de ressource non trouvé: ${componentName}`);
    toast({
      title: "Erreur de ressource",
      description: `Le composant "${componentName}" n'a pas été trouvé.`,
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-muted-foreground">
        Ressource non disponible: "{componentName}" n'est pas un composant connu
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><LoadingIndicator size="lg" /></div>}>
      <Component {...resourceProps} />
    </Suspense>
  );
};
