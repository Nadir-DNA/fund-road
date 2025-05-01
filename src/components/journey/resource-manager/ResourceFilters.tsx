
import { Resource } from "@/types/journey";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { getStepResources } from "@/utils/resourceHelpers";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ResourceFiltersProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedSubSubstepTitle?: string | null | undefined;
  materials: any[] | undefined;
  hasSession: boolean | null;
  onResourcesFound: (resources: Resource[]) => void;
}

export function ResourceFilters({
  step,
  selectedSubstepTitle,
  selectedSubSubstepTitle,
  materials,
  hasSession,
  onResourcesFound
}: ResourceFiltersProps) {
  // Use the hook to fetch resources
  const { data: resources, isLoading, error } = useResourceFilters(
    step,
    selectedSubstepTitle,
    selectedSubSubstepTitle,
    materials,
    hasSession,
    onResourcesFound
  );

  // Log current state for debugging
  console.log("ResourceFilters - Params:", {
    stepId: step.id, 
    substep: selectedSubstepTitle || "main", 
    subsubstep: selectedSubSubstepTitle || "none"
  });
  console.log("ResourceFilters - Resources:", resources?.length || 0);
  
  // Add direct Supabase query for course content
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        console.log(`Fetching course content for step: ${step.id}, substep: ${selectedSubstepTitle || 'main'}`);
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id)
          .eq('resource_type', 'course');
        
        if (selectedSubstepTitle) {
          query = query.eq('substep_title', selectedSubstepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data: courseData, error: courseError } = await query;
        
        if (courseError) {
          console.error("Error fetching course content:", courseError);
          return;
        }
        
        if (courseData && courseData.length > 0) {
          console.log(`Found ${courseData.length} course content items from Supabase:`, courseData);
          
          // Map course content to resources format and add to existing resources
          const courseResources = courseData.map(item => ({
            id: item.id || `course-${Math.random().toString(36).substring(7)}`,
            title: item.title || "Course Content",
            description: item.description || "Course materials",
            componentName: "CourseContentDisplay",
            type: "course",
            courseContent: item.course_content,
            status: 'available' as const
          }));
          
          // Combine with other resources
          if (resources) {
            onResourcesFound([...resources, ...courseResources]);
          } else {
            onResourcesFound(courseResources);
          }
        } else {
          console.log("No course content found in Supabase");
        }
      } catch (error) {
        console.error("Failed to fetch course content:", error);
      }
    };
    
    // Only fetch if we have a valid step id
    if (step && step.id) {
      fetchCourseContent();
    }
  }, [step.id, selectedSubstepTitle, onResourcesFound, resources]);

  // Le composant ne rend rien directement, il gère uniquement la logique de requête
  return null;
}

// Export the helper function for direct use
export { getStepResources };
