
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
export function getAllStepResources(stepId: number): Resource[] {
  const step = journeySteps.find(s => s.id === stepId);
  if (!step) return [];
  
  let allResources: Resource[] = [...(step.resources || [])];
  
  // Add resources from substeps
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
  
  return uniqueResources;
}

// Get resource index and total count
export function getResourceNavigationInfo(
  stepId: number, 
  currentResourceName: string | null
): { currentIndex: number, totalResources: number, allResources: Resource[] } {
  const allResources = getAllStepResources(stepId);
  const currentIndex = currentResourceName 
    ? allResources.findIndex(r => r.componentName === currentResourceName)
    : -1;
  
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
