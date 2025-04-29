
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";

interface ResourceFiltersProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedSubSubstepTitle?: string | null | undefined;
  materials: any[] | undefined;
  hasSession: boolean | null;
  onResourcesFound: (resources: Resource[]) => void;
}

export function ResourceFilters({
  step,
  selectedSubstepTitle,
  selectedSubSubstepTitle,
  materials,
  hasSession,
  onResourcesFound
}: ResourceFiltersProps) {
  // Get the resources to display
  useQuery({
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
          status: 'available' as const // Use const assertion to match the literal type
        }));

        console.log(`Found ${filteredResources.length} resources from materials`);

        if (filteredResources.length > 0) {
          onResourcesFound(filteredResources);
          return filteredResources;
        }
      }

      try {
        // Check if we already determined there's no session
        if (hasSession === false) {
          console.log("No authenticated session found when fetching resources (cached)");
          const stepResources = getStepResources(step, selectedSubstepTitle);
          onResourcesFound(stepResources);
          return stepResources;
        }

        const { data: session } = await supabase.auth.getSession();

        if (!session?.session) {
          console.log("No authenticated session found when fetching resources");
          const stepResources = getStepResources(step, selectedSubstepTitle);
          onResourcesFound(stepResources);
          return stepResources;
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
          const stepResources = getStepResources(step, selectedSubstepTitle);
          onResourcesFound(stepResources);
          return stepResources;
        }

        console.log(`Retrieved ${data?.length || 0} resources from Supabase for step ${step.id}`);

        if (data && data.length > 0) {
          const mappedResources = data.map(item => ({
            title: item.title,
            description: item.description || '',
            componentName: item.component_name,
            url: item.file_url,
            status: 'available' as const // Use const assertion to match the literal type
          }));
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        const stepResources = getStepResources(step, selectedSubstepTitle);
        onResourcesFound(stepResources);
        return stepResources;

      } catch (err) {
        console.error("Error in resource query:", err);
        const stepResources = getStepResources(step, selectedSubstepTitle);
        onResourcesFound(stepResources);
        return stepResources;
      }
    },
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    enabled: hasSession !== null && materials !== undefined,
    retry: 1
  });

  return null; // This component doesn't render anything
}

// Helper function to get resources from step data
function getStepResources(step: any, selectedSubstepTitle: string | undefined): Resource[] {
  // Get resources from subStep or step directly
  const resources = selectedSubstepTitle
    ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
    : step.resources || [];
  
  // The resources from step data should already have the correct status type,
  // but we'll ensure type safety by returning them as is
  return resources;
}
