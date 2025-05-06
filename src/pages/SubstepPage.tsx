
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { renderResourceComponent } from "@/components/journey/utils/resourceRenderer";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function SubstepPage() {
  const { stepId, substepTitle } = useParams();
  const decodedSubstepTitle = substepTitle ? decodeURIComponent(substepTitle) : "";
  const stepIdNumber = Number(stepId || 0);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Log parameters for debugging
  console.log("SubstepPage - Parameters:", { stepId, substepTitle: decodedSubstepTitle });
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      if (!stepId || !substepTitle) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for step ${stepId}, substep: ${decodedSubstepTitle}`);
        
        const { data, error } = await supabase
          .from("entrepreneur_resources")
          .select("*")
          .eq("step_id", stepIdNumber)
          .eq("substep_title", decodedSubstepTitle);
        
        if (error) {
          console.error("Error fetching resources:", error);
          setError("Erreur lors du chargement des ressources");
          return;
        }
        
        console.log("Resources fetched:", data);
        
        // Filter resources by type
        if (data) {
          setCourses(data.filter(r => r.resource_type === "course"));
          setResources(data.filter(r => r.resource_type !== "course"));
        }
      } catch (err) {
        console.error("Exception during fetch:", err);
        setError("Une erreur inattendue s'est produite");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [stepId, substepTitle, decodedSubstepTitle, stepIdNumber]);
  
  // Handle fallback if no resources found
  useEffect(() => {
    if (!isLoading && resources.length === 0 && stepIdNumber === 1 && 
        decodedSubstepTitle === "Définition de l'opportunité") {
      console.log("No resources found, adding hardcoded fallbacks for step 1");
      setResources([
        {
          id: 'opportunity-definition',
          title: 'Synthèse qualitative',
          description: 'Définissez votre opportunité entrepreneuriale',
          component_name: 'OpportunityDefinition',
          resource_type: 'interactive'
        },
        {
          id: 'market-size-estimator',
          title: 'Estimation de marché TAM/SAM/SOM',
          description: 'Calculez la taille de votre marché adressable',
          component_name: 'MarketSizeEstimator',
          resource_type: 'interactive'
        },
        {
          id: 'competitive-analysis-table',
          title: 'Analyse concurrentielle',
          description: 'Analysez vos concurrents pour identifier votre différenciation',
          component_name: 'CompetitiveAnalysisTable',
          resource_type: 'interactive'
        }
      ]);
    }
  }, [isLoading, resources, stepIdNumber, decodedSubstepTitle]);

  if (!stepId || !substepTitle) {
    return <div className="text-center p-8">Sélectionnez une étape du parcours</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{decodedSubstepTitle}</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 text-destructive border border-destructive/30 rounded-md">
              {error}
            </div>
          ) : courses.length > 0 ? (
            courses.map((course, index) => (
              <div key={`course-${index}`} className="mb-8">
                <CourseContentDisplay
                  stepId={stepIdNumber}
                  substepTitle={decodedSubstepTitle}
                  stepTitle={course.title || ""}
                  courseContent={course.course_content || ""}
                />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Aucun contenu de cours disponible.</p>
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 text-destructive border border-destructive/30 rounded-md">
              {error}
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-6">
              {resources.map((resource, index) => (
                <div key={`resource-${index}`}>
                  <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  
                  {resource.file_url ? (
                    <a 
                      href={resource.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-md transition-colors"
                    >
                      Ouvrir la ressource externe
                    </a>
                  ) : resource.component_name ? (
                    <div className="border border-slate-700 rounded-md p-4 bg-slate-800/50">
                      {renderResourceComponent(resource.component_name, stepIdNumber, decodedSubstepTitle)}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Ressource sans contenu</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune ressource disponible.</p>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Debug panel */}
      <div className="mt-12 pt-6 border-t border-slate-700">
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer">Informations de débogage</summary>
          <pre className="mt-2 p-4 bg-slate-800 rounded overflow-auto">
            {JSON.stringify({ stepId, substepTitle, resourceCount: resources.length, courseCount: courses.length }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
