
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
  substepTitle: string;
}

export default function ResourceSequenceNavigation({
  stepId,
  currentResource,
  selectedResourceName,
  substepTitle
}: ResourceSequenceNavigationProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get navigation information with improved error handling
  const { 
    previousResource, 
    nextResource, 
    currentIndex, 
    totalResources 
  } = getSequentialResourceNavigation(stepId, selectedResourceName);
  
  // Check if we have navigation options
  const hasPrevious = previousResource !== null;
  const hasNext = nextResource !== null;
  
  console.log("ResourceSequenceNavigation:", {
    resourceName: selectedResourceName,
    stepId,
    substepTitle,
    hasPrevious,
    hasNext,
    currentIndex,
    totalResources,
    previousResource: previousResource?.title,
    nextResource: nextResource?.title
  });
  
  const navigateToResource = async (resource: Resource | null) => {
    if (isLoading || !resource?.componentName) return;
    
    setIsLoading(true);
    
    try {
      // Build the navigation URL with better error handling
      let navSubstepTitle = substepTitle;
      
      // If the resource has a specific subsubstep, use it
      if (resource.subsubstepTitle) {
        navSubstepTitle = resource.subsubstepTitle;
      }
      
      if (!navSubstepTitle) {
        console.error("Cannot navigate: missing substep title", resource);
        toast({
          title: "Erreur de navigation",
          description: "Impossible de naviguer vers cette ressource",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Navigating to resource: ${resource.componentName} in ${navSubstepTitle}`);
      
      const url = buildResourceUrl(
        stepId, 
        navSubstepTitle, 
        resource.componentName
      );
      
      // Use navigate with replace: false for proper history management
      navigate(url, { replace: false });
      
      // Show success message
      toast({
        title: "Navigation réussie",
        description: `Chargement de ${resource.title}`,
        duration: 2000
      });
      
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible de naviguer vers cette ressource",
        variant: "destructive"
      });
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
  useEffect(() => {
    // Reset loading state when resource changes
    setIsLoading(false);
  }, [selectedResourceName]);
  
  // Keyboard navigation with improved handling
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'ArrowLeft' && hasPrevious && !isLoading) {
          event.preventDefault();
          navigateToResource(previousResource);
        } else if (event.key === 'ArrowRight' && hasNext && !isLoading) {
          event.preventDefault();
          navigateToResource(nextResource);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasPrevious, hasNext, previousResource, nextResource, isLoading]);
  
  // Don't render if no navigation is possible
  if (!hasPrevious && !hasNext) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between p-4 border-t border-slate-200 mt-6 pt-4 bg-slate-50/50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToResource(previousResource)}
        disabled={!hasPrevious || isLoading}
        className="w-40 transition-all duration-200 hover:scale-105"
        title={previousResource ? `Aller à ${previousResource.title}` : "Aucune ressource précédente"}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isLoading ? "Chargement..." : "Ressource précédente"}
      </Button>
      
      <div className="text-sm font-mono text-muted-foreground flex items-center gap-2">
        {isLoading ? (
          <LoadingIndicator size="sm" />
        ) : (
          <>
            <span className="bg-primary/10 px-2 py-1 rounded">
              {currentIndex + 1}/{totalResources}
            </span>
            <span className="text-xs opacity-70">
              Ctrl+← / Ctrl+→ pour naviguer
            </span>
          </>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToResource(nextResource)}
        disabled={!hasNext || isLoading}
        className="w-40 transition-all duration-200 hover:scale-105"
        title={nextResource ? `Aller à ${nextResource.title}` : "Aucune ressource suivante"}
      >
        {isLoading ? "Chargement..." : "Ressource suivante"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
