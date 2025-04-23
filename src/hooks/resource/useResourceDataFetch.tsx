
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        setIsLoading(false);
        return;
      }

      try {
        // User resource
        const { data: userResource } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();

        if (userResource) {
          const content = userResource.content || {};
          setFormData(content);
          setResourceId(userResource.id);
          onData && onData(content);
          setIsLoading(false);
          return;
        }

        // Fallback: template resource
        const { data: templateResource } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();

        if (templateResource && templateResource.course_content) {
          try {
            const parsedContent = typeof templateResource.course_content === "string"
              ? JSON.parse(templateResource.course_content)
              : templateResource.course_content;

            setFormData(parsedContent);
            onData && onData(parsedContent);
          } catch (e) {
            const content = { content: templateResource.course_content };
            setFormData(content);
            onData && onData(content);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [stepId, substepTitle, resourceType]);
}
