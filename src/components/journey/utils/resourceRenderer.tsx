
import React from "react";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap } from "../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";

// Create a stable loading component to prevent re-renders
const StableLoadingFallback = () => {
  return (
    <div className="flex justify-center p-6 min-h-[200px] items-center">
      <LoadingIndicator size="md" />
      <span className="ml-2 text-muted-foreground">Chargement de la ressource...</span>
    </div>
  );
};

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  console.log(`Rendering resource: ${componentName} for step ${stepId}, substep ${substepTitle}`);
  
  if (!componentName) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Composant non défini
      </div>
    );
  }
  
  // Check if component exists in the map
  const Component = resourceComponentsMap[componentName];
  
  if (!Component) {
    console.error(`Resource component not found: ${componentName}`, Object.keys(resourceComponentsMap));
    
    toast({
      title: "Ressource indisponible",
      description: `Le composant "${componentName}" n'a pas été trouvé`,
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-muted-foreground border border-destructive/40 rounded">
        <p>Ressource indisponible: "{componentName}"</p>
        <p className="text-xs mt-2">Composants disponibles: {Object.keys(resourceComponentsMap).join(', ')}</p>
      </div>
    );
  }

  // Use a memoized key to prevent unnecessary re-renders
  const componentKey = `${componentName}-${stepId}-${substepTitle}-${subsubstepTitle || ''}`;

  // Return the component with a stable key and suspense fallback
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
      title: "Erreur",
      description: "Impossible de charger le composant de ressource",
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-4 text-destructive border border-destructive/40 rounded">
        <p>Erreur lors du chargement du composant: {componentName}</p>
        <pre className="text-xs mt-2 bg-slate-800 p-2 rounded overflow-auto max-h-[200px]">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
};
