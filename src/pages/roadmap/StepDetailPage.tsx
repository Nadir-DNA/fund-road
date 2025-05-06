
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ResourcesList from "@/components/journey/ResourcesList";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { supabase } from "@/integrations/supabase/client";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [manualResources, setManualResources] = useState<any[]>([]);
  const [manualLoading, setManualLoading] = useState<boolean>(true);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get course content
  const { materials, isLoading: courseMaterialsLoading } = useCourseMaterials(stepId, substepTitle);

  console.log("🔍 StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle,
    activeTab,
    foundMaterials: materials?.length || 0
  });

  // Manual fetch for debugging
  useEffect(() => {
    const fetchResourcesManually = async () => {
      setManualLoading(true);
      console.log("🔍 Manual Fetch Starting...", stepId, substepTitle);
      
      try {
        let qb = supabase
          .from("entrepreneur_resources")
          .select("*")
          .eq("step_id", stepId);
          
        if (substepTitle) {
          qb = qb.eq("substep_title", substepTitle);
          console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title=${substepTitle}`);
        } else {
          qb = qb.is("substep_title", null);
          console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title IS NULL`);
        }
        
        // Execute query
        const { data, error } = await qb;
        
        if (error) {
          console.error("❌ Error:", error);
          setDiagnosticInfo({
            type: "error",
            message: error.message,
            details: error
          });
        } else {
          console.log("✅ Returned:", data);
          setManualResources(data || []);
          setDiagnosticInfo({
            type: "success",
            count: data?.length || 0,
            data: data
          });
        }
      } catch (err) {
        console.error("❌ Exception:", err);
        setDiagnosticInfo({
          type: "exception",
          message: err instanceof Error ? err.message : "Unknown error",
          error: err
        });
      } finally {
        setManualLoading(false);
      }
    };
    
    fetchResourcesManually();
  }, [stepId, substepTitle]);

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
      
      {/* Diagnostic Information */}
      {diagnosticInfo && (
        <div className={`mb-4 p-4 rounded-md ${diagnosticInfo.type === 'success' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <h3 className="font-medium mb-2">Diagnostic Information</h3>
          <pre className="text-xs overflow-auto max-h-40 p-2 bg-slate-900/50 rounded">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      )}
      
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
          
          {/* Manual resources display for debugging */}
          <div className="mt-8 border-t pt-4">
            <h3 className="font-medium mb-2">Ressources (Manual Fetch)</h3>
            {manualLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingIndicator size="sm" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement manuel...</span>
              </div>
            ) : manualResources.length > 0 ? (
              <div className="space-y-2">
                {manualResources.map((resource, idx) => (
                  <div key={idx} className="p-3 bg-slate-700/30 rounded">
                    <h4 className="font-medium">{resource.title || 'Sans titre'}</h4>
                    <p className="text-sm text-muted-foreground">{resource.description || 'Pas de description'}</p>
                    <div className="text-xs mt-1 text-muted-foreground">
                      Type: {resource.resource_type || 'N/A'}, 
                      Component: {resource.component_name || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Aucune ressource trouvée manuellement. Vérifiez les logs.
                </p>
                <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-auto">
                  {`SELECT * FROM entrepreneur_resources 
WHERE step_id = ${stepId} 
${substepTitle ? `AND substep_title = '${substepTitle}'` : 'AND substep_title IS NULL'}`}
                </pre>
              </div>
            )}
          </div>
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
