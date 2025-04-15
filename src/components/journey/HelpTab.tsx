
import { Resource } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface HelpTabProps {
  resources: Resource[];
}

export default function HelpTab({ resources }: HelpTabProps) {
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
              <Card key={i} className="p-4 sm:p-5 hover:border-primary/50 transition-colors">
                <h4 className="font-medium text-base sm:text-lg">{resource.title}</h4>
                <p className="text-muted-foreground text-sm mt-2 mb-3">{resource.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  onClick={() => resource.url ? window.open(resource.url, '_blank') : null}
                  disabled={!resource.url}
                >
                  {resource.url ? (
                    <>
                      Accéder à la ressource
                      <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </>
                  ) : 'Ressource non disponible'}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-6 border rounded-lg text-center text-muted-foreground mt-6">
            Aucune ressource d'aide supplémentaire n'est disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
