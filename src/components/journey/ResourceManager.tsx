import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useCourseMaterials } from "@/hooks/useCourseMaterials";
import { renderResourceComponent } from "./utils/resourceRenderer";

export default function ResourceManager({ step, selectedSubstepTitle }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the selected sub-step
  const selectedSubstep = step.subSteps?.find(
    substep => substep.title === selectedSubstepTitle
  );
  
  // Use the existing hook to load resources from the database
  const { fetchMaterials } = useCourseMaterials(step.id, selectedSubstepTitle || null);
  const [supabaseResources, setSupabaseResources] = useState([]);
  
  // Load resources from Supabase when component mounts
  useEffect(() => {
    const loadSupabaseResources = async () => {
      setIsLoading(true);
      try {
        const materials = await fetchMaterials();
        setSupabaseResources(materials);
      } catch (error) {
        console.error("Erreur lors du chargement des ressources depuis Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedSubstepTitle) {
      loadSupabaseResources();
    }
  }, [step.id, selectedSubstepTitle, fetchMaterials]);
  
  // Get resources to display
  const getResourcesToShow = () => {
    // If a sub-step is selected and it has resources, show them
    if (selectedSubstep?.resources?.length) {
      return selectedSubstep.resources;
    }
    // Otherwise, show the step's resources
    return step.resources;
  };

  // If loading
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Chargement des ressources...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get resources to show
  const resources = getResourcesToShow();
  
  // If no resources available
  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Aucune ressource interactive n'est actuellement disponible pour cette section.
            <br />
            De nouvelles ressources seront ajoutées prochainement.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // If only one available resource with selected sub-step
  const availableResources = resources.filter(r => r.componentName && r.status !== 'coming-soon');
  
  if (availableResources.length === 1 && selectedSubstepTitle) {
    const resource = availableResources[0];
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{resource.title}</h3>
          <Badge variant="outline" className="bg-primary/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disponible
          </Badge>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">{resource.description}</p>
        {resource.componentName && selectedSubstepTitle && 
          renderResourceComponent(resource.componentName, step.id, selectedSubstepTitle)}
      </div>
    );
  }
  
  // Multiple resources or no sub-step selected
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Ressources disponibles</h3>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="coming">À venir</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <div className="space-y-6">
            {resources.filter(r => r.status !== 'coming-soon').length > 0 ? (
              resources
                .filter(r => r.status !== 'coming-soon')
                .map((resource, idx) => (
                  <div key={idx} className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-medium">{resource.title}</h4>
                      <Badge variant="outline" className="bg-primary/10">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                    {resource.componentName && selectedSubstepTitle && 
                      renderResourceComponent(resource.componentName, step.id, selectedSubstepTitle)}
                  </div>
                ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Aucune ressource n'est encore disponible pour cette section.
                    <br />
                    Consultez l'onglet "À venir" pour voir ce qui est en préparation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="coming">
          <div className="space-y-4 mt-2">
            {resources.filter(r => r.status === 'coming-soon').length > 0 ? (
              resources
                .filter(r => r.status === 'coming-soon')
                .map((resource, idx) => (
                  <Card key={idx} className="p-4 hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-base">{resource.title}</h4>
                      <Badge variant="outline" className="bg-muted/20">
                        <Clock className="h-3 w-3 mr-1" />
                        À venir
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                  </Card>
                ))
            ) : (
              <p className="text-center text-muted-foreground">
                Toutes les ressources prévues pour cette section sont déjà disponibles.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
