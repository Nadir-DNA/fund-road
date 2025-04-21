
import { useState } from "react";
import { Resource } from "@/types/journey";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useNavigate } from "react-router-dom";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";
import { toast } from "@/components/ui/use-toast";

interface ResourceCardProps {
  resource: Resource;
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

export default function ResourceCard({ resource, stepId, substepTitle, subsubstepTitle }: ResourceCardProps) {
  const [loadingResource, setLoadingResource] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleResourceClick = async () => {
    if (loadingResource) return;
    
    try {
      setLoadingResource(true);
      
      if (resource.url) {
        window.open(resource.url, '_blank');
        setTimeout(() => setLoadingResource(false), 300);
        return;
      }

      if (resource.componentName) {
        saveResourceReturnPath(window.location.pathname + window.location.search);
        let resourceUrl = buildResourceUrl(stepId, substepTitle, resource.componentName);
        
        // Add subsubstep to URL if present
        if (subsubstepTitle) {
          resourceUrl += `&subsubstep=${encodeURIComponent(subsubstepTitle)}`;
        }
        
        setTimeout(() => {
          navigate(resourceUrl);
          setTimeout(() => setLoadingResource(false), 300);
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
    } finally {
      setLoadingResource(false);
    }
  };

  return (
    <Card className="p-5 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {resource.url ? 
            <ExternalLink className="h-5 w-5 text-primary" /> : 
            <FileText className="h-5 w-5 text-primary" />
          }
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-base sm:text-lg">{resource.title}</h4>
            {resource.status === 'coming-soon' && (
              <Badge variant="outline">Bientôt disponible</Badge>
            )}
          </div>
          
          <p className="text-muted-foreground text-sm mt-1 mb-3">{resource.description}</p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm mt-1"
            onClick={handleResourceClick}
            disabled={
              loadingResource || 
              resource.status === 'coming-soon' || 
              (!resource.url && !resource.componentName)
            }
          >
            {loadingResource ? (
              <>
                <LoadingIndicator size="sm" className="mr-2" />
                Chargement...
              </>
            ) : resource.url ? (
              <>
                Accéder à la ressource
                <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </>
            ) : resource.componentName ? 'Ouvrir l\'outil' : 'Ressource non disponible'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
