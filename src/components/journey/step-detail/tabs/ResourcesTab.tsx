
import { useState, useEffect, useRef } from "react";
import { Step, Resource } from "@/types/journey";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import ResourceCard from "../ResourceCard";
import { resourceComponentsMap } from "../../resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import { renderResourceComponent } from "../../utils/resourceRenderer";
import LazyLoad from "@/components/LazyLoad";

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const initialLoadDone = useRef(false);
  
  // Load resources only once on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    console.log(`Loading resources for step ${stepId}, substep ${substepTitle || 'main'}`);
    setIsLoading(true);
    
    try {
      // Prioritize identification of resources
      const stepData = substepTitle
        ? step.subSteps?.find(s => s.title === substepTitle)
        : step;
        
      if (stepData) {
        const availableComponentNames = Object.keys(resourceComponentsMap);
        
        // Optimized: fast selection of components for this step
        const componentResources: Resource[] = availableComponentNames
          .filter(compName => isComponentRelevantForStep(compName, stepId, substepTitle))
          .map(componentName => ({
            id: `local-${componentName}`,
            title: formatComponentTitle(componentName),
            description: `Interactive resource for step ${stepId}`,
            componentName,
            type: 'interactive',
            status: 'available'
          }));
          
        console.log(`Found ${componentResources.length} relevant resources`);
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
      
      initialLoadDone.current = true;
    } catch (error) {
      console.error("Error loading resources:", error);
      toast({
        title: "Error",
        description: "Unable to load resources",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [step, stepId, substepTitle, selectedResourceName]);
  
  const handleResourceSelect = (resource: Resource) => {
    console.log("Selected resource:", resource.title);
    setSelectedResource(resource);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingIndicator size="lg" />
      </div>
    );
  }
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          No resources available for this step.
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
              ← Back to resources
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">{selectedResource.title}</h2>
          <LazyLoad 
            priority={true} 
            showLoader={true}
            height={400}
            delay={0}
          >
            {renderResourceComponent(
              selectedResource.componentName || "", 
              stepId, 
              substepTitle || ""
            )}
          </LazyLoad>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4">Available resources ({resources.length})</h2>
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
  // Mapping based on provided resource structure
  const mapping: Record<number, Record<string, string[]>> = {
    1: {
      "Identification des besoins ou problèmes": ["UserResearchNotebook"],
      "Définition de l'opportunité": ["OpportunityDefinition", "MarketSizeEstimator", "CompetitiveAnalysisTable"],
      "Recherche utilisateur": ["UserResearchNotebook", "CustomerBehaviorNotes"]
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
      "Définition du MVP": ["MVPSelector", "FeaturePrioritizationMatrix", "MvpSpecification"],
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
    7: {
      "Structure du pitch investisseur": ["PitchStoryTeller"],
      "Design & narration": ["PitchStoryTeller"]
    },
    8: {
      "Cartographie des sources": ["FundingMap"],
      "Outils de levée": ["CapTableEditor", "DilutionSimulator", "TermSheetBuilder"],
      "Stratégie d'approche": ["InvestorEmailScript", "InvestorObjectionPrep", "InvestorFollowUpPlan"]
    }
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
  
  // Check if component is relevant for this specific substep
  const substepMapping = mapping[stepId]?.[substepTitle];
  if (substepMapping) {
    return substepMapping.includes(componentName);
  }
  
  // Fallback check if substep title doesn't match exactly
  const stepMapping = mapping[stepId];
  if (stepMapping) {
    // Check all substeps for this step to find a match
    return Object.values(stepMapping).some(components => 
      components.includes(componentName)
    );
  }
  
  return false;
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
    "ProblemSolutionMatrix": "Matrice Problème / Solution",
    "PersonaBuilder": "Fiche Persona utilisateur",
    "UserFeedbackForm": "Fiche de retour utilisateur",
    "ExperimentSummary": "Synthèse des tests utilisateurs",
    "BusinessModelCanvas": "Business Model Canvas",
    "MarketAnalysisGrid": "Grille d'analyse sectorielle",
    "CustomerBehaviorNotes": "Comportement client",
    "MonetizationTestGrid": "Résultats de tests de monétisation",
    "PaidOfferFeedback": "Retour sur offre payante",
    "FeaturePrioritizationMatrix": "Matrice Impact / Effort",
    "MVPSelector": "Sélecteur de MVP",
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
    "FundingMap": "Cartographie des financements",
    "CapTableEditor": "Éditeur de cap table",
    "DilutionSimulator": "Simulateur de dilution",
    "TermSheetBuilder": "Générateur de term sheet",
    "PitchStoryTeller": "Storytelling de pitch",
    "InvestorEmailScript": "Script d'email investisseur",
    "InvestorObjectionPrep": "Préparation aux objections",
    "InvestorFollowUpPlan": "Plan de suivi investisseur",
    "IPSelfAssessment": "Auto-évaluation PI",
    "IPProceduresChecklist": "Checklist procédures PI",
    "IPStrategyCanvas": "Canvas stratégie PI",
    "StartupToolPicker": "Sélecteur d'outils startup"
  };
  
  return titleMap[componentName] || componentName;
}
