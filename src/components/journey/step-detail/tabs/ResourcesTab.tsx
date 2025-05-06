
import { useState, useEffect } from "react";
import { Step, Resource } from "@/types/journey";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import ResourceCard from "../ResourceCard";
import { resourceComponentsMap } from "../../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import { renderResourceComponent } from "../../utils/resourceRenderer";

interface ResourcesTabProps {
  step: Step;
  stepId: number;
  substepTitle: string | null;
  selectedResourceName?: string | null;
}

export default function ResourcesTab({ 
  step,
  stepId,
  substepTitle,
  selectedResourceName 
}: ResourcesTabProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Get resources for the step/substep
  useEffect(() => {
    const loadResources = () => {
      setIsLoading(true);
      try {
        const stepData = substepTitle
          ? step.subSteps?.find(s => s.title === substepTitle)
          : step;
          
        // Prepare local component resources for this step/substep
        if (stepData) {
          const availableComponentNames = Object.keys(resourceComponentsMap);
          
          // Create resource objects for all available components that match the step
          const componentResources: Resource[] = availableComponentNames
            .filter(compName => {
              // Filter based on the mapping information you provided
              // This is a simplified version, you'll need to enhance this logic
              // based on your specific component mapping to steps
              const isRelevant = isComponentRelevantForStep(compName, stepId, substepTitle);
              return isRelevant;
            })
            .map(componentName => ({
              id: `local-${componentName}`,
              title: formatComponentTitle(componentName),
              description: `Ressource pour l'étape ${stepId}`,
              componentName,
              type: 'interactive',
              status: 'available'
            }));
            
          setResources(componentResources);
          
          // Auto-select resource if specified in URL
          if (selectedResourceName) {
            const foundResource = componentResources.find(
              r => r.componentName === selectedResourceName
            );
            if (foundResource) {
              setSelectedResource(foundResource);
            }
          }
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error("Error loading resources:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResources();
  }, [step, stepId, substepTitle, selectedResourceName]);
  
  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingIndicator size="lg" />
      </div>
    );
  }
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Aucune ressource disponible pour cette étape.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {selectedResource ? (
        <div>
          <div className="mb-4">
            <button 
              onClick={() => setSelectedResource(null)}
              className="text-primary hover:underline text-sm"
            >
              ← Retour aux ressources
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">{selectedResource.title}</h2>
          {renderResourceComponent(
            selectedResource.componentName || "", 
            stepId, 
            substepTitle || ""
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ressources disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => handleResourceSelect(resource)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to determine if a component is relevant for the current step
function isComponentRelevantForStep(
  componentName: string, 
  stepId: number, 
  substepTitle: string | null
): boolean {
  // This is a simplified mapping, you'll need to expand based on your structure
  const mapping: Record<number, Record<string, string[]>> = {
    1: {
      "Identification des besoins ou problèmes": ["UserResearchNotebook"],
      "Définition de l'opportunité": ["OpportunityDefinition", "MarketSizeEstimator", "CompetitiveAnalysisTable"]
    },
    2: {
      "Construction du problème-solution fit": ["ProblemSolutionCanvas", "PersonaBuilder"],
      "Tests préliminaires": ["UserFeedbackForm", "ExperimentSummary"]
    },
    3: {
      "Création du Business Model Canvas": ["BusinessModelCanvas"],
      "Étude de marché": ["MarketAnalysisGrid", "CustomerBehaviorNotes"],
      "Validation du modèle économique": ["MonetizationTestGrid", "PaidOfferFeedback"]
    },
    4: {
      "Définition du MVP": ["FeaturePrioritizationMatrix", "MvpSpecification"],
      "Feuille de route produit": ["ProductRoadmapEditor"]
    },
    5: {
      "Choix du statut juridique": ["LegalStatusSelector", "LegalStatusComparison"],
      "Constitution de l'équipe fondatrice": ["CofounderProfile", "CofounderAlignment", "RecruitmentPlan"]
    },
    6: {
      "Objectifs du Business Plan": ["BusinessPlanIntent"],
      "Contenu détaillé": ["BusinessPlanEditor"],
      "Annexes clés": ["FinancialTables", "SwotAnalysis", "GrowthProjection"]
    },
    // Add more mappings based on your step structure
  };
  
  // If no substep is specified, show all resources for the step
  if (!substepTitle) {
    const stepMapping = mapping[stepId];
    if (stepMapping) {
      return Object.values(stepMapping).some(components => 
        components.includes(componentName)
      );
    }
    return false;
  }
  
  // Check if the component is relevant for this specific substep
  const substepMapping = mapping[stepId]?.[substepTitle];
  return substepMapping ? substepMapping.includes(componentName) : false;
}

// Helper function to format component name to a readable title
function formatComponentTitle(componentName: string): string {
  // Map of component names to human-readable titles
  const titleMap: Record<string, string> = {
    "UserResearchNotebook": "Journal d'observation utilisateur",
    "OpportunityDefinition": "Synthèse qualitative",
    "MarketSizeEstimator": "Estimation TAM / SAM / SOM",
    "CompetitiveAnalysisTable": "Analyse concurrentielle",
    "ProblemSolutionCanvas": "Canvas Problème / Solution",
    "PersonaBuilder": "Fiche Persona utilisateur",
    "UserFeedbackForm": "Fiche de retour utilisateur",
    "ExperimentSummary": "Synthèse des tests utilisateurs",
    "BusinessModelCanvas": "Business Model Canvas",
    "MarketAnalysisGrid": "Grille d'analyse sectorielle",
    "CustomerBehaviorNotes": "Comportement client",
    "MonetizationTestGrid": "Résultats de tests de monétisation",
    "PaidOfferFeedback": "Retour sur offre payante",
    "FeaturePrioritizationMatrix": "Matrice Impact / Effort",
    "MvpSpecification": "Cahier des charges fonctionnel",
    "ProductRoadmapEditor": "Roadmap 6-12 mois",
    "LegalStatusSelector": "Assistant de choix de statut",
    "LegalStatusComparison": "Comparateur SAS / SARL / Auto-E",
    "CofounderProfile": "Fiche cofondateur",
    "CofounderAlignment": "Matrice alignement vision / valeurs",
    "RecruitmentPlan": "Plan de recrutement",
    "BusinessPlanIntent": "Fiche intention stratégique",
    "BusinessPlanEditor": "Éditeur BP par section",
    "FinancialTables": "Tableaux financiers",
    "SwotAnalysis": "SWOT",
    "GrowthProjection": "Projection de croissance",
    // Ajoutez les autres mappings selon vos besoins
  };
  
  return titleMap[componentName] || componentName;
}
