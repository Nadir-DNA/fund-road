
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { useStepTabs } from "@/hooks/useStepTabs";
import OverviewTab from "@/components/journey/step-detail/OverviewTab";
import ResourcesTab from "@/components/journey/step-detail/ResourcesTab";
import StepNavigation from "@/components/journey/StepNavigation";
import { supabase } from "@/integrations/supabase/client";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const selectedResource = searchParams.get('resource');
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Generate a unique component key based on stepId to force remount when step changes
  const componentKey = `step-${stepId}-${Date.now()}`;
  
  console.log("🔍 StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle,
    selectedResource,
    componentKey
  });
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get course content
  const { materials, isLoading: courseMaterialsLoading } = useCourseMaterials(stepId, substepTitle);
  
  // Use our custom hook to manage tabs
  const { activeTab, handleTabChange } = useStepTabs(selectedResource);
  
  // Effect to clear the resource parameter when the component mounts with a new step
  useEffect(() => {
    // If there's a resource parameter and we've just navigated to a new step,
    // clear it to avoid displaying a resource from a previous step
    if (selectedResource && location.state && (location.state as any).resetResource) {
      console.log("Clearing resource parameter after step navigation");
      navigate(location.pathname, { replace: true });
    }
  }, [stepId, selectedResource, navigate, location]);

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
          {/* Use key to force remount when stepId changes */}
          <ResourcesTab
            key={componentKey}
            stepId={stepId}
            substepTitle={substepTitle}
            stepTitle={step.title}
          />
        </TabsContent>
      </Tabs>
      
      <StepNavigation stepId={stepId} />
      
      {/* Debug section - remove in production */}
      <div className="mt-8 p-4 border border-slate-700 rounded-md bg-slate-900">
        <h3 className="text-lg font-medium mb-2">Debug Information</h3>
        <pre className="text-xs overflow-auto p-2 bg-slate-800 rounded">
          {JSON.stringify({
            stepId,
            substepTitle,
            selectedResource,
            activeTab,
            componentKey,
            path: window.location.pathname,
            search: window.location.search,
            state: location.state ? JSON.stringify(location.state) : 'null'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
