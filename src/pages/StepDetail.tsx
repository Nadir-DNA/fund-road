
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Step, SubStep } from "@/types/journey";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { journeySteps } from "@/data/journeySteps";
import { renderResourceComponent } from "@/components/journey/utils/resourceRenderer";
import { isBrowser } from "@/utils/navigationUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function StepDetail() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam, resource: resourceName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(resourceName ? "resources" : "overview");
  
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;
  
  console.log("StepDetail - stepId:", stepId, "substepTitle:", substepTitle);
  console.log("step found:", step?.title);
  console.log("selectedSubStep found:", selectedSubStep?.title);
  
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
  
  // Navigation functions
  const navigateToNextStep = () => {
    if (!step) return;
    
    // If we have substeps and we're on one of them
    if (step.subSteps?.length && substepTitle) {
      const currentSubStepIndex = step.subSteps.findIndex(s => s.title === substepTitle);
      if (currentSubStepIndex < step.subSteps.length - 1) {
        // Go to next substep
        navigate(`/step/${stepId}/${encodeURIComponent(step.subSteps[currentSubStepIndex + 1].title)}`);
        return;
      }
    }
    
    // Go to next main step
    const nextStepIndex = journeySteps.findIndex(s => s.id === stepId) + 1;
    if (nextStepIndex < journeySteps.length) {
      navigate(`/step/${journeySteps[nextStepIndex].id}`);
    }
  };
  
  const navigateToPrevStep = () => {
    if (!step) return;
    
    // If we have substeps and we're on one of them
    if (step.subSteps?.length && substepTitle) {
      const currentSubStepIndex = step.subSteps.findIndex(s => s.title === substepTitle);
      if (currentSubStepIndex > 0) {
        // Go to previous substep
        navigate(`/step/${stepId}/${encodeURIComponent(step.subSteps[currentSubStepIndex - 1].title)}`);
        return;
      }
    }
    
    // Go to previous main step
    const prevStepIndex = journeySteps.findIndex(s => s.id === stepId) - 1;
    if (prevStepIndex >= 0) {
      // If the previous step has substeps, go to its last substep
      const prevStep = journeySteps[prevStepIndex];
      if (prevStep.subSteps?.length) {
        navigate(`/step/${prevStep.id}/${encodeURIComponent(prevStep.subSteps[prevStep.subSteps.length - 1].title)}`);
      } else {
        navigate(`/step/${prevStep.id}`);
      }
    } else {
      // Go back to roadmap if we're at the first step
      navigate('/roadmap');
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL if needed
    if (value === "resources" && !resourceName) {
      navigate(`/step/${stepId}${substepTitle ? `/${encodeURIComponent(substepTitle)}` : ''}${resourceName ? `/resource/${resourceName}` : ''}`);
    } else if (value === "overview" && resourceName) {
      navigate(`/step/${stepId}${substepTitle ? `/${encodeURIComponent(substepTitle)}` : ''}`);
    }
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
  
  if (!step) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto flex-grow flex items-center justify-center">
          <p>Étape non trouvée</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow p-4 md:p-8 pt-20 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/roadmap')}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour au parcours
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{step.title}</h1>
          <p className="text-muted-foreground mt-2">
            {selectedSubStep ? selectedSubStep.description : step.description}
          </p>
        </div>
        
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
        
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={navigateToPrevStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          
          <Button 
            onClick={navigateToNextStep}
          >
            Suivant <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
