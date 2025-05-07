
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Resource } from "@/types/journey";
import { buildResourceUrl } from "@/utils/navigationUtils";
import { useState } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface ResourceNavigationProps {
  stepId: number;
  substepTitle: string;
  currentResource: Resource;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
}

export default function ResourceNavigation({
  stepId,
  substepTitle,
  currentResource,
  allResources,
  currentIndex,
  totalResources
}: ResourceNavigationProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate previous and next resource indices
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalResources - 1;
  
  const navigateToResource = (resourceIndex: number) => {
    if (isLoading || resourceIndex < 0 || resourceIndex >= allResources.length) return;
    
    const targetResource = allResources[resourceIndex];
    if (!targetResource?.componentName) return;
    
    setIsLoading(true);
    
    const url = buildResourceUrl(
      stepId, 
      substepTitle, 
      targetResource.componentName
    );
    
    setTimeout(() => {
      navigate(url);
      setTimeout(() => setIsLoading(false), 500);
    }, 100);
  };
  
  return (
    <div className="flex items-center justify-between p-2 border-t border-slate-700 mt-6 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToResource(currentIndex - 1)}
        disabled={!hasPrevious || isLoading}
        className="w-28"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Précédente
      </Button>
      
      <div className="text-sm font-mono text-muted-foreground">
        {isLoading ? (
          <LoadingIndicator size="sm" />
        ) : (
          <>Ressource {currentIndex + 1}/{totalResources}</>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToResource(currentIndex + 1)}
        disabled={!hasNext || isLoading}
        className="w-28"
      >
        Suivante
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
