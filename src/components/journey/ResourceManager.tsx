
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourceList from "./resource-manager/ResourceList";
import { renderResourceComponent } from "./utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface ResourceManagerProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedResourceName?: string | null;
}

export default function ResourceManager({ 
  step, 
  selectedSubstepTitle,
  selectedResourceName
}: ResourceManagerProps) {
  // Get the resources to display
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', step.id, selectedSubstepTitle],
    queryFn: async () => {
      try {
        console.log(`Fetching resources for step ID: ${step.id}, substep: ${selectedSubstepTitle || 'main step'}`);
        
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("No authenticated session found when fetching resources");
          return step.resources || [];
        }
        
        // Fetch resources from Supabase
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id)
          .eq(selectedSubstepTitle ? 'substep_title' : 'resource_type', 
               selectedSubstepTitle || 'resource');
        
        if (error) {
          console.error("Error fetching resources:", error);
          return step.resources || [];
        }
        
        console.log(`Retrieved ${data?.length || 0} resources from Supabase for step ${step.id}`);
        
        if (data && data.length > 0) {
          // Map Supabase resources to our Resource type
          return data.map(item => ({
            title: item.title,
            description: item.description || '',
            componentName: item.component_name,
            status: 'available'
          }));
        }
        
        // If no resources found in Supabase, use the static ones from the step
        return selectedSubstepTitle 
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || [] 
          : step.resources || [];
      } catch (err) {
        console.error("Error in resource query:", err);
        // Fallback to static resources
        return selectedSubstepTitle 
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || [] 
          : step.resources || [];
      }
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
  
  // Si une ressource spécifique est sélectionnée
  if (selectedResourceName && selectedSubstepTitle) {
    // Find the selected resource
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingIndicator size="lg" />
      </div>
    );
  }
  
  // Get resources to show
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
