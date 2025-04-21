
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourceList from "./resource-manager/ResourceList";
import { renderResourceComponent } from "./utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";

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
  // Use customized hook to get materials for step, substep, and now subsubstep
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
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session) {
          console.log("No authenticated session found when fetching resources");
          return selectedSubstepTitle
            ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
            : step.resources || [];
        }

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

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching resources:", error);
          return selectedSubstepTitle
            ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
            : step.resources || [];
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

        return selectedSubstepTitle
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
          : step.resources || [];

      } catch (err) {
        console.error("Error in resource query:", err);
        return selectedSubstepTitle
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || []
          : step.resources || [];
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !isMaterialsLoading
  });

  if (selectedResourceName && selectedSubstepTitle) {
    const selectedResource = resources?.find(r => r.componentName === selectedResourceName) ||
      step.resources?.find(r => r.componentName === selectedResourceName);

    if (selectedResource) {
      return (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{selectedResource.title}</h3>
          </div>
          <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
          {isBrowser() && renderResourceComponent(selectedResourceName, step.id, selectedSubstepTitle)}
        </div>
      );
    }
  }

  if (isLoading || isMaterialsLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  const resourcesToShow = resources ||
    (selectedSubstepTitle
      ? step.subSteps?.find((substep: any) => substep.title === selectedSubstepTitle)?.resources
      : step.resources) || [];

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Ressources disponibles</h3>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Disponibles</TabsTrigger>
          <TabsTrigger value="coming">À venir</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <ResourceList
            resources={resourcesToShow.filter((r: any) => r.status !== 'coming-soon')}
            stepId={step.id}
            substepTitle={selectedSubstepTitle || ""}
            selectedResourceName={selectedResourceName}
          />
        </TabsContent>

        <TabsContent value="coming">
          <ResourceList
            resources={resourcesToShow.filter((r: any) => r.status === 'coming-soon')}
            stepId={step.id}
            substepTitle={selectedSubstepTitle || ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
