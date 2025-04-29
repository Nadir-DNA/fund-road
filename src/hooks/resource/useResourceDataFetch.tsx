
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface FetchOptions {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  onData: (data: any) => void;
  setFormData: (data: any) => void;
  setResourceId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useResourceDataFetch({
  stepId,
  substepTitle,
  resourceType,
  onData,
  setFormData,
  setResourceId,
  setIsLoading,
}: FetchOptions) {
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log(`Fetching data for: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
      
      try {
        // Check for session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
          console.log("No auth session found, skipping data fetch");
          setIsLoading(false);
          return;
        }

        console.log("Session found:", session.user.id);

        // Try to fetch user resource - Use array instead of maybeSingle to handle multiple results
        const { data: userResources, error: userResourceError } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType);
          
        if (userResourceError) {
          console.error("Error fetching user resource:", userResourceError);
          throw userResourceError;
        }

        console.log("User resources fetch result:", userResources);

        // If we have user resources, use the most recently updated one
        if (userResources && userResources.length > 0) {
          // Sort by updated_at in descending order to get the most recent
          const mostRecent = userResources.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0];
          
          const content = mostRecent.content || {};
          console.log("Setting form data from user resource:", content);
          setFormData(content);
          setResourceId(mostRecent.id);
          onData && onData(content);
          setIsLoading(false);
          return;
        } else {
          console.log("No user resource found, checking for template");
        }

        // Fallback: template resource
        const { data: templateResources, error: templateError } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .limit(1);
          
        if (templateError) {
          console.error("Error fetching template resource:", templateError);
          throw templateError;
        }

        console.log("Template resources fetch result:", templateResources);

        if (templateResources && templateResources.length > 0) {
          const templateResource = templateResources[0];
          try {
            if (templateResource.course_content) {
              const parsedContent = typeof templateResource.course_content === "string"
                ? JSON.parse(templateResource.course_content)
                : templateResource.course_content;

              console.log("Setting form data from template:", parsedContent);
              setFormData(parsedContent);
              onData && onData(parsedContent);
            } else {
              console.log("Template has no course_content");
            }
          } catch (e) {
            console.log("Error parsing template content, using as-is:", e);
            const content = { content: templateResource.course_content };
            setFormData(content);
            onData && onData(content);
          }
        } else {
          console.log("No template found either, using default values");
        }
      } catch (error) {
        console.error("Error fetching resource data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la ressource",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [stepId, substepTitle, resourceType]);
}
