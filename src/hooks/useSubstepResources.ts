
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import { toast } from "@/components/ui/use-toast";

export function useSubstepResources(stepId: number, substepTitle: string) {
  return useQuery({
    queryKey: ["substepResources", stepId, substepTitle],
    queryFn: async () => {
      if (!stepId || !substepTitle) {
        console.warn("Missing parameters for resource fetch:", { stepId, substepTitle });
        throw new Error("Missing parameters");
      }
      
      console.log(`Fetching resources for step ${stepId}, substep ${substepTitle}`);
      
      try {
        const { data, error } = await supabase
          .from("entrepreneur_resources")
          .select("id, course_content, file_url, component_name, resource_type, title, description")
          .eq("step_id", stepId)
          .eq("substep_title", decodeURIComponent(substepTitle));
        
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} resources:`, data);
        
        // Handle possible null data
        if (!data) {
          console.warn("No data returned from query, returning empty array");
          return [] as Resource[];
        }
        
        // Map database fields to Resource interface
        return data.map(r => ({ 
          id: r.id,
          title: r.title || "Untitled Resource",
          description: r.description || "",
          type: r.resource_type,
          courseContent: r.course_content,
          url: r.file_url,
          componentName: r.component_name,
          status: 'available'
        })) as Resource[];
      } catch (err) {
        // Capture and log the error
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Resource fetch error:", err);
        
        // Notify user of the error via toast
        toast({
          title: "Error loading resources",
          description: `Could not load resources: ${errorMessage}`,
          variant: "destructive",
        });
        
        // Re-throw to let React Query handle it
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    retry: (failureCount, error) => {
      // Only retry network-related errors, not data errors
      const isNetworkError = error instanceof Error && 
        (error.message.includes("network") || error.message.includes("timeout"));
      
      return failureCount < 3 && isNetworkError;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max of 30s
    refetchOnWindowFocus: false, // Only refetch when explicitly requested
    refetchOnMount: true,        // Always get fresh data when component mounts
  });
}
