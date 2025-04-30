
import React from "react";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap } from "../resourceComponentsMap";

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  if (!componentName) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Sélectionnez une ressource pour commencer
      </div>
    );
  }

  const resourceProps = {
    stepId,
    substepTitle,
    subsubstepTitle
  };

  // Check if component exists in the map
  const Component = resourceComponentsMap[componentName];
  
  if (!Component) {
    console.error(`Composant de ressource non trouvé: ${componentName}`);
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
