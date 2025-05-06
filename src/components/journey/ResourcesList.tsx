
import { useState, useEffect } from "react";
import { useCourseContent } from "@/hooks/useCourseContent";
import CourseContentDisplay from "./CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";

interface ResourcesListProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
}

export default function ResourcesList({ stepId, substepTitle, stepTitle }: ResourcesListProps) {
  const { data: resources, isLoading, error } = useCourseContent(stepId, substepTitle);
  const [directResources, setDirectResources] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(true);

  console.log(`ResourcesList - Rendering with stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
  console.log(`ResourcesList - Resources available: ${resources?.length || 0}`);
  
  // Direct query for debugging
  useEffect(() => {
    const fetchDirectly = async () => {
      setDirectLoading(true);
      try {
        console.log(`ResourcesList - Direct query for stepId: ${stepId}, substepTitle: ${substepTitle || 'NULL'}`);
        
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
        
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("ResourcesList - Direct query error:", error);
        } else {
          console.log(`ResourcesList - Direct query results: ${data?.length || 0} items`, data);
          setDirectResources(data || []);
        }
      } catch (err) {
        console.error("ResourcesList - Exception during direct query:", err);
      } finally {
        setDirectLoading(false);
      }
    };
    
    fetchDirectly();
  }, [stepId, substepTitle]);
  
  if (isLoading || directLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if ((resources.length === 0) && (directResources.length === 0)) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucune ressource disponible pour cette étape.</p>
        <pre className="mt-4 text-sm text-left p-4 bg-gray-50 rounded overflow-auto">
          Debug Info: {JSON.stringify({ 
            stepId, 
            substepTitle, 
            queryDetails: { 
              table: 'entrepreneur_resources',
              filters: {
                step_id: stepId,
                resource_type: 'course',
                substep_title: substepTitle || 'IS NULL'
              }
            },
            clientInfo: {
              // Remove reference to supabase.supabaseUrl
              authMethod: supabase.auth.getSession() ? "Session Present" : "No Session"
            }
          }, null, 2)}
        </pre>
      </div>
    );
  }

  // Display resources from both methods
  return (
    <div className="space-y-8">
      {/* Resources from hook */}
      {resources.length > 0 && (
        <div className="border rounded-lg p-4 bg-slate-700/30">
          <h3 className="text-lg font-medium mb-4">Ressources via Hook</h3>
          {resources.map((resource) => (
            <div key={resource.id} className="border-b last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
              <h4 className="text-lg font-medium mb-2">{resource.title || 'Ressource sans titre'}</h4>
              {resource.description && (
                <p className="text-gray-600 mb-4">{resource.description}</p>
              )}
              {resource.course_content && (
                <CourseContentDisplay 
                  stepId={stepId}
                  substepTitle={substepTitle}
                  stepTitle={stepTitle || resource.title || ""}
                  courseContent={resource.course_content}
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Direct resources */}
      {directResources.length > 0 && (
        <div className="border rounded-lg p-4 mt-6 bg-slate-700/30">
          <h3 className="text-lg font-medium mb-4">Ressources via Direct Query</h3>
          {directResources.map((resource, idx) => (
            <div key={idx} className="border-b last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
              <h4 className="text-lg font-medium mb-2">{resource.title || 'Sans titre'}</h4>
              {resource.description && (
                <p className="text-gray-600 mb-4">{resource.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Type: {resource.resource_type || 'N/A'}, 
                Component: {resource.component_name || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
