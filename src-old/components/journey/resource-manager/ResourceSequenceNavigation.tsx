
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
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
      console.log(`Navigating to resource: ${resource.componentName}`);
      
      // For navigation between resources, we need to find which substep contains the target resource
      // We'll use the current substepTitle as a starting point, but may need to find the correct one
      let targetSubstepTitle = substepTitle;
      
      // If the resource has a specific subsubstep, use it
      if (resource.subsubstepTitle) {
        targetSubstepTitle = resource.subsubstepTitle;
      }
      
      const url = buildResourceUrl(
        stepId, 
        targetSubstepTitle, 
        resource.componentName
      );
      
      console.log(`Navigation URL: ${url}`);
      
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
  
  // Always render the navigation component, even if no navigation is available
  return (
    <div className="sticky bottom-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-slate-600 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6">
        <Button
          variant={hasPrevious ? "default" : "ghost"}
          size="lg"
          onClick={() => navigateToResource(previousResource)}
          disabled={!hasPrevious || isLoading}
          className={`min-w-[160px] transition-all duration-300 hover:scale-105 ${
            hasPrevious 
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md" 
              : "opacity-50 cursor-not-allowed"
          }`}
          title={previousResource ? `Aller à ${previousResource.title}` : "Aucune ressource précédente"}
        >
          {isLoading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Précédent
            </>
          )}
        </Button>
        
        <div className="flex flex-col items-center gap-2">
          <div className="bg-slate-900/70 px-4 py-2 rounded-full border border-slate-600">
            <span className="text-sm font-semibold text-slate-200">
              {totalResources > 0 ? `${currentIndex + 1} / ${totalResources}` : "0 / 0"}
            </span>
          </div>
          {totalResources > 1 && (
            <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              <kbd className="font-mono">Ctrl</kbd> + <kbd className="font-mono">←</kbd> / <kbd className="font-mono">→</kbd> pour naviguer
            </div>
          )}
        </div>
        
        <Button
          variant={hasNext ? "default" : "ghost"}
          size="lg"
          onClick={() => navigateToResource(nextResource)}
          disabled={!hasNext || isLoading}
          className={`min-w-[160px] transition-all duration-300 hover:scale-105 ${
            hasNext 
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md" 
              : "opacity-50 cursor-not-allowed"
          }`}
          title={nextResource ? `Aller à ${nextResource.title}` : "Aucune ressource suivante"}
        >
          {isLoading ? (
            <LoadingIndicator size="sm" />
          ) : (
            <>
              Suivant
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
      
      {/* Progress bar */}
      {totalResources > 1 && (
        <div className="px-6 pb-4">
          <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-600">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / totalResources) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
