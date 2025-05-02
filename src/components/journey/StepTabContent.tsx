
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourcesList from "@/components/journey/ResourcesList";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import OverviewTab from "./OverviewTab";
import { Step, SubStep } from "@/types/journey";
import { useSearchParams } from "react-router-dom";
import { useStepTabs } from "@/hooks/useStepTabs";

interface StepTabContentProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  materials: any[];
  courseMaterialsLoading: boolean;
  courseError: string | null;
  showResourcesTab?: boolean;
}

export default function StepTabContent({ 
  stepId, 
  substepTitle, 
  stepTitle,
  materials, 
  courseMaterialsLoading, 
  courseError,
  showResourcesTab = false
}: StepTabContentProps) {
  // Use our hook to manage tab state
  const [searchParams] = useSearchParams();
  const selectedResource = searchParams.get('resource');
  const { activeTab, handleTabChange } = useStepTabs(showResourcesTab ? "resources" : null);
  
  // Determine if we have course content
  const hasCourseContent = materials && materials.length > 0 && materials[0].course_content;
  const courseContent = hasCourseContent ? materials[0].course_content : "";
  
  // Create a mock step object for the OverviewTab
  const mockStep: Step = {
    id: stepId,
    title: stepTitle,
    description: "",
    resources: []
  };
  
  // Create a mock subStep for the OverviewTab
  const mockSubStep: SubStep | null = substepTitle ? {
    title: substepTitle,
    description: ""
  } : null;

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList>
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="resources">Ressources</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        {courseMaterialsLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingIndicator size="lg" />
          </div>
        ) : courseError ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{courseError}</p>
          </div>
        ) : (
          <OverviewTab
            step={mockStep}
            selectedSubStep={mockSubStep}
            isLoading={false}
            courseContent={courseContent}
          />
        )}
      </TabsContent>
      
      <TabsContent value="resources" className="mt-6">
        <ResourcesList 
          stepId={stepId} 
          substepTitle={substepTitle}
          stepTitle={stepTitle}
        />
      </TabsContent>
    </Tabs>
  );
}
