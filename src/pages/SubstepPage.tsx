
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { renderResourceComponent } from "@/components/journey/utils/resourceRenderer";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function SubstepPage() {
  const { stepId, substepTitle } = useParams();
  const decodedSubstepTitle = substepTitle ? decodeURIComponent(substepTitle) : "";
  const stepIdNumber = Number(stepId || 0);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  
  // Log parameters for debugging
  console.log("SubstepPage - Parameters:", { stepId, substepTitle: decodedSubstepTitle });
  
  // Force fallback display after a timeout
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading || (!resources.length && !courses.length)) {
        setShowFallback(true);
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, [isLoading, resources.length, courses.length]);
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      if (!stepId || !substepTitle) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for step ${stepId}, substep: ${decodedSubstepTitle}`);
        
        // Set a timeout to prevent endless loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Fetch timeout")), 5000);
        });
        
        // Actual fetch
        const fetchPromise = supabase
          .from("entrepreneur_resources")
          .select("*")
          .eq("step_id", stepIdNumber)
          .eq("substep_title", decodedSubstepTitle);
          
        // Race the fetch against the timeout
        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => ({ data: null, error: new Error("Fetch timeout") }))
        ]);
        
        if (error) {
          console.error("Error fetching resources:", error);
          setError("Erreur lors du chargement des ressources");
          return;
        }
        
        console.log("Resources fetched:", data);
        
        // Filter resources by type
        if (data) {
          setCourses(data.filter(r => r.resource_type === "cours"));
          setResources(data.filter(r => r.resource_type !== "cours"));
        }
      } catch (err) {
        console.error("Exception during fetch:", err);
        setError("Une erreur inattendue s'est produite");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [stepId, substepTitle, decodedSubstepTitle, stepIdNumber, retryCount]);
  
  // Handle fallback if no resources found
  useEffect(() => {
    if ((!isLoading && resources.length === 0) || showFallback) {
      console.log("No resources found or timeout, adding hardcoded fallbacks");
      
      // Special handling for step 1, "Recherche utilisateur"
      if (stepIdNumber === 1 && decodedSubstepTitle === "Recherche utilisateur") {
        setResources([
          {
            id: 'user-research',
            title: 'Journal de recherche utilisateur',
            description: 'Documentez vos observations et insights utilisateurs',
            component_name: 'UserResearchNotebook',
            resource_type: 'interactive'
          },
          {
            id: 'customer-behavior',
            title: 'Analyse comportementale',
            description: 'Notez les comportements et habitudes utilisateurs',
            component_name: 'CustomerBehaviorNotes',
            resource_type: 'interactive'
          }
        ]);
      }
      
      // Add generic fallbacks for other steps if needed
      else {
        setResources(prev => {
          if (prev.length === 0) {
            return [
              {
                id: 'default-resource',
                title: `Ressource pour ${decodedSubstepTitle}`,
                description: 'Complétez cette section pour avancer dans votre parcours',
                component_name: 'DefaultResourceForm',
                resource_type: 'interactive'
              }
            ];
          }
          return prev;
        });
      }
    }
  }, [isLoading, resources, stepIdNumber, decodedSubstepTitle, showFallback]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setShowFallback(false);
    setIsLoading(true);
  };

  if (!stepId || !substepTitle) {
    return <div className="text-center p-8">Sélectionnez une étape du parcours</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{decodedSubstepTitle}</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          className="ml-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Actualiser
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {isLoading && !showFallback ? (
            <div className="flex justify-center p-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 text-destructive border border-destructive/30 rounded-md">
              {error}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Réessayer
              </Button>
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
            <div className="p-6 border border-dashed border-slate-700 rounded-lg">
              <h3 className="text-lg font-medium text-center">Contenu du cours</h3>
              <p className="text-muted-foreground text-center mt-4">
                Le contenu pédagogique pour cette section sera disponible prochainement.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          {isLoading && !showFallback ? (
            <div className="flex justify-center p-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : error && !showFallback ? (
            <div className="p-4 text-destructive border border-destructive/30 rounded-md">
              {error}
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Réessayer
              </Button>
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-6">
              {resources.map((resource, index) => (
                <div key={`resource-${index}`} className="border border-slate-700 rounded-lg p-6 bg-slate-800/50">
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
            <div className="p-6 border border-dashed border-slate-700 rounded-lg">
              <h3 className="text-lg font-medium text-center">Ressources interactives</h3>
              <p className="text-muted-foreground text-center mt-4">
                Les ressources pour cette section seront disponibles prochainement.
              </p>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Vérifier à nouveau
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Debug panel */}
      <div className="mt-12 pt-6 border-t border-slate-700">
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer">Informations de débogage</summary>
          <pre className="mt-2 p-4 bg-slate-800 rounded overflow-auto">
            {JSON.stringify({ 
              stepId, 
              substepTitle, 
              resourceCount: resources.length, 
              courseCount: courses.length,
              isLoading,
              showFallback,
              retryCount
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
