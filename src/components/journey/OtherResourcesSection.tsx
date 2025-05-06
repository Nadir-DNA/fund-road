
import ResourceDisplay from "./resources/ResourceDisplay";
import { Resource } from "@/types/journey";

interface OtherResourcesSectionProps {
  resources: Resource[];
  stepId: number;
  substepTitle: string;
}

export default function OtherResourcesSection({ resources, stepId, substepTitle }: OtherResourcesSectionProps) {
  if (resources.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Ressources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map(resource => (
          <ResourceDisplay 
            key={resource.id} 
            resource={resource} 
            stepId={stepId} 
            substepTitle={substepTitle} 
          />
        ))}
      </div>
    </div>
  );
}
