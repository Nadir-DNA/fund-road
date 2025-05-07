
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resource } from "@/types/journey";

interface ResourceHeaderProps {
  selectedResource: Resource;
  resourceLocationLabel: string | null;
  onRetry: () => void;
}

export default function ResourceHeader({ 
  selectedResource, 
  resourceLocationLabel, 
  onRetry 
}: ResourceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center">
          <span className="text-xs font-mono text-muted-foreground mr-2">
            {resourceLocationLabel}
          </span>
          <h3 className="text-lg font-medium">{selectedResource.title}</h3>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRetry}
        className="text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
