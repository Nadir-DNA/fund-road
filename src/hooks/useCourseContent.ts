
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CourseContent {
  id: string;
  course_content: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export function useCourseContent(stepId: number | undefined, substepTitle: string | null) {
  const [data, setData] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if stepId is not provided
    if (!stepId) {
      setIsLoading(false);
      return;
    }

    async function fetchCourseContent() {
      setIsLoading(true);
      setError(null);

      console.log(`useCourseContent - Fetching for stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
      
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

        const { data: courseData, error: fetchError } = await query;
        
        if (fetchError) {
          console.error("Error fetching course content:", fetchError);
          setError("Une erreur s'est produite lors du chargement des cours.");
        } else {
          console.log(`useCourseContent - Found ${courseData?.length || 0} courses:`, courseData);
          setData(courseData || []);
        }
      } catch (err) {
        console.error("Failed to fetch course content:", err);
        setError("Une erreur inattendue s'est produite.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseContent();
  }, [stepId, substepTitle]);

  return { data, isLoading, error };
}
