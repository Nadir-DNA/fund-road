
import { Resource } from "@/types/journey";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface StepResourcesProps {
  resources: Resource[];
}

export default function StepResources({
  resources
}: StepResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }
  
  const availableResources = resources.filter(resource => resource.status !== 'coming-soon');
  
  if (availableResources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {availableResources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableResources.map((resource, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="flex items-center gap-1 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => resource.url ? window.open(resource.url, '_blank') : null}
            >
              {resource.title}
              {resource.url && <ExternalLink className="h-3 w-3" />}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
