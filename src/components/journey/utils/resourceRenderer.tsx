
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

// Create an error boundary component to catch rendering errors
class ResourceErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; componentName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error rendering component ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-destructive border border-destructive/40 rounded">
          <p>Erreur lors du chargement du composant</p>
          <pre className="text-xs mt-2 bg-slate-800 p-2 rounded overflow-auto max-h-[100px]">
            {this.state.error?.message || "Erreur inconnue"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  console.log(`Rendering resource: ${componentName} for step ${stepId}, substep ${substepTitle}`);
  
  // Offline fallback - provide a minimal placeholder when proper rendering fails
  const renderOfflinePlaceholder = () => (
    <div className="p-6 border border-dashed border-slate-700 rounded-lg">
      <h3 className="mb-4 text-base font-medium text-center">Ressource {componentName}</h3>
      <p className="text-muted-foreground text-sm text-center">
        Cette ressource sera disponible quand la connexion sera rétablie
      </p>
    </div>
  );
  
  if (!componentName) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Composant non défini
      </div>
    );
  }
  
  // Check if component exists in the map with graceful fallback
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

  // Return the component with error boundary, stable key and suspense fallback
  try {
    return (
      <ResourceErrorBoundary componentName={componentName}>
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
      </ResourceErrorBoundary>
    );
  } catch (error) {
    console.error("Error rendering resource component:", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger le composant de ressource",
      variant: "destructive"
    });
    
    // Return the offline fallback as last resort
    return renderOfflinePlaceholder();
  }
};
