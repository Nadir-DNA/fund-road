
import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { resourceComponentsMap } from "../resourceComponentsMap";

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
        <div className="h-12 w-12 rounded-full border-4 border-t-primary animate-spin" />
        <p className="text-center text-muted-foreground mt-2">
          Chargement de la ressource...
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

// Render resource component
export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string) => {
  // Get the component from the map, ensuring it's typed as a React component that accepts ResourceComponentProps
  const ResourceComponent = resourceComponentsMap[componentName] as React.LazyExoticComponent<React.ComponentType<ResourceComponentProps>>;
  
  if (!ResourceComponent) {
    return <ResourceNotFoundCard componentName={componentName} />;
  }
  
  return (
    <Suspense fallback={<ResourceLoadingCard />}>
      <ResourceComponent stepId={stepId} substepTitle={substepTitle} />
    </Suspense>
  );
};
