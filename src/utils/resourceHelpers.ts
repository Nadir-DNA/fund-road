
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
