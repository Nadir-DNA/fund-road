
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Step, SubStep } from "@/types/journey";
import { useStepTabs } from "@/hooks/useStepTabs";
import { useSearchParams } from "react-router-dom";
import OverviewTab from "./tabs/OverviewTab";
import ResourcesTab from "./tabs/ResourcesTab";

interface StepContentProps {
  step: Step;
  selectedSubStep: SubStep | null;
  stepId: number;
  substepTitle: string | null;
  resourceName: string | null;
  isLoading?: boolean;
  isViewingResource: boolean;
}

export default function StepContent({ 
  step, 
  selectedSubStep,
  stepId,
  substepTitle,
  resourceName,
  isLoading = false,
  isViewingResource,
}: StepContentProps) {
  const [searchParams] = useSearchParams();
  const selectedResourceName = resourceName || searchParams.get('resource');
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName);

  console.log("StepContent - Resource view state:", {
    stepId,
    substepTitle,
    resourceName: selectedResourceName,
    isViewingResource,
    activeTab
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
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={step.title}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
