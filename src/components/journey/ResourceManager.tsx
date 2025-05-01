
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import ResourceManagerTabs from "./resource-manager/ResourceManagerTabs";
import ResourceManagerLoading from "./resource-manager/ResourceManagerLoading";
import ResourceManagerContent from "./resource-manager/ResourceManagerContent";
import { ResourceFilters, getStepResources } from "./resource-manager/ResourceFilters";

interface ResourceManagerProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedSubSubstepTitle?: string | null | undefined;
  selectedResourceName?: string | null;
}

export default function ResourceManager({
  step,
  selectedSubstepTitle,
  selectedSubSubstepTitle,
  selectedResourceName
}: ResourceManagerProps) {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  
  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setHasSession(!!data.session);
      } catch (err) {
        console.error("Error checking session:", err);
        setHasSession(false);
      }
    };
    
    checkSession();
  }, []);

  // Use customized hook to get materials for step, substep, and subsubstep
  const { materials, isLoading: isMaterialsLoading } = useCourseMaterials(
    step.id,
    selectedSubstepTitle || null,
    selectedSubSubstepTitle
  );

  console.log("ResourceManager - materials:", materials);
  console.log("ResourceManager - step.resources:", step.resources);
  
  // In case we have no resources yet, use those from step data directly
  useEffect(() => {
    if (resources.length === 0 && step.resources) {
      if (selectedSubstepTitle && step.subSteps) {
        const subStep = step.subSteps.find((sub: any) => sub.title === selectedSubstepTitle);
        if (subStep && subStep.resources) {
          console.log("Using resources from substep directly:", subStep.resources);
          setResources(subStep.resources);
        }
      } else if (step.resources) {
        console.log("Using resources from step directly:", step.resources);
        setResources(step.resources);
      }
    }
  }, [step, selectedSubstepTitle, resources.length]);

  // Handle resources found by ResourceFilters
  const handleResourcesFound = (foundResources: Resource[]) => {
    console.log("Resources found:", foundResources);
    if (foundResources.length > 0) {
      setResources(foundResources);
    }
  };

  // Handle selected resource display
  if (selectedResourceName && selectedSubstepTitle) {
    console.log("Looking for resource:", selectedResourceName);
    console.log("Current resources:", resources);
    
    const selectedResource = resources?.find(r => r.componentName === selectedResourceName) ||
      step.resources?.find((r: Resource) => r.componentName === selectedResourceName);

    if (selectedResource) {
      console.log("Selected resource found:", selectedResource);
      return (
        <ResourceManagerContent 
          selectedResource={selectedResource}
          stepId={step.id}
          selectedSubstepTitle={selectedSubstepTitle}
          selectedResourceName={selectedResourceName}
        />
      );
    } else {
      console.log("Selected resource not found in resources array");
    }
  }

  // Show loading indicator
  if (hasSession === null || isMaterialsLoading) {
    return <ResourceManagerLoading />;
  }

  // Filter resources for display
  const availableResources = resources.filter((r: any) => r.status !== 'coming-soon');
  const comingSoonResources = resources.filter((r: any) => r.status === 'coming-soon');

  console.log("Filtered resources - available:", availableResources.length, "coming soon:", comingSoonResources.length);

  return (
    <div className="mt-4">
      <ResourceFilters
        step={step}
        selectedSubstepTitle={selectedSubstepTitle}
        selectedSubSubstepTitle={selectedSubSubstepTitle}
        materials={materials}
        hasSession={hasSession}
        onResourcesFound={handleResourcesFound}
      />
      <h3 className="text-lg font-medium mb-4">Ressources disponibles</h3>
      {resources.length === 0 ? (
        <div className="p-6 text-center border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Aucune ressource disponible pour cette section.</p>
        </div>
      ) : (
        <ResourceManagerTabs 
          availableResources={availableResources}
          comingSoonResources={comingSoonResources}
          stepId={step.id}
          substepTitle={selectedSubstepTitle || ""}
          selectedResourceName={selectedResourceName}
          subsubstepTitle={selectedSubSubstepTitle}
        />
      )}
    </div>
  );
}
