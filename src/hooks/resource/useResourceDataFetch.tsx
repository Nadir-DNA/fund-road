
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
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log("No auth session found, skipping data fetch");
        setIsLoading(false);
        return;
      }

      try {
        // User resource
        const { data: userResource, error: userResourceError } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (userResourceError) {
          throw userResourceError;
        }

        console.log("User resource fetch result:", userResource);

        if (userResource) {
          const content = userResource.content || {};
          console.log("Setting form data from user resource:", content);
          setFormData(content);
          setResourceId(userResource.id);
          onData && onData(content);
          setIsLoading(false);
          return;
        }

        // Fallback: template resource
        console.log("No user resource found, checking for template");
        const { data: templateResource, error: templateError } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (templateError) {
          throw templateError;
        }

        console.log("Template resource fetch result:", templateResource);

        if (templateResource && templateResource.course_content) {
          try {
            const parsedContent = typeof templateResource.course_content === "string"
              ? JSON.parse(templateResource.course_content)
              : templateResource.course_content;

            console.log("Setting form data from template:", parsedContent);
            setFormData(parsedContent);
            onData && onData(parsedContent);
          } catch (e) {
            console.log("Error parsing template content, using as-is");
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
