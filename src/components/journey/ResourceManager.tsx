
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import ResourceManagerTabs from "./resource-manager/ResourceManagerTabs";
import ResourceManagerLoading from "./resource-manager/ResourceManagerLoading";
import ResourceManagerContent from "./resource-manager/ResourceManagerContent";
import { ResourceFilters } from "./resource-manager/ResourceFilters";

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

  // Handle resources found by ResourceFilters
  const handleResourcesFound = (foundResources: Resource[]) => {
    setResources(foundResources);
  };

  // Handle selected resource display
  if (selectedResourceName && selectedSubstepTitle) {
    const selectedResource = resources?.find(r => r.componentName === selectedResourceName) ||
      step.resources?.find((r: Resource) => r.componentName === selectedResourceName);

    if (selectedResource) {
      return (
        <ResourceManagerContent 
          selectedResource={selectedResource}
          stepId={step.id}
          selectedSubstepTitle={selectedSubstepTitle}
          selectedResourceName={selectedResourceName}
        />
      );
    }
  }

  // Show loading indicator
  if (hasSession === null || isMaterialsLoading) {
    return <ResourceManagerLoading />;
  }

  // Filter resources for display
  const availableResources = resources.filter((r: any) => r.status !== 'coming-soon');
  const comingSoonResources = resources.filter((r: any) => r.status === 'coming-soon');

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
      <ResourceManagerTabs 
        availableResources={availableResources}
        comingSoonResources={comingSoonResources}
        stepId={step.id}
        substepTitle={selectedSubstepTitle || ""}
        selectedResourceName={selectedResourceName}
        subsubstepTitle={selectedSubSubstepTitle}
      />
    </div>
  );
}
