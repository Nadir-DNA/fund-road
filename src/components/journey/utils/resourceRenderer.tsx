
import React from "react";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { resourceComponentsMap, ResourceComponentProps } from "../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

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

// Create an enhanced fallback for specific components that often fail
const createEnhancedFallback = (componentName: string, stepId: number, substepTitle: string) => {
  console.log(`Creating enhanced fallback for ${componentName}`);
  
  if (componentName === "UserResearchNotebook") {
    return (
      <div className="p-6 border border-slate-700 rounded-lg bg-slate-800/50">
        <h3 className="text-xl font-semibold mb-4 text-white">Journal d'observation utilisateur</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50/10 border border-yellow-200/20 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-300">Observations terrain</h4>
            <p className="text-muted-foreground text-sm">
              Documentez vos observations sur le terrain, les comportements utilisateurs que vous avez remarqués.
            </p>
          </div>
          
          <div className="p-4 bg-red-50/10 border border-red-200/20 rounded-lg">
            <h4 className="font-medium mb-2 text-red-300">Frustrations identifiées</h4>
            <p className="text-muted-foreground text-sm">
              Notez les problèmes et points de friction rencontrés par vos utilisateurs cibles.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50/10 border border-blue-200/20 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-300">Citations utilisateurs</h4>
            <p className="text-muted-foreground text-sm">
              Enregistrez des verbatims ou citations directes de vos utilisateurs.
            </p>
          </div>
          
          <div className="p-4 bg-emerald-50/10 border border-emerald-200/20 rounded-lg">
            <h4 className="font-medium mb-2 text-emerald-300">Insight principal</h4>
            <p className="text-muted-foreground text-sm">
              Quel besoin sous-jacent percevez-vous ?
            </p>
          </div>
          
          <div className="text-center text-muted-foreground mt-4 p-3 bg-slate-700/50 rounded border border-slate-600">
            <p className="text-sm">⚠️ Version interactive temporairement indisponible</p>
            <p className="text-xs mt-1">La version complète sera rechargée automatiquement</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
      <h3 className="mb-4 text-base font-medium text-center text-white">Ressource {componentName}</h3>
      <p className="text-muted-foreground text-sm text-center">
        Cette ressource sera disponible prochainement
      </p>
    </div>
  );
};

// Create an error boundary component to catch rendering errors
class ResourceErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string; stepId: number; substepTitle: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; componentName: string; stepId: number; substepTitle: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("ResourceErrorBoundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error rendering component ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log(`Rendering fallback for ${this.props.componentName} due to error`);
      return createEnhancedFallback(this.props.componentName, this.props.stepId, this.props.substepTitle);
    }

    return this.props.children;
  }
}

// Export this function so it can be imported in InteractiveResourceDisplay.tsx
export const getResourceComponentByName = (componentName: string) => {
  return resourceComponentsMap[componentName];
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
    console.log(`Component "${componentName}" not found, using enhanced fallback`);
    
    // Return enhanced fallback instead of simple error
    return createEnhancedFallback(componentName, stepId, substepTitle);
  }

  // Use a memoized key to prevent unnecessary re-renders
  const componentKey = `${componentName}-${stepId}-${substepTitle}-${subsubstepTitle || ''}`;

  // Return the component with enhanced error handling
  try {
    return (
      <ResourceErrorBoundary componentName={componentName} stepId={stepId} substepTitle={substepTitle}>
        <Suspense fallback={<StableLoadingFallback />}>
          <div 
            key={componentKey} 
            id={`resource-container-${componentName}`}
            className="resource-component-wrapper"
          >
            <ErrorBoundary fallback={
              <div className="p-4 text-center">
                <p className="text-destructive mb-2">Erreur de chargement</p>
                {createEnhancedFallback(componentName, stepId, substepTitle)}
              </div>
            }>
              <Component 
                stepId={stepId} 
                substepTitle={substepTitle} 
                subsubstepTitle={subsubstepTitle}
              />
            </ErrorBoundary>
          </div>
        </Suspense>
      </ResourceErrorBoundary>
    );
  } catch (error) {
    console.error("Error rendering resource component:", error);
    // Return the enhanced fallback as last resort
    return createEnhancedFallback(componentName, stepId, substepTitle);
  }
};
