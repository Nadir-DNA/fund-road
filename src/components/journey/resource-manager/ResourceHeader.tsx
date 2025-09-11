
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resource } from "@/types/journey";

interface ResourceHeaderProps {
  selectedResource?: Resource;
  resourceLocationLabel?: string | null;
  onRetry?: () => void;
  // Alternative props format
  title?: string;
  description?: string;
  resourceLocation?: string;
}

export default function ResourceHeader({ 
  selectedResource, 
  resourceLocationLabel, 
  onRetry,
  // Support alternative props format
  title,
  description,
  resourceLocation
}: ResourceHeaderProps) {
  // Use the appropriate values based on which props are provided
  const displayTitle = title || (selectedResource?.title || "");
  const displayDescription = description || (selectedResource?.description || "");
  const displayLocation = resourceLocation || resourceLocationLabel || null;
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center">
          {displayLocation && (
            <span className="text-xs font-mono text-muted-foreground mr-2">
              {displayLocation}
            </span>
          )}
          <h3 className="text-lg font-medium">{displayTitle}</h3>
        </div>
        {displayDescription && (
          <p className="text-sm text-muted-foreground mt-1">{displayDescription}</p>
        )}
      </div>
      
      {onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
