
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourceList from "./resource-manager/ResourceList";
import { renderResourceComponent } from "./utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useCourseMaterials } from "@/hooks/useCourseMaterials";

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
  // Utiliser notre hook personnalisé pour récupérer les matériaux
  const { materials, isLoading: isMaterialsLoading } = useCourseMaterials(
    step.id,
    selectedSubstepTitle || null
  );
  
  // Get the resources to display
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', step.id, selectedSubstepTitle, materials],
    queryFn: async () => {
      console.log(`Loading resources for step ID: ${step.id}, substep: ${selectedSubstepTitle || 'main step'}`);
      
      // Si nous avons déjà récupéré les matériaux, filtrer ceux de type "resource"
      if (materials && materials.length > 0) {
        console.log("Using materials from useCourseMaterials for resources");
        
        const filteredResources = materials.filter(item => 
          item.resource_type === 'resource' || 
          item.resource_type === 'tool' || 
          item.resource_type === 'template'
        ).map(item => ({
          title: item.title,
          description: item.description || '',
          componentName: item.component_name,
          url: item.file_url,
          status: 'available'
        }));
        
        console.log(`Found ${filteredResources.length} resources from materials`);
        
        if (filteredResources.length > 0) {
          return filteredResources;
        }
      }
      
      // Fallback au comportement précédent si nécessaire
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("No authenticated session found when fetching resources");
          return selectedSubstepTitle 
            ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || [] 
            : step.resources || [];
        }
        
        // Requête à Supabase pour récupérer les ressources
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id);
          
        if (selectedSubstepTitle) {
          query = query.eq('substep_title', selectedSubstepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        // Filtrer pour les ressources (pas les cours)
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
          // Mappage des ressources Supabase à notre format
          return data.map(item => ({
            title: item.title,
            description: item.description || '',
            componentName: item.component_name,
            url: item.file_url,
            status: 'available'
          }));
        }
        
        // Fallback aux ressources statiques si rien n'est trouvé dans Supabase
        return selectedSubstepTitle 
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || [] 
          : step.resources || [];
          
      } catch (err) {
        console.error("Error in resource query:", err);
        // Fallback aux ressources statiques
        return selectedSubstepTitle 
          ? step.subSteps?.find((s: any) => s.title === selectedSubstepTitle)?.resources || [] 
          : step.resources || [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !isMaterialsLoading // Attendre que les matériaux soient chargés
  });
  
  // Si une ressource spécifique est sélectionnée
  if (selectedResourceName && selectedSubstepTitle) {
    // Trouver la ressource sélectionnée
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
