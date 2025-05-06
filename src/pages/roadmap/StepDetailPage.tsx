
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
import { supabase } from "@/integrations/supabase/client";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedResource = searchParams.get('resource');
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  console.log("🔍 StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle,
    selectedResource
  });
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get course content
  const { materials, isLoading: courseMaterialsLoading } = useCourseMaterials(stepId, substepTitle);
  
  // Manual fetch for debugging
  const [manualFetchData, setManualFetchData] = useState<any[]>([]);
  const [manualFetchError, setManualFetchError] = useState<string | null>(null);
  
  // Use our custom hook to manage tabs
  const { activeTab, handleTabChange } = useStepTabs(selectedResource);

  // Manual fetch to debug data loading
  useEffect(() => {
    const fetchManually = async () => {
      try {
        console.log("🔍 Manual Fetch Starting...", stepId, substepTitle);
        
        let qb = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
          
        // Filter by substep_title
        if (substepTitle) {
          qb = qb.eq('substep_title', substepTitle);
          console.log("⚙️ Query: entrepreneur_resources where step_id=" + stepId + " and substep_title=" + substepTitle);
        } else {
          qb = qb.is('substep_title', null);
          console.log("⚙️ Query: entrepreneur_resources where step_id=" + stepId + " and substep_title IS NULL");
        }
        
        const { data, error } = await qb;
        
        console.log("✅ Returned:", data);
        
        if (error) {
          console.error("✗ Error:", error);
          setManualFetchError(error.message);
        } else {
          setManualFetchData(data || []);
        }
      } catch (err) {
        console.error("Manual fetch error:", err);
        setManualFetchError(String(err));
      }
    };
    
    fetchManually();
  }, [stepId, substepTitle]);

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
      
      {/* Debug section */}
      {(materials?.length === 0 || manualFetchData.length === 0) && (
        <div className="mt-8 p-4 border border-slate-700 rounded-md bg-slate-900">
          <h3 className="text-lg font-medium mb-2">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-1">Materials from Hook:</h4>
              <pre className="text-xs overflow-auto p-2 bg-slate-800 rounded h-40">
                {JSON.stringify(materials || [], null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-md font-medium mb-1">Manual Fetch Results:</h4>
              {manualFetchError ? (
                <p className="text-red-500">{manualFetchError}</p>
              ) : (
                <pre className="text-xs overflow-auto p-2 bg-slate-800 rounded h-40">
                  {JSON.stringify(manualFetchData, null, 2)}
                </pre>
              )}
            </div>
            <div className="md:col-span-2">
              <h4 className="text-md font-medium mb-1">Query Parameters:</h4>
              <pre className="text-xs overflow-auto p-2 bg-slate-800 rounded">
                {JSON.stringify({
                  stepId,
                  substepTitle,
                  activeTab,
                  selectedResource,
                  path: window.location.pathname
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
