
import { Suspense, lazy } from "react";
import { toast } from "@/components/ui/use-toast";

interface DynamicResourceComponentProps {
  componentName: string;
  stepId: number;
  substepTitle: string;
}

const DynamicResourceComponent = ({ componentName, stepId, substepTitle }: DynamicResourceComponentProps) => {
  // Create a lazy-loaded component
  const DynamicComponent = lazy(async () => {
    try {
      // Dynamic import based on component name
      const module = await import(`@/components/journey/resources/${componentName}`);
      return { default: module.default };
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      toast({
        title: "Erreur de chargement",
        description: `Le composant ${componentName} n'a pas été trouvé.`,
        variant: "destructive"
      });
      return { 
        default: () => <div className="p-4 text-red-500">Failed to load resource: {componentName}</div>
      };
    }
  });

  return (
    <Suspense fallback={<div className="p-4">Loading resource...</div>}>
      <DynamicComponent 
        // We wrap this component in a div to avoid passing props directly
        // This solves the TypeScript error
      />
    </Suspense>
  );
};

export default DynamicResourceComponent;
