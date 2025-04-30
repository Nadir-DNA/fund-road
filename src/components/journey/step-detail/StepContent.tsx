
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { isBrowser } from "@/utils/navigationUtils";
import { renderResourceComponent } from "@/components/journey/utils/resourceRenderer";
import { toast } from "@/components/ui/use-toast";
import { Step, SubStep } from "@/types/journey";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";

interface StepContentProps {
  step: Step;
  selectedSubStep: SubStep | null;
  stepId: number;
  substepTitle: string | null;
  resourceName?: string | null;
}

export default function StepContent({
  step,
  selectedSubStep,
  stepId,
  substepTitle,
  resourceName
}: StepContentProps) {
  const [activeTab, setActiveTab] = useState(resourceName ? "resources" : "overview");
  
  const { materials, isLoading: isLoadingMaterials } = useCourseMaterials(
    stepId,
    substepTitle
  );
  
  console.log("Materials loaded:", materials?.length);
  
  // Find course content
  const courseMaterial = materials?.find(material => 
    material.resource_type === 'course' && 
    (substepTitle 
      ? material.substep_title === substepTitle
      : material.substep_title === null)
  );
  
  console.log("Course material found:", courseMaterial?.title);
  
  const courseContent = courseMaterial?.course_content || "";
  console.log("Course content length:", courseContent.length);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Display toast notification if no course content found but not during loading
  useEffect(() => {
    if (!isLoadingMaterials && materials?.length && !courseContent) {
      toast({
        title: "Contenu non disponible",
        description: "Le contenu du cours pour cette section n'a pas été trouvé.",
        variant: "default"
      });
    }
  }, [isLoadingMaterials, materials, courseContent]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="overview">Cours</TabsTrigger>
        <TabsTrigger value="resources">Ressources</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {isLoadingMaterials ? (
          <div className="w-full flex justify-center py-12">
            <LoadingIndicator size="lg" />
          </div>
        ) : courseContent ? (
          <Card className="p-6">
            <CourseContentDisplay 
              stepId={stepId}
              substepTitle={substepTitle}
              stepTitle={step.title}
              courseContent={courseContent}
            />
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Aucun contenu de cours disponible pour cette étape.
            </p>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="resources">
        <Card className="p-6">
          {isBrowser() && renderResourceComponent(resourceName || '', stepId, substepTitle || '')}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
