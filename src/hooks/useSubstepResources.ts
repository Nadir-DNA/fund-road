
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";

export function useSubstepResources(stepId: number, substepTitle: string) {
  return useQuery({
    queryKey: ["substepResources", stepId, substepTitle],
    queryFn: async () => {
      if (!stepId || !substepTitle) throw new Error("Missing parameters");
      
      console.log(`Fetching resources for step ${stepId}, substep ${substepTitle}`);
      
      const { data, error } = await supabase
        .from("entrepreneur_resources")
        .select("id, course_content, file_url, component_name, resource_type, title")
        .eq("step_id", stepId)
        .eq("substep_title", decodeURIComponent(substepTitle));
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} resources:`, data);
      // Handle possible null data and safely map only if data exists
      if (!data) return [] as Resource[];
      
      return data.map(r => ({ 
        id: r.id,
        resource_type: r.resource_type,
        course_content: r.course_content,
        url: r.file_url,
        component_name: r.component_name,
        title: r.title
      })) as Resource[];
    }
  });
}
