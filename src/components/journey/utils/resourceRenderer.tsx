
import React from "react";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap, ResourceComponentProps } from "../resourceComponentsMap";
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

// Create a fallback component for when a component fails to load
const ErrorFallbackComponent = ({ componentName }: { componentName: string }) => {
  return (
    <div className="p-6 border border-destructive/20 bg-destructive/10 rounded-lg">
      <h3 className="font-medium text-lg mb-2">Impossible de charger la ressource</h3>
      <p className="text-muted-foreground mb-4">
        Le composant <code className="bg-slate-800 px-1 py-0.5 rounded">{componentName}</code> n'a pas pu être chargé.
      </p>
      <p className="text-sm text-muted-foreground/70">
        Une erreur est survenue lors du chargement dynamique de cette ressource.
      </p>
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
      <h3 className="text-lg font-medium mb-2">Ressource en cours de développement</h3>
      <p className="text-sm text-muted-foreground mb-4">
        La ressource <strong>{componentName}</strong> n'est pas encore disponible.
      </p>
      <p className="text-xs text-muted-foreground/70">
        Étape: {stepId}, Sous-étape: {substepTitle}
      </p>
    </div>
  );
};

// Export this function so it can be imported in InteractiveResourceDisplay.tsx
export const getResourceComponentByName = (componentName: string) => {
  return resourceComponentsMap[componentName];
};

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  console.log(`Rendering resource: ${componentName} for step ${stepId}, substep ${substepTitle}`);
  
  // Offline fallback - provide a minimal placeholder when proper rendering fails
  const renderOfflinePlaceholder = () => (
    <div className="p-6 border border-dashed border-slate-700 rounded-lg">
      <h3 className="mb-4 text-base font-medium text-center">Ressource {componentName}</h3>
      <p className="text-muted-foreground text-sm text-center">
        Cette ressource sera disponible prochainement
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
  
  // Special case for resources that might fail to load in Step 1
  if (stepId === 1 && substepTitle === "Recherche utilisateur") {
    // Rather than relying on dynamic imports that might fail, we'll create a simple inline fallback
    return (
      <div className="p-6 border border-slate-700 rounded-lg bg-slate-800">
        <h3 className="text-xl font-semibold mb-4">{componentName === "UserResearchNotebook" ? 
          "Journal d'observation utilisateur" : 
          "Analyse comportementale"}</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50/10 border border-yellow-200/20 rounded-lg">
            <h4 className="font-medium mb-2">Observations terrain</h4>
            <p className="text-muted-foreground">
              Documentez vos observations sur le terrain, les comportements utilisateurs que vous avez remarqués.
            </p>
          </div>
          
          <div className="p-4 bg-red-50/10 border border-red-200/20 rounded-lg">
            <h4 className="font-medium mb-2">Frustrations identifiées</h4>
            <p className="text-muted-foreground">
              Notez les problèmes et points de friction rencontrés par vos utilisateurs cibles.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50/10 border border-blue-200/20 rounded-lg">
            <h4 className="font-medium mb-2">Citations utilisateurs</h4>
            <p className="text-muted-foreground">
              Enregistrez des verbatims ou citations directes de vos utilisateurs.
            </p>
          </div>
          
          <p className="text-center text-muted-foreground mt-4 p-2 bg-slate-700 rounded">
            ⚠️ Une version interactive de cet outil sera disponible prochainement
          </p>
        </div>
      </div>
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
            <React.Suspense fallback={<StableLoadingFallback />}>
              <React.ErrorBoundary fallback={<ErrorFallbackComponent componentName={componentName} />}>
                <Component 
                  stepId={stepId} 
                  substepTitle={substepTitle} 
                  subsubstepTitle={subsubstepTitle}
                />
              </React.ErrorBoundary>
            </React.Suspense>
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
