
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourcesList from "@/components/journey/ResourcesList";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get course content
  const { materials, isLoading: courseMaterialsLoading } = useCourseMaterials(stepId, substepTitle);

  console.log("StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle,
    activeTab,
    foundMaterials: materials?.length || 0
  });

  useEffect(() => {
    // Check if we should show resources tab by default based on URL or localStorage
    const showResources = localStorage.getItem('showResources') === 'true';
    
    if (showResources) {
      // Clear the localStorage flag
      localStorage.removeItem('showResources');
      setActiveTab("resources");
    }
  }, []);

  if (!step) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-gray-100">
        <Navbar />
        <div className="container mx-auto flex-grow flex items-center justify-center">
          <p>Étape non trouvée</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
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
          ) : materials && materials.length > 0 && materials[0].course_content ? (
            <CourseContentDisplay
              stepId={stepId}
              substepTitle={substepTitle}
              stepTitle={step.title}
              courseContent={materials[0].course_content}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Aucun contenu de cours disponible pour cette étape.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <ResourcesList 
            stepId={stepId} 
            substepTitle={substepTitle}
            stepTitle={step.title}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-between">
        {stepId > 1 && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/roadmap/step/${stepId - 1}`)}
          >
            Étape précédente
          </Button>
        )}
        
        {stepId < journeySteps.length && (
          <Button
            onClick={() => navigate(`/roadmap/step/${stepId + 1}`)}
            className="ml-auto"
          >
            Étape suivante
          </Button>
        )}
      </div>
    </div>
  );
}
