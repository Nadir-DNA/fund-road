
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useResourceSession } from "./useResourceSession";

/**
 * Hook for loading resource data from the database or template
 */
export const useResourceDataLoader = (
  stepId: number,
  substepTitle: string,
  resourceType: string,
  onDataLoaded?: (data: any) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const { session, fetchSession } = useResourceSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Create a memoized load function to avoid recreation during renders
  const loadResourceData = useCallback(async () => {
    setIsLoading(true);
    console.log(`[Attempt ${loadAttempts + 1}] Loading data for: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
    
    try {
      // Get current session
      const currentSession = session || await fetchSession();
      
      if (!currentSession) {
        console.log("No authenticated session found for resource data loading");
        setIsLoading(false);
        return { content: {}, resourceId: null };
      }
      
      // Try to fetch user resource
      const { data: userResources, error: userResourceError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType);
        
      if (userResourceError) {
        console.error("Error fetching user resource:", userResourceError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la ressource",
          variant: "destructive",
        });
        setIsLoading(false);
        return { content: {}, resourceId: null };
      }

      console.log("User resources fetch result:", userResources);

      // Use most recent user resource if available
      if (userResources && userResources.length > 0) {
        // Sort by updated_at in descending order to get the most recent
        const mostRecent = userResources.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];
        
        const content = mostRecent.content || {};
        console.log("Found user resource:", mostRecent.id);
        setResourceId(mostRecent.id);
        setIsLoading(false);
        
        if (onDataLoaded) {
          onDataLoaded(content);
        }
        
        return { content, resourceId: mostRecent.id };
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
        setIsLoading(false);
        return { content: {}, resourceId: null };
      }

      console.log("Template resources fetch result:", templateResources);

      if (templateResources && templateResources.length > 0) {
        const templateResource = templateResources[0];
        try {
          if (templateResource.course_content) {
            const parsedContent = typeof templateResource.course_content === "string"
              ? JSON.parse(templateResource.course_content)
              : templateResource.course_content;

            console.log("Using template data");
            setIsLoading(false);
            
            if (onDataLoaded) {
              onDataLoaded(parsedContent);
            }
            
            return { content: parsedContent, resourceId: null };
          }
        } catch (e) {
          console.log("Error parsing template content, using as-is");
          const content = { content: templateResource.course_content };
          setIsLoading(false);
          
          if (onDataLoaded) {
            onDataLoaded(content);
          }
          
          return { content, resourceId: null };
        }
      } else {
        console.log("No template found either, using default values");
      }
      
      // Default empty content
      const defaultContent = { initialized: true };
      setIsLoading(false);
      
      if (onDataLoaded) {
        onDataLoaded(defaultContent);
      }
      
      return { content: defaultContent, resourceId: null };
      
    } catch (error) {
      console.error("Error loading resource data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la ressource",
        variant: "destructive",
      });
      setIsLoading(false);
      return { content: {}, resourceId: null };
    }
  }, [stepId, substepTitle, resourceType, session, fetchSession, toast, loadAttempts, onDataLoaded]);

  // Effect to load resource data on mount or when key parameters change
  useEffect(() => {
    let isMounted = true;
    
    loadResourceData().then((result) => {
      if (!isMounted) return;
      
      if (result && onDataLoaded) {
        onDataLoaded(result.content);
        if (result.resourceId) {
          setResourceId(result.resourceId);
        }
      }
    });
    
    return () => { 
      isMounted = false;
    };
  }, [stepId, substepTitle, resourceType, loadResourceData]);

  // Add a function to retry loading
  const retryLoading = () => {
    setLoadAttempts(prevAttempts => prevAttempts + 1);
  };

  return {
    isLoading,
    resourceId,
    setResourceId,
    session,
    fetchSession,
    retryLoading
  };
};
