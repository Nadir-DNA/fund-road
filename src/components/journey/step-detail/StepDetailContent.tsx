
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Step, SubStep } from "@/types/journey";
import ResourceManager from "../ResourceManager";
import OverviewTab from "./tabs/OverviewTab";
import { useStepTabs } from "@/hooks/useStepTabs";
import { useSearchParams } from "react-router-dom";

interface StepDetailContentProps {
  step: Step;
  selectedSubStep: SubStep | null;
  selectedSubSubStepTitle?: string | null;
  courseContent: string;
  isLoading: boolean;
}

export default function StepDetailContent({ 
  step, 
  selectedSubStep,
  selectedSubSubStepTitle,
  courseContent,
  isLoading 
}: StepDetailContentProps) {
  const [searchParams] = useSearchParams();
  const selectedResourceName = searchParams.get('resource');
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName);

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">Cours</TabsTrigger>
        <TabsTrigger value="resources" className="text-xs sm:text-sm">Ressources</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab 
          stepId={step.id}
          substepTitle={selectedSubStep?.title || null}
          stepTitle={step.title}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="resources" className="py-4">
        <ResourceManager 
          step={step} 
          selectedSubstepTitle={selectedSubStep?.title}
          selectedSubSubstepTitle={selectedSubSubStepTitle}
          selectedResourceName={selectedResourceName}
        />
      </TabsContent>
    </Tabs>
  );
}
