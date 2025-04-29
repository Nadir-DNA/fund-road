
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import ResourceManagerTabs from "./resource-manager/ResourceManagerTabs";
import ResourceManagerLoading from "./resource-manager/ResourceManagerLoading";
import ResourceManagerContent from "./resource-manager/ResourceManagerContent";

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

  // Get the resources to display
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', step.id, selectedSubstepTitle, selectedSubSubstepTitle, materials],
    queryFn: async () => {
      console.log(`Loading resources for step ID: ${step.id}, substep: ${selectedSubstepTitle || 'main step'}, subsubstep: ${selectedSubSubstepTitle || 'none'}`);

      if (materials && materials.length > 0) {
        console.log("Using materials from useCourseMaterials for resources");

        const filteredResources = materials.filter(item =>
          (item.resource_type === 'resource' ||
            item.resource_type === 'tool' ||
            item.resource_type === 'template') &&
          (
            (selectedSubSubstepTitle
              ? item.subsubstep_title === selectedSubSubstepTitle
              : selectedSubstepTitle
              ? item.substep_title === selectedSubstepTitle && (item.subsubstep_title === null || item.subsubstep_title === undefined || item.subsubstep_title === '')
              : item.substep_title === null)
          )
        ).map(item => ({
          title: item.title,
          description: item.description || '',
          componentName: item.component_name || '',
          url: item.file_url,
          status: 'available'
        }));

        console.log(`Found ${filteredResources.length} resources from materials`);

        if (filteredResources.length > 0) {
          return filteredResources;
        }
      }

      try {
        // Check if we already determined there's no session
        if (hasSession === false) {
          console.log("No authenticated session found when fetching resources (cached)");
          return getStepResources();
        }

        const { data: session } = await supabase.auth.getSession();

        if (!session?.session) {
          console.log("No authenticated session found when fetching resources");
          return getStepResources();
        }

        console.log("Building Supabase query for resources");
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id);

        if (selectedSubstepTitle) {
          query = query.eq('substep_title', selectedSubstepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        if (selectedSubSubstepTitle) {
          query = query.eq('subsubstep_title', selectedSubSubstepTitle);
        } else {
          query = query.or('subsubstep_title.is.null,subsubstep_title.eq.'); // Include null or empty string subsubstep
        }

        query = query.neq('resource_type', 'course');

        console.log("Executing Supabase query for resources");
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching resources:", error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger les ressources",
            variant: "destructive"
          });
          return getStepResources();
        }

        console.log(`Retrieved ${data?.length || 0} resources from Supabase for step ${step.id}`);

        if (data && data.length > 0) {
          return data.map(item => ({
            title: item.title,
            description: item.description || '',
            componentName: item.component_name,
            url: item.file_url,
            status: 'available'
          }));
        }

        return getStepResources();

      } catch (err) {
        console.error("Error in resource query:", err);
        return getStepResources();
      }
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    enabled: hasSession !== null && !isMaterialsLoading,
    retry: 1
  });

  // Helper function to get resources from step data
  const getStepResources = () => {
    return selectedSubstepTitle
      ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
      : step.resources || [];
  };

  // Handle selected resource display
  if (selectedResourceName && selectedSubstepTitle) {
    const selectedResource = resources?.find(r => r.componentName === selectedResourceName) ||
      step.resources?.find(r => r.componentName === selectedResourceName);

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
  if (hasSession === null || isLoading || isMaterialsLoading) {
    return <ResourceManagerLoading />;
  }

  const resourcesToShow = resources ||
    (selectedSubstepTitle
      ? step.subSteps?.find((substep: any) => substep.title === selectedSubstepTitle)?.resources
      : step.resources) || [];

  const availableResources = resourcesToShow.filter((r: any) => r.status !== 'coming-soon');
  const comingSoonResources = resourcesToShow.filter((r: any) => r.status === 'coming-soon');

  return (
    <div className="mt-4">
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
