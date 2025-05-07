
import { Resource } from "@/types/journey";
import { journeySteps } from "@/data/journeySteps";

// Helper function to get resources from step data
export function getStepResources(step: any, selectedSubstepTitle: string | undefined): Resource[] {
  // Get resources from subStep or step directly
  const stepData = selectedSubstepTitle
    ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)
    : step;
  
  if (!stepData) {
    console.log("No step data found for resources");
    return [];
  }
  
  const resources = stepData.resources || [];
  console.log("Step resources found:", resources);
  
  // Add missing id and type properties to ensure type safety
  return resources.map((resource: any) => ({
    ...resource,
    id: resource.id || `step-${Math.random().toString(36).substring(7)}`,
    type: resource.type || 'resource'
  }));
}

// Function to convert resource type to component name
export function resourceTypeToComponentName(resourceType: string): string {
  const typeMap: Record<string, string> = {
    'swot-analysis': 'SwotAnalysis',
    'user-research': 'UserResearchNotebook',
    'problem-solution': 'ProblemSolutionCanvas',
    'business-model': 'BusinessModelCanvas',
    // Ajouter d'autres mappings selon les besoins
  };
  
  return typeMap[resourceType] || resourceType;
}

// Get all resources for a step, including from substeps and subsubsteps
// Modified to filter by substepTitle when provided
export function getAllStepResources(stepId: number, substepTitle?: string | null): Resource[] {
  const step = journeySteps.find(s => s.id === stepId);
  if (!step) return [];
  
  let allResources: Resource[] = [];
  
  // If substepTitle is provided, only get resources for that substep
  if (substepTitle) {
    // Find the specific substep
    const substep = step.subSteps?.find(sub => sub.title === substepTitle);
    if (substep) {
      // Add resources from this substep
      if (substep.resources) {
        allResources = [...allResources, ...substep.resources];
      }
      
      // Add resources from subsubsteps of this substep
      if (substep.subSubSteps && substep.subSubSteps.length > 0) {
        substep.subSubSteps.forEach(subsubstep => {
          if (subsubstep.resources) {
            allResources = [...allResources, ...subsubstep.resources];
          }
        });
      }
    }
  } 
  // If no substepTitle, get all resources from the step
  else {
    // Add resources from the main step
    if (step.resources) {
      allResources = [...allResources, ...step.resources];
    }
    
    // Add resources from all substeps
    if (step.subSteps && step.subSteps.length > 0) {
      step.subSteps.forEach(substep => {
        if (substep.resources) {
          allResources = [...allResources, ...substep.resources];
        }
        
        // Add resources from subsubsteps
        if (substep.subSubSteps && substep.subSubSteps.length > 0) {
          substep.subSubSteps.forEach(subsubstep => {
            if (subsubstep.resources) {
              allResources = [...allResources, ...subsubstep.resources];
            }
          });
        }
      });
    }
  }
  
  // Remove duplicates by componentName
  const uniqueResources = allResources.reduce((acc: Resource[], current) => {
    const isDuplicate = acc.find(item => 
      item.componentName === current.componentName && current.componentName !== undefined
    );
    if (!isDuplicate && current.componentName) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  console.log(`getAllStepResources: Found ${uniqueResources.length} resources for step ${stepId} ${substepTitle ? `and substep ${substepTitle}` : ''}`);
  return uniqueResources;
}

// Get resource index and total count - Updated to support substep filtering
export function getResourceNavigationInfo(
  stepId: number, 
  currentResourceName: string | null,
  substepTitle?: string | null
): { currentIndex: number, totalResources: number, allResources: Resource[] } {
  // Get resources filtered by substep if provided
  const allResources = getAllStepResources(stepId, substepTitle);
  const currentIndex = currentResourceName 
    ? allResources.findIndex(r => r.componentName === currentResourceName)
    : -1;
  
  console.log(`getResourceNavigationInfo: Found ${allResources.length} resources, current index: ${currentIndex}`);
  return {
    currentIndex: currentIndex !== -1 ? currentIndex : 0,
    totalResources: allResources.length,
    allResources
  };
}

// Get resource location label
export function getResourceLocationLabel(stepId: number, resourceName: string | null): string {
  if (!resourceName) return "";
  
  const step = journeySteps.find(s => s.id === stepId);
  if (!step) return "";
  
  // Check if resource is in main step
  if (step.resources) {
    const mainStepIndex = step.resources.findIndex(r => r.componentName === resourceName);
    if (mainStepIndex !== -1) {
      return `${stepId}.0.${mainStepIndex + 1}`;
    }
  }
  
  // Check in substeps
  if (step.subSteps) {
    for (let i = 0; i < step.subSteps.length; i++) {
      const substep = step.subSteps[i];
      
      // Check if resource is in substep
      if (substep.resources) {
        const substepIndex = substep.resources.findIndex(r => r.componentName === resourceName);
        if (substepIndex !== -1) {
          return `${stepId}.${i + 1}.${substepIndex + 1}`;
        }
      }
      
      // Check in subsubsteps
      if (substep.subSubSteps) {
        for (let j = 0; j < substep.subSubSteps.length; j++) {
          const subsubstep = substep.subSubSteps[j];
          
          if (subsubstep.resources) {
            const subsubstepIndex = subsubstep.resources.findIndex(r => r.componentName === resourceName);
            if (subsubstepIndex !== -1) {
              return `${stepId}.${i + 1}.${j + 1}.${subsubstepIndex + 1}`;
            }
          }
        }
      }
    }
  }
  
  return "";
}

// Update: Define the resource sequence mapping with more detailed structure
type ResourceSequenceMap = Record<number, Record<string, string[]>>;

// Create a map of the logical sequence of resources across all steps and substeps
const resourceSequenceMap: ResourceSequenceMap = {
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

// Get a flat, sequenced array of resource component names for a step
// with their substep context preserved
export function getResourceSequence(stepId: number): { name: string; substepTitle: string }[] {
  const mapping = resourceSequenceMap[stepId];
  if (!mapping) return [];
  
  // Flatten the substep resources into a single ordered array
  // but keep track of which substep each resource belongs to
  const sequence: { name: string; substepTitle: string }[] = [];
  
  // Get all substeps for this step
  const step = journeySteps.find(s => s.id === stepId);
  if (!step?.subSteps) return [];
  
  // Process substeps in order
  step.subSteps.forEach(substep => {
    const substepTitle = substep.title;
    const substepResources = mapping[substepTitle];
    
    if (substepResources) {
      substepResources.forEach(resourceName => {
        sequence.push({ 
          name: resourceName, 
          substepTitle: substepTitle 
        });
      });
    }
  });
  
  return sequence;
}

// Get next and previous resources in the sequence with substep context
export function getSequentialResourceNavigation(
  stepId: number, 
  currentResourceName: string | null
): { 
  previousResource: Resource | null, 
  nextResource: Resource | null, 
  currentIndex: number, 
  totalResources: number 
} {
  if (!currentResourceName) {
    return { previousResource: null, nextResource: null, currentIndex: -1, totalResources: 0 };
  }
  
  // Get the ordered sequence for this step (with substep context)
  const sequence = getResourceSequence(stepId);
  const currentIndex = sequence.findIndex(item => item.name === currentResourceName);
  
  // If current resource not in sequence
  if (currentIndex === -1) {
    console.log(`Resource ${currentResourceName} not found in sequence for step ${stepId}`);
    return { previousResource: null, nextResource: null, currentIndex: -1, totalResources: sequence.length };
  }
  
  // Get the previous and next resource component names with their substep context
  const prevResourceInfo = currentIndex > 0 ? sequence[currentIndex - 1] : null;
  const nextResourceInfo = currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;
  
  // Find the actual resource objects
  const step = journeySteps.find(s => s.id === stepId);
  if (!step) {
    return { previousResource: null, nextResource: null, currentIndex, totalResources: sequence.length };
  }
  
  // Helper to find resource in step structure with substep context
  const findResourceInStep = (item: { name: string; substepTitle: string } | null): Resource | null => {
    if (!item) return null;
    
    const { name: componentName, substepTitle } = item;
    
    // Check substeps to find the one with the matching title
    if (step.subSteps) {
      const substep = step.subSteps.find(s => s.title === substepTitle);
      if (substep) {
        // Check resources directly in the substep
        if (substep.resources) {
          const resource = substep.resources.find(r => r.componentName === componentName);
          if (resource) {
            // Add substep title for context
            return { ...resource, subsubstepTitle: substepTitle };
          }
        }
        
        // Check in subsubsteps of this substep
        if (substep.subSubSteps) {
          for (const subsubstep of substep.subSubSteps) {
            if (subsubstep.resources) {
              const resource = subsubstep.resources.find(r => r.componentName === componentName);
              if (resource) {
                // Include both substep and subsubstep titles for context
                return { 
                  ...resource, 
                  subsubstepTitle: substepTitle 
                };
              }
            }
          }
        }
      }
    }
    
    // Check main step resources as fallback
    if (step.resources) {
      const mainResource = step.resources.find(r => r.componentName === componentName);
      if (mainResource) {
        // Include the found substep title for navigation
        return { ...mainResource, subsubstepTitle: substepTitle };
      }
    }
    
    // Create a minimal resource object when the actual resource is not found
    // but we know its name and substep context
    console.log(`Creating fallback resource for ${componentName} in ${substepTitle}`);
    return {
      id: `generated-${componentName}`,
      title: componentName, // Use component name as fallback title
      description: `Resource in ${substepTitle}`,
      componentName: componentName,
      type: 'interactive',
      subsubstepTitle: substepTitle
    };
  };
  
  const previousResource = findResourceInStep(prevResourceInfo);
  const nextResource = findResourceInStep(nextResourceInfo);
  
  return {
    previousResource,
    nextResource,
    currentIndex,
    totalResources: sequence.length
  };
}
