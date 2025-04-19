
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourceList from "./resource-manager/ResourceList";
import { renderResourceComponent } from "./utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";

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
  // Si une ressource spécifique est sélectionnée
  if (selectedResourceName && selectedSubstepTitle) {
    const selectedResource = step.resources?.find(r => r.componentName === selectedResourceName);
    
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
  
  // Get resources to show
  const getResourcesToShow = () => {
    const selectedSubstep = step.subSteps?.find(
      (substep: any) => substep.title === selectedSubstepTitle
    );
    return selectedSubstep?.resources?.length ? selectedSubstep.resources : step.resources || [];
  };

  const resources = getResourcesToShow();

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
            resources={resources.filter(r => r.status !== 'coming-soon')}
            stepId={step.id}
            substepTitle={selectedSubstepTitle || ""}
            selectedResourceName={selectedResourceName}
          />
        </TabsContent>
        
        <TabsContent value="coming">
          <ResourceList 
            resources={resources.filter(r => r.status === 'coming-soon')}
            stepId={step.id}
            substepTitle={selectedSubstepTitle || ""}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
