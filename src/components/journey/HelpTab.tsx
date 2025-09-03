
import { useState } from "react";
import { Resource } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { toast } from "@/components/ui/use-toast";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";

interface HelpTabProps {
  resources: Resource[];
  stepId: number;
  substepTitle?: string | null;
}

export default function HelpTab({ resources, stepId, substepTitle }: HelpTabProps) {
  const navigate = useNavigate();
  const [loadingResource, setLoadingResource] = useState<string | null>(null);

  const handleResourceClick = async (resource: Resource) => {
    if (loadingResource) return; // Prevent multiple clicks
    
    try {
      setLoadingResource(resource.title);
      
      // If there's a URL, open it in a new tab
      if (resource.url) {
        window.open(resource.url, '_blank');
        setTimeout(() => setLoadingResource(null), 300);
        return;
      }

      // If there's a componentName but no URL, navigate to the resource in the roadmap
      if (resource.componentName && stepId && substepTitle) {
        // Save current URL before navigating away
        saveResourceReturnPath(window.location.pathname + window.location.search);
        
        const resourceUrl = buildResourceUrl(stepId, substepTitle, resource.componentName);
        
        // Use setTimeout to ensure UI updates before navigation
        setTimeout(() => {
          navigate(resourceUrl);
          
          // Reset loading state after navigation begins
          setTimeout(() => setLoadingResource(null), 300);
        }, 100);
        
        return;
      }
      
      // If we reach here, there was no valid navigation target
      setLoadingResource(null);
      
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

  return (
    <div className="py-6 w-full">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Ressources d'aide</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Consultez ces ressources pour vous aider à compléter cette étape de votre parcours entrepreneurial.
        </p>
        
        {resources && resources.length > 0 ? (
          <div className="space-y-4 mt-6">
            {resources.map((resource, i) => (
              <Card key={i} className="p-5 hover:border-primary/50 transition-colors bg-slate-700">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {resource.url ? <ExternalLink className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
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
                      onClick={() => handleResourceClick(resource)}
                      disabled={
                        loadingResource === resource.title || 
                        resource.status === 'coming-soon' || 
                        (!resource.url && (!resource.componentName || !stepId || !substepTitle))
                      }
                    >
                      {loadingResource === resource.title ? (
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
            ))}
          </div>
        ) : (
          <div className="p-8 border rounded-lg text-center text-muted-foreground mt-6 bg-slate-700">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Aucune ressource d'aide supplémentaire n'est disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
