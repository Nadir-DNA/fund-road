
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Step, SubStep } from "@/types/journey";
import ResourceManager from "../ResourceManager";
import OverviewTab from "../OverviewTab";
import { useStepTabs } from "@/hooks/useStepTabs";
import { useSearchParams } from "react-router-dom";

interface StepContentProps {
  step: Step;
  selectedSubStep: SubStep | null;
  selectedSubSubStepTitle?: string | null;
  resourceName?: string | null;
  courseContent?: string | null;
  isLoading?: boolean;
  stepId: number;
  substepTitle: string | null;
}

export default function StepContent({ 
  step, 
  selectedSubStep,
  selectedSubSubStepTitle,
  resourceName,
  courseContent,
  isLoading = false,
  stepId,
  substepTitle
}: StepContentProps) {
  const [searchParams] = useSearchParams();
  const tabFromParams = searchParams.get('tab');
  const selectedResourceName = searchParams.get('resource');
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName || tabFromParams);

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">Cours</TabsTrigger>
        <TabsTrigger value="resources" className="text-xs sm:text-sm">Ressources</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab 
          step={step} 
          selectedSubStep={selectedSubStep} 
          isLoading={isLoading}
          courseContent={courseContent || ""}
        />
      </TabsContent>
      
      <TabsContent value="resources" className="py-4">
        <ResourceManager 
          step={step} 
          selectedSubstepTitle={selectedSubStep?.title}
          selectedSubSubstepTitle={selectedSubSubStepTitle}
          selectedResourceName={resourceName}
        />
      </TabsContent>
    </Tabs>
  );
}
