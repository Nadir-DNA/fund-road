
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
          <p className="text-sm mt-1">Un problème est survenu lors du chargement de cette ressource.</p>
          <pre className="text-xs mt-2 bg-slate-800 p-2 rounded overflow-auto max-h-[100px]">
            {this.state.error?.message || "Erreur inconnue"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a fallback component for when a component isn't found
const ComponentNotFoundFallback = ({ componentName, stepId, substepTitle }: { 
  componentName: string; 
  stepId: number;
  substepTitle: string;
}) => {
  return (
    <div className="p-4 border border-amber-500/20 bg-amber-500/10 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Ressource en cours de chargement</h3>
      <p className="text-sm text-muted-foreground mb-4">
        La ressource <strong>{componentName}</strong> n'a pas pu être chargée pour le moment.
      </p>
      <p className="text-xs text-muted-foreground/70">
        Étape: {stepId}, Sous-étape: {substepTitle}
      </p>
    </div>
  );
};

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
  
  // For the special case of UserResearchNotebook in step 1, substep "Recherche utilisateur"
  if (stepId === 1 && substepTitle === "Recherche utilisateur" && 
      (componentName === "UserResearchNotebook" || componentName === "CustomerBehaviorNotes")) {
    console.log("Using special handling for UserResearchNotebook or CustomerBehaviorNotes");
    // Try to find a component that exists
    let Component = resourceComponentsMap[componentName] || 
                    resourceComponentsMap['UserResearchJournal'] || 
                    resourceComponentsMap['UserResearch'] ||
                    resourceComponentsMap['UserNotes'] ||
                    resourceComponentsMap['CustomerInsights'];
    
    // If we still can't find a component, fall back to a placeholder
    if (!Component) {
      console.log("No component found for research notebook, using placeholder");
      return renderOfflinePlaceholder();
    }
    
    // Use the found component
    console.log("Found substitute component, using it");
    const componentKey = `${componentName}-${stepId}-${substepTitle}-${subsubstepTitle || ''}`;
    
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
  }
  
  // Check if component exists in the map with graceful fallback
  const Component = resourceComponentsMap[componentName];
  
  if (!Component) {
    console.error(`Resource component not found: ${componentName}`, Object.keys(resourceComponentsMap));
    
    // Don't show toast, just log the error
    console.log(`Component "${componentName}" not found in resourceComponentsMap`);
    
    // Return fallback component
    return <ComponentNotFoundFallback 
      componentName={componentName} 
      stepId={stepId} 
      substepTitle={substepTitle} 
    />;
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
    // Return the offline fallback as last resort
    return renderOfflinePlaceholder();
  }
};
