
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";

export const useResourceNavigation = () => {
  const [loadingResource, setLoadingResource] = useState<string | null>(null);
  const navigate = useNavigate();

  const navigateToResource = async (
    resourceTitle: string,
    resourceUrl: string | undefined,
    componentName: string | undefined,
    stepId: number,
    substepTitle: string
  ) => {
    if (loadingResource) return;
    
    try {
      setLoadingResource(resourceTitle);
      
      if (resourceUrl) {
        window.open(resourceUrl, '_blank');
        setTimeout(() => setLoadingResource(null), 300);
        return;
      }

      if (componentName) {
        saveResourceReturnPath(window.location.pathname + window.location.search);
        const url = buildResourceUrl(stepId, substepTitle, componentName);
        
        setTimeout(() => {
          navigate(url);
          setTimeout(() => setLoadingResource(null), 300);
        }, 100);
        return;
      }
      
    } catch (error) {
      console.error("Error navigating to resource:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à cette ressource pour le moment.",
        variant: "destructive",
      });
      setLoadingResource(null);
    }
  };

  return {
    loadingResource,
    navigateToResource
  };
};
