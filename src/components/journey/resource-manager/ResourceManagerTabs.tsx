
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Resource } from "@/types/journey";
import ResourceList from "./ResourceList";

interface ResourceManagerTabsProps {
  availableResources: Resource[];
  comingSoonResources: Resource[];
  stepId: number;
  substepTitle: string;
  selectedResourceName?: string | null;
  subsubstepTitle?: string | null;
}

export default function ResourceManagerTabs({
  availableResources,
  comingSoonResources,
  stepId,
  substepTitle,
  selectedResourceName,
  subsubstepTitle
}: ResourceManagerTabsProps) {
  return (
    <Tabs defaultValue="available" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="available">Disponibles</TabsTrigger>
        <TabsTrigger value="coming">À venir</TabsTrigger>
      </TabsList>

      <TabsContent value="available">
        <ResourceList
          resources={availableResources}
          stepId={stepId}
          substepTitle={substepTitle}
          selectedResourceName={selectedResourceName}
          subsubstepTitle={subsubstepTitle}
        />
      </TabsContent>

      <TabsContent value="coming">
        <ResourceList
          resources={comingSoonResources}
          stepId={stepId}
          substepTitle={substepTitle}
          subsubstepTitle={subsubstepTitle}
        />
      </TabsContent>
    </Tabs>
  );
}
