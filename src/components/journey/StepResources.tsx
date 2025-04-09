
import { Resource } from "@/types/journey";

interface StepResourcesProps {
  resources: Resource[];
}

export default function StepResources({ resources }: StepResourcesProps) {
  return (
    <div className="glass-card p-4 mb-4 space-y-3">
      <h4 className="font-medium">Ressources disponibles:</h4>
      <ul className="space-y-2">
        {resources.map((resource, idx) => (
          <li key={idx} className="pl-4 border-l-2 border-primary/50">
            <span className="font-medium">{resource.title}</span>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
