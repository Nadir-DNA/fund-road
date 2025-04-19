
import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { resourceComponentsMap } from "../resourceComponentsMap";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

// Define the props interface that all resource components should have
interface ResourceComponentProps {
  stepId: number;
  substepTitle: string;
}

// Fallback loading component
const ResourceLoadingCard = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center flex-col gap-2 text-center py-8">
        <LoadingIndicator size="lg" />
        <p className="text-center text-muted-foreground mt-2">
          Chargement de la ressource...
        </p>
      </div>
    </CardContent>
  </Card>
);

// Error boundary fallback component
const ResourceErrorCard = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center flex-col gap-2 text-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive/60" />
        <p className="text-center text-destructive mt-2">
          Une erreur est survenue lors du chargement de la ressource.
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Essayez de rafraîchir la page ou revenez plus tard.
        </p>
      </div>
    </CardContent>
  </Card>
);

// Not found component
const ResourceNotFoundCard = ({ componentName }: { componentName: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center flex-col gap-2 text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/60" />
        <p className="text-center text-muted-foreground mt-2">
          Composant <strong>{componentName}</strong> non trouvé ou en cours de développement.
          <br />
          Cette ressource sera disponible prochainement.
        </p>
      </div>
    </CardContent>
  </Card>
);

// Error boundary class component
class ResourceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error in resource component:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Render resource component
export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string) => {
  try {
    // Get the component from the map, ensuring it's typed as a React component that accepts ResourceComponentProps
    const ResourceComponent = resourceComponentsMap[componentName] as React.LazyExoticComponent<React.ComponentType<ResourceComponentProps>>;
    
    if (!ResourceComponent) {
      return <ResourceNotFoundCard componentName={componentName} />;
    }
    
    return (
      <ResourceErrorBoundary fallback={<ResourceErrorCard />}>
        <Suspense fallback={<ResourceLoadingCard />}>
          <ResourceComponent stepId={stepId} substepTitle={substepTitle} />
        </Suspense>
      </ResourceErrorBoundary>
    );
  } catch (error) {
    console.error("Error rendering resource component:", error);
    return <ResourceErrorCard />;
  }
};
