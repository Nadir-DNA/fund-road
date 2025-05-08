
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Step, SubStep, Resource } from "@/types/journey";
import { useStepTabs } from "@/hooks/useStepTabs";
import { useSearchParams } from "react-router-dom";
import OverviewTab from "./tabs/OverviewTab";
import ResourcesTab from "./tabs/ResourcesTab";

interface StepContentProps {
  step: Step;
  selectedSubStep: SubStep | null;
  stepId: number;
  substepTitle: string | null;
  resourceName?: string | null;
  isLoading?: boolean;
  isViewingResource?: boolean; // Add this prop
}

export default function StepContent({ 
  step, 
  selectedSubStep,
  stepId,
  substepTitle,
  resourceName,
  isLoading = false,
  isViewingResource = false, // Set default to false
}: StepContentProps) {
  const [searchParams] = useSearchParams();
  const selectedResourceName = searchParams.get('resource');
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName || resourceName);

  // Double check if we're viewing a resource - both from props and URL params
  const definitelyViewingResource = isViewingResource || Boolean(selectedResourceName || resourceName);

  console.log("StepContent - Resource view state:", {
    isViewingResource,
    selectedResourceName,
    resourceName,
    definitelyViewingResource
  });

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">Cours</TabsTrigger>
        <TabsTrigger value="resources" className="text-xs sm:text-sm">Ressources</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <div className="bg-slate-800 p-4 rounded-lg">
          <OverviewTab 
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={step.title}
            isLoading={isLoading}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="resources" className="py-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <ResourcesTab 
            step={step} 
            stepId={stepId}
            substepTitle={substepTitle}
            selectedResourceName={resourceName || selectedResourceName}
            isViewingResource={definitelyViewingResource} // Pass the definite flag
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
