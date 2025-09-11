
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface CourseContent {
  id: string;
  title?: string;
  description?: string;
  resource_type?: string;
  course_content?: string;
  component_name?: string;
  [key: string]: any;
}

export function useCourseContent(stepId: number, substepTitle: string | null) {
  const [data, setData] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`useCourseContent - Fetching for stepId: ${stepId}, substepTitle: ${substepTitle || 'main step'}`);
        
        // Basic validation
        if (!stepId || isNaN(stepId)) {
          throw new Error("Invalid step ID");
        }
        
        // Construct query
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
        
        // Execute query
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        console.log(`useCourseContent - Found ${data?.length || 0} courses:`, data);
        setData(data || []);
      } catch (err) {
        console.error('Error fetching course content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch course content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [stepId, substepTitle]);

  return { data, isLoading, error };
}
