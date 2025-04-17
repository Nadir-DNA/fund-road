
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useCourseMaterials } from "@/hooks/useCourseMaterials";
import { supabase } from "@/integrations/supabase/client";

// Composants de resources
import ProblemSolutionMatrix from "./resources/ProblemSolutionCanvas";
import BusinessModelCanvas from "./resources/BusinessModelCanvas";
import SwotAnalysis from "./resources/SwotAnalysis"; // Fixed import name
import CapTable from "./resources/CapTable";
import EmpathyMap from "./resources/EmpathyMap";
import MVPSelector from "./resources/MVPSelector";
import UserResearchNotebook from "./resources/UserResearchNotebook";
import OpportunityDefinition from "./resources/OpportunityDefinition";
import MarketSizeEstimator from "./resources/MarketSizeEstimator";
import PersonaBuilder from "./resources/UserResearchNotebook"; // Temporaire - à remplacer par le vrai composant

export default function ResourceManager({ step, selectedSubstepTitle }) {
  // État pour stocker les ressources disponibles depuis Supabase
  const [supabaseResources, setSupabaseResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Trouver la sous-étape sélectionnée
  const selectedSubstep = step.subSteps?.find(
    substep => substep.title === selectedSubstepTitle
  );
  
  // Utiliser le hook existant pour charger les ressources depuis la base de données
  const { fetchMaterials } = useCourseMaterials(step.id, selectedSubstepTitle || null);
  
  // Charger les ressources depuis Supabase au chargement du composant
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
  }, [step.id, selectedSubstepTitle]);
  
  // Obtenir les ressources à afficher, en combinant les ressources de la base de données et celles définies statiquement
  const getResourcesToShow = () => {
    // Si une sous-étape est sélectionnée et qu'elle a des ressources, on les affiche
    if (selectedSubstep?.resources?.length) {
      return selectedSubstep.resources;
    }
    
    // Sinon, on affiche les ressources de l'étape
    return step.resources;
  };
  
  // Rendu du composant correspondant à la ressource
  const renderResourceComponent = (componentName, stepId, substepTitle) => {
    switch (componentName) {
      case "ProblemSolutionCanvas":
      case "ProblemSolutionMatrix":
        return <ProblemSolutionMatrix stepId={stepId} substepTitle={substepTitle} />;
      case "BusinessModelCanvas":
        return <BusinessModelCanvas stepId={stepId} substepTitle={substepTitle} />;
      case "SWOTAnalysis":
      case "SwotAnalysis":
        return <SwotAnalysis stepId={stepId} substepTitle={substepTitle} />;
      case "CapTable":
        return <CapTable stepId={stepId} substepTitle={substepTitle} />;
      case "EmpathyMap":
        return <EmpathyMap stepId={stepId} substepTitle={substepTitle} />;
      case "UserResearchNotebook":
        return <UserResearchNotebook stepId={stepId} substepTitle={substepTitle} />;
      case "OpportunityDefinition":
        return <OpportunityDefinition stepId={stepId} substepTitle={substepTitle} />;
      case "MarketSizeEstimator":
        return <MarketSizeEstimator stepId={stepId} substepTitle={substepTitle} />;
      case "PersonaBuilder":
        return <PersonaBuilder stepId={stepId} substepTitle={substepTitle} />; // Temporaire - à remplacer
      case "MVPSelector":
        return <MVPSelector stepId={stepId} substepTitle={substepTitle} />;
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center flex-col gap-2 text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/60" />
                <p className="text-center text-muted-foreground mt-2">
                  Composant <strong>{componentName}</strong> non trouvé ou en cours de développement.
                  <br />
                  Cette ressource sera disponible prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Si chargement en cours
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

  // Afficher les ressources disponibles pour la sous-étape ou l'étape sélectionnée
  const resources = getResourcesToShow();
  
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
  
  // S'il y a une seule ressource disponible et un composant associé, l'afficher directement
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
        {renderResourceComponent(resource.componentName!, step.id, selectedSubstepTitle)}
      </div>
    );
  }
  
  // S'il y a plusieurs ressources ou si aucune sous-étape n'est sélectionnée, afficher la liste
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
                    {resource.componentName && selectedSubstepTitle && (
                      renderResourceComponent(resource.componentName, step.id, selectedSubstepTitle)
                    )}
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
