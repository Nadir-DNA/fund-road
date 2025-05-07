
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Resource } from "@/types/journey";
import { buildResourceUrl } from "@/utils/navigationUtils";
import { useState, useEffect } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { getSequentialResourceNavigation } from "@/utils/resourceHelpers";
import { toast } from "@/components/ui/use-toast";

interface ResourceSequenceNavigationProps {
  stepId: number;
  currentResource: Resource;
  selectedResourceName: string;
}

export default function ResourceSequenceNavigation({
  stepId,
  currentResource,
  selectedResourceName
}: ResourceSequenceNavigationProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    previousResource, 
    nextResource, 
    currentIndex, 
    totalResources 
  } = getSequentialResourceNavigation(stepId, selectedResourceName);
  
  // Check if we have navigation options
  const hasPrevious = previousResource !== null;
  const hasNext = nextResource !== null;
  
  const navigateToResource = (resource: Resource | null) => {
    if (isLoading || !resource?.componentName) return;
    
    // Get the substep title either from the resource or its parent
    const substepTitle = resource.subsubstepTitle || currentResource.subsubstepTitle;
    if (!substepTitle) {
      console.error("Cannot navigate: missing substep title", resource);
      toast({
        title: "Erreur de navigation",
        description: "Impossible de naviguer vers cette ressource",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    console.log(`Navigating to resource: ${resource.componentName} in ${substepTitle}`);
    
    const url = buildResourceUrl(
      stepId, 
      substepTitle, 
      resource.componentName
    );
    
    setTimeout(() => {
      navigate(url);
      setTimeout(() => setIsLoading(false), 500);
    }, 100);
  };
  
  useEffect(() => {
    // Reset loading state when resource changes
    setIsLoading(false);
  }, [selectedResourceName]);
  
  return (
    <div className="flex items-center justify-between p-2 border-t border-slate-700 mt-6 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToResource(previousResource)}
        disabled={!hasPrevious || isLoading}
        className="w-36"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Ressource précédente
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
        onClick={() => navigateToResource(nextResource)}
        disabled={!hasNext || isLoading}
        className="w-36"
      >
        Ressource suivante
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
