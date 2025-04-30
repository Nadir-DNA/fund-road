
import { Resource } from "@/types/journey";

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
