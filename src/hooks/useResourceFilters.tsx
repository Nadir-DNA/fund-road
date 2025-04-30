
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import { toast } from "@/components/ui/use-toast";

export const useResourceFilters = (
  step: any,
  selectedSubstepTitle: string | undefined,
  selectedSubSubstepTitle: string | null | undefined,
  materials: any[] | undefined,
  hasSession: boolean | null,
  onResourcesFound: (resources: Resource[]) => void
) => {
  // Query to fetch resources
  return useQuery({
    queryKey: ['resources', step.id, selectedSubstepTitle, selectedSubSubstepTitle, materials?.length],
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
          id: item.id || `material-${Math.random().toString(36).substring(7)}`,
          title: item.title,
          description: item.description || '',
          componentName: item.component_name || '',
          url: item.file_url,
          type: item.resource_type || 'resource',
          status: 'available' as const
        }));

        console.log(`Found ${filteredResources.length} resources from materials`, filteredResources);

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
          console.log("Using step resources:", stepResources);
          onResourcesFound(stepResources);
          return stepResources;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
          console.log("No authenticated session found when fetching resources");
          const stepResources = getStepResources(step, selectedSubstepTitle);
          console.log("Using step resources:", stepResources);
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
          toast({
            title: "Erreur de chargement",
            description: "Impossible de récupérer les ressources",
            variant: "destructive"
          });
          const stepResources = getStepResources(step, selectedSubstepTitle);
          onResourcesFound(stepResources);
          return stepResources;
        }

        console.log(`Retrieved ${data?.length || 0} resources from Supabase for step ${step.id}`, data);

        if (data && data.length > 0) {
          const mappedResources = data.map(item => ({
            id: item.id || `db-${Math.random().toString(36).substring(7)}`,
            title: item.title,
            description: item.description || '',
            componentName: item.component_name,
            url: item.file_url,
            type: item.resource_type || 'resource',
            status: 'available' as const
          }));
          console.log("Mapped resources:", mappedResources);
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        const stepResources = getStepResources(step, selectedSubstepTitle);
        console.log("No resources from DB, using step resources:", stepResources);
        onResourcesFound(stepResources);
        return stepResources;

      } catch (err) {
        console.error("Error in resource query:", err);
        toast({
          title: "Erreur de chargement",
          description: "Problème lors de la récupération des ressources",
          variant: "destructive"
        });
        const stepResources = getStepResources(step, selectedSubstepTitle);
        onResourcesFound(stepResources);
        return stepResources;
      }
    },
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
    enabled: hasSession !== null && materials !== undefined,
    retry: 1
  });
};
