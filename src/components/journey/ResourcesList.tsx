
import { useState, useEffect } from "react";
import { useCourseContent } from "@/hooks/useCourseContent";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import ResourceCard from "./ResourceCard";

interface ResourcesListProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
}

export default function ResourcesList({ stepId, substepTitle, stepTitle }: ResourcesListProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      
      try {
        console.log(`ResourcesList - Fetching resources for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
        
        // Build query
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
          
        // Filter by substep_title
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        // Filter to exclude course type resources
        query = query.neq('resource_type', 'course');
        
        // Execute query
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        console.log(`ResourcesList - Found ${data?.length || 0} resources:`, data);
        setResources(data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
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
        <p className="text-gray-500">Aucune ressource disponible pour cette étape.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard 
          key={resource.id} 
          resource={resource}
          stepId={stepId}
          substepTitle={substepTitle || ''}
        />
      ))}
    </div>
  );
}
