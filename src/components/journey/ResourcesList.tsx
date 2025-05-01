
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import CourseContentDisplay from "../journey/CourseContentDisplay";
import { toast } from "@/components/ui/use-toast";

interface ResourcesListProps {
  stepId: number;
  substepTitle?: string | null;
  stepTitle: string;
}

export default function ResourcesList({ stepId, substepTitle, stepTitle }: ResourcesListProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      console.log(`ResourcesList - Fetching resources for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('resource_type', 'course');
        
        // Handle null substep_title correctly
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          // For main step, look for NULL substep_title values
          query = query.is('substep_title', null);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching resources:", error);
          setError("Une erreur s'est produite lors du chargement des ressources.");
          toast({
            title: "Erreur de chargement",
            description: "Impossible de récupérer les ressources",
            variant: "destructive"
          });
        } else {
          console.log(`ResourcesList - Found ${data?.length || 0} resources:`, data);
          setResources(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setError("Une erreur s'est produite lors du chargement des ressources.");
      } finally {
        setIsLoading(false);
      }
    };

    if (stepId) {
      fetchResources();
    }
  }, [stepId, substepTitle]);

  if (isLoading) {
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

  if (resources.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Aucune ressource disponible pour cette étape.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {resources.map((resource) => (
        <div key={resource.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">{resource.title || 'Ressource sans titre'}</h3>
          {resource.description && (
            <p className="text-muted-foreground mb-4">{resource.description}</p>
          )}
          {resource.course_content && (
            <CourseContentDisplay 
              stepId={stepId}
              substepTitle={substepTitle}
              stepTitle={stepTitle}
              courseContent={resource.course_content}
            />
          )}
        </div>
      ))}
    </div>
  );
}
