
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { resourceComponentsMap } from "./resourceComponentsMap";
import { toast } from "@/components/ui/use-toast";
import { FileText, Package, ExternalLink } from "lucide-react";

interface ResourcesListProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
  onResourceSelect?: (resourceName: string) => void;
}

export default function ResourcesList({ 
  stepId, 
  substepTitle,
  stepTitle,
  onResourceSelect
}: ResourcesListProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load resources when component mounts or parameters change
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching resources for step ${stepId}, substep: ${substepTitle || 'main'}`);
        
        // Get available component names from the resource map
        const availableComponents = Object.keys(resourceComponentsMap);
        
        // Filter components based on step/substep
        const relevantComponents = availableComponents.filter(component => {
          return isComponentRelevantForStep(component, stepId, substepTitle);
        });
        
        // Map to resource objects
        const mappedResources = relevantComponents.map(component => ({
          id: `component-${component}`,
          title: formatComponentTitle(component),
          description: `Ressource interactive pour l'étape ${stepId}`,
          componentName: component,
          type: 'interactive'
        }));
        
        console.log(`Found ${mappedResources.length} relevant resources`);
        setResources(mappedResources);
        
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Erreur lors du chargement des ressources");
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [stepId, substepTitle]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="md" />
        <span className="ml-2 text-muted-foreground">Chargement des ressources...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 border border-red-500/20 rounded-lg bg-red-500/10">
        <p className="text-red-400">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
      </div>
    );
  }
  
  if (resources.length === 0) {
    return (
      <div className="p-6 border rounded-lg text-center">
        <Package className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Aucune ressource disponible pour {substepTitle || stepTitle || `l'étape ${stepId}`}.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((resource) => (
        <Card 
          key={resource.id}
          className={`overflow-hidden hover:border-primary/50 transition-colors ${onResourceSelect ? 'cursor-pointer' : ''}`}
          onClick={() => onResourceSelect && onResourceSelect(resource.componentName)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
              </div>
              <div className="text-primary/70">
                {resource.type === 'interactive' ? (
                  <FileText className="h-5 w-5" />
                ) : resource.type === 'external' ? (
                  <ExternalLink className="h-5 w-5" />
                ) : (
                  <Package className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardContent>
          
          {onResourceSelect && (
            <CardFooter className="bg-muted/20 p-3 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResourceSelect(resource.componentName);
                }}
              >
                Accéder →
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}

// Helper function to determine if a component is relevant for the current step/substep
function isComponentRelevantForStep(
  componentName: string, 
  stepId: number, 
  substepTitle: string | null
): boolean {
  // Mapping based on step and substep
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
  
  // If no substep specified, show all resources for this step
  if (!substepTitle) {
    // Check if step exists in mapping
    if (mapping[stepId]) {
      const allComponentsForStep = Object.values(mapping[stepId]).flat();
      return allComponentsForStep.includes(componentName);
    }
    return false;
  }
  
  // Check if component is relevant for this specific substep
  if (mapping[stepId]?.[substepTitle]) {
    return mapping[stepId][substepTitle].includes(componentName);
  }
  
  // If we're here, no exact match - do partial match on substep names
  if (mapping[stepId]) {
    for (const key in mapping[stepId]) {
      // Check if substep contains the key or vice versa
      if (key.includes(substepTitle) || substepTitle.includes(key)) {
        if (mapping[stepId][key].includes(componentName)) {
          return true;
        }
      }
    }
  }
  
  // Default fallback - show for all steps
  return ["CompetitiveAnalysisTable", "MarketSizeEstimator", "OpportunityDefinition"].includes(componentName);
}

// Helper function to format component name to user-friendly title
function formatComponentTitle(componentName: string): string {
  // Map of component names to human-readable titles
  const titleMap: Record<string, string> = {
    "UserResearchNotebook": "Journal d'observation utilisateur",
    "OpportunityDefinition": "Synthèse qualitative d'opportunité",
    "MarketSizeEstimator": "Estimation de marché (TAM/SAM/SOM)",
    "CompetitiveAnalysisTable": "Analyse concurrentielle détaillée",
    "ProblemSolutionCanvas": "Canvas Problème / Solution",
    "ProblemSolutionMatrix": "Matrice Problème / Solution",
    "PersonaBuilder": "Fiche Persona utilisateur",
    "UserFeedbackForm": "Fiche de retour utilisateur",
    "ExperimentSummary": "Synthèse des tests utilisateurs",
    "BusinessModelCanvas": "Business Model Canvas",
    "MarketAnalysisGrid": "Grille d'analyse sectorielle",
    "CustomerBehaviorNotes": "Notes de comportement client",
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
    "SwotAnalysis": "Analyse SWOT",
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
    "StartupToolPicker": "Sélecteur d'outils startup"
  };
  
  return titleMap[componentName] || componentName;
}
