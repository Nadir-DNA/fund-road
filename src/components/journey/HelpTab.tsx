
import { Resource } from "@/types/journey";
import { Button } from "@/components/ui/button";

interface HelpTabProps {
  resources: Resource[];
}

export default function HelpTab({ resources }: HelpTabProps) {
  return (
    <div className="py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ressources d'aide</h3>
        <p className="text-muted-foreground">
          Consultez ces ressources pour vous aider à compléter cette étape de votre parcours entrepreneurial.
        </p>
        
        {resources && resources.length > 0 ? (
          <div className="space-y-3 mt-4">
            {resources.map((resource, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <h4 className="font-medium">{resource.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{resource.description}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => resource.url ? window.open(resource.url, '_blank') : null}
                  disabled={!resource.url}
                >
                  {resource.url ? 'Accéder à la ressource' : 'Ressource non disponible'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border rounded-lg text-center text-muted-foreground">
            Aucune ressource d'aide supplémentaire n'est disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
