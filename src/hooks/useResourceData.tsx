
import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useResourceSave } from "./resource/useResourceSave";
import { useResourceSession } from "./resource/useResourceSession";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface UserResource {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  resource_type: string;
  content: any;
  created_at?: string;
  updated_at?: string;
}

export const useResourceData = (
  stepId: number, 
  substepTitle: string,
  resourceType: string,
  defaultValues?: any,
  onDataSaved?: (data: any) => void
) => {
  const initialValues = useMemo(() => defaultValues || {}, [defaultValues]);
  const [formData, setFormData] = useState<any>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const { session, fetchSession } = useResourceSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initial values effect ONLY once
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved) {
      onDataSaved(initialValues);
    }
  }, [initialValues, onDataSaved]);

  // Initialize session and resource data
  useEffect(() => {
    const fetchSessionAndData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching data for: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
        
        // Get current session
        const currentSession = session || await fetchSession();
        
        if (!currentSession) {
          console.log("No authenticated session found");
          setIsLoading(false);
          return;
        }
        
        // Try to fetch user resource
        const { data: userResource, error: userResourceError } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (userResourceError) {
          console.error("Error fetching user resource:", userResourceError);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données de la ressource",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log("User resource fetch result:", userResource);

        if (userResource) {
          const content = userResource.content || {};
          console.log("Setting form data from user resource:", content);
          setFormData(content);
          setResourceId(userResource.id);
          onDataSaved && onDataSaved(content);
          setIsLoading(false);
          return;
        } else {
          console.log("No user resource found, checking for template");
        }

        // Fallback: template resource
        const { data: templateResource, error: templateError } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (templateError) {
          console.error("Error fetching template resource:", templateError);
          setIsLoading(false);
          return;
        }

        console.log("Template resource fetch result:", templateResource);

        if (templateResource && templateResource.course_content) {
          try {
            const parsedContent = typeof templateResource.course_content === "string"
              ? JSON.parse(templateResource.course_content)
              : templateResource.course_content;

            console.log("Setting form data from template:", parsedContent);
            setFormData(parsedContent);
            onDataSaved && onDataSaved(parsedContent);
          } catch (e) {
            console.log("Error parsing template content, using as-is");
            const content = { content: templateResource.course_content };
            setFormData(content);
            onDataSaved && onDataSaved(content);
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

    fetchSessionAndData();
  }, [stepId, substepTitle, resourceType, toast, onDataSaved, session, fetchSession]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Form field "${field}" updated:`, value);
      if (onDataSaved) onDataSaved(updated);
      return updated;
    });
  }, [onDataSaved]);

  // Create save function with the useResourceSave hook
  const { handleSave: saveResource } = useResourceSave({
    formData,
    stepId,
    substepTitle,
    resourceType,
    resourceId,
    onSaved: (id) => {
      console.log("Resource saved with ID:", id);
      setResourceId(id);
    },
    setIsSaving,
  });
  
  // Wrapper function for handleSave to include session
  const handleSave = useCallback(async (currentSession?: any) => {
    console.log("Manual save triggered with data:", formData);
    try {
      // If no session provided, try to get the current one or fetch a new one
      const sessionToUse = currentSession || session || await fetchSession();
      
      if (!sessionToUse) {
        console.error("No valid session available for saving");
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour sauvegarder vos ressources.",
          variant: "destructive"
        });
        navigate("/auth");
        return false;
      }
      
      return await saveResource(sessionToUse);
    } catch (err) {
      console.error("Error during save operation:", err);
      return false;
    }
  }, [formData, saveResource, session, fetchSession, toast, navigate]);

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData,
    session
  };
};
