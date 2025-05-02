
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourcesList from "@/components/journey/ResourcesList";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

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
  const [activeTab, setActiveTab] = useState(showResourcesTab ? "resources" : "overview");

  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
  };

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
        ) : materials && materials.length > 0 && materials[0].course_content ? (
          <CourseContentDisplay
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={stepTitle}
            courseContent={materials[0].course_content}
          />
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Aucun contenu de cours disponible pour cette étape.</p>
            <pre className="mt-4 text-sm text-left p-4 bg-gray-50 rounded overflow-auto">
              Debug: {JSON.stringify({ stepId, substepTitle, materialsCount: materials?.length }, null, 2)}
            </pre>
          </div>
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
