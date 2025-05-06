
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { useStepTabs } from "@/hooks/useStepTabs";
import OverviewTab from "@/components/journey/step-detail/OverviewTab";
import ResourcesTab from "@/components/journey/step-detail/ResourcesTab";
import StepNavigation from "@/components/journey/step-detail/StepNavigation";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedResource = searchParams.get('resource');
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get course content
  const { materials, isLoading: courseMaterialsLoading } = useCourseMaterials(stepId, substepTitle);
  
  // Use our custom hook to manage tabs
  const { activeTab, handleTabChange } = useStepTabs(selectedResource);

  console.log("🔍 StepDetailPage - Loading with:", { 
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
      <div className="bg-slate-800 rounded-lg p-6">
        <p>Étape non trouvée</p>
      </div>
    );
  }

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
          <OverviewTab 
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={step.title}
            isLoading={courseMaterialsLoading}
            materials={materials}
          />
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <ResourcesTab
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={step.title}
          />
        </TabsContent>
      </Tabs>
      
      <StepNavigation stepId={stepId} />
    </div>
  );
}
