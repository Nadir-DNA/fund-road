
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Suspense, lazy } from "react";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";
import { toast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  resource_type: string;
  course_content?: string;
  url?: string;
  resource_url?: string;
  component_name?: string;
  title?: string;
}

const DynamicResourceComponent = ({ componentName, stepId, substepTitle }: { componentName: string; stepId: number; substepTitle: string }) => {
  // Create a lazy-loaded component
  const DynamicComponent = lazy(async () => {
    try {
      // Dynamic import based on component name
      const module = await import(`@/components/journey/resources/${componentName}`);
      return { default: module.default };
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      toast({
        title: "Erreur de chargement",
        description: `Le composant ${componentName} n'a pas été trouvé.`,
        variant: "destructive"
      });
      return { 
        default: () => <div className="p-4 text-red-500">Failed to load resource: {componentName}</div>
      };
    }
  });

  return (
    <Suspense fallback={<div className="p-4">Loading resource...</div>}>
      <DynamicComponent stepId={stepId} substepTitle={substepTitle} />
    </Suspense>
  );
};

export default function SubstepPage() {
  const { stepId, substepTitle } = useParams();
  
  console.log("SubstepPage mounted with:", { stepId, substepTitle });
  
  const { data, error, isLoading } = useQuery({
    queryKey: ["substepResources", stepId, substepTitle],
    queryFn: async () => {
      if (!stepId || !substepTitle) throw new Error("Missing parameters");
      
      console.log(`Fetching resources for step ${stepId}, substep ${substepTitle}`);
      
      const { data, error } = await supabase
        .from("entrepreneur_resources")
        .select("id, course_content, resource_url, component_name, resource_type, title")
        .eq("step_id", +stepId)
        .eq("substep_title", decodeURIComponent(substepTitle));
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} resources:`, data);
      return (data || []).map(r => ({ ...r, url: r.resource_url })) as Resource[];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingIndicator size="lg" />
        <span className="ml-3 text-lg">Chargement des ressources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <h2 className="text-xl font-medium text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 dark:text-red-300">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-2">Aucune ressource trouvée</h2>
          <p>Aucune ressource disponible pour {substepTitle} (étape {stepId}).</p>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
            {JSON.stringify({ stepId, substepTitle }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Separate courses from other resources
  const courses = data.filter(r => r.resource_type === "course");
  const otherResources = data.filter(r => r.resource_type !== "course");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">{substepTitle}</h1>

      {/* Course Content Section */}
      {courses.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Cours</h2>
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-700/30 rounded-lg p-6">
                {course.course_content ? (
                  <CourseContentDisplay 
                    stepId={Number(stepId)} 
                    substepTitle={substepTitle || null}
                    stepTitle={course.title || ""} 
                    courseContent={course.course_content}
                  />
                ) : (
                  <p>Ce cours n'a pas de contenu.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Resources Section */}
      {otherResources.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Ressources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherResources.map(resource => (
              <div key={resource.id} className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="font-medium mb-3">{resource.title || "Ressource sans titre"}</h3>
                
                {resource.url ? (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ouvrir la ressource externe
                  </a>
                ) : resource.component_name ? (
                  <DynamicResourceComponent 
                    componentName={resource.component_name} 
                    stepId={Number(stepId)} 
                    substepTitle={substepTitle || ""}
                  />
                ) : (
                  <p className="text-muted-foreground">Cette ressource n'a pas de contenu affichable.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV !== 'production' && (
        <details className="mt-10 p-4 border rounded-lg">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
            {JSON.stringify({ stepId, substepTitle, resourceCount: data.length }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
