
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useResourceSession } from "./useResourceSession";

const STORAGE_KEY_PREFIX = 'offline_resource_';

/**
 * Hook for loading resource data from the database, template, or offline cache
 */
export const useResourceDataLoader = (
  stepId: number,
  substepTitle: string,
  resourceType: string,
  onDataLoaded?: (data: any) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const { session, fetchSession } = useResourceSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const failedAttemptsRef = useRef(0);
  
  // Check for offline cache
  const getOfflineCache = useCallback(() => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${stepId}_${substepTitle}_${resourceType}`;
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.warn("Error reading from offline cache:", err);
    }
    return null;
  }, [stepId, substepTitle, resourceType]);
  
  // Save to offline cache
  const saveToOfflineCache = useCallback((data: any) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${stepId}_${substepTitle}_${resourceType}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log("Saved resource data to offline cache");
    } catch (err) {
      console.warn("Error saving to offline cache:", err);
    }
  }, [stepId, substepTitle, resourceType]);

  // Create a memoized load function to avoid recreation during renders
  const loadResourceData = useCallback(async () => {
    setIsLoading(true);
    console.log(`[Attempt ${loadAttempts + 1}] Loading data for: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
    
    // Check offline cache first in case of connection issues
    const offlineData = getOfflineCache();
    if (offlineData) {
      console.log("Found data in offline cache, using it while trying to connect");
      // Return cached data immediately but don't exit loading state yet
      if (onDataLoaded) {
        onDataLoaded(offlineData);
      }
    }
    
    try {
      // Get current session
      const currentSession = session || await fetchSession().catch(err => {
        console.warn("Failed to fetch session:", err);
        return null;
      });
      
      if (!currentSession) {
        console.log("No authenticated session found for resource data loading");
        failedAttemptsRef.current++;
        
        // Switch to offline mode after multiple failures
        if (failedAttemptsRef.current >= 2) {
          setIsOfflineMode(true);
          console.log("Switching to offline mode due to authentication issues");
          
          // Try to use offline cache or default values
          const fallbackData = offlineData || { initialized: true, offlineMode: true };
          if (onDataLoaded) {
            onDataLoaded(fallbackData);
          }
          
          setIsLoading(false);
          return { content: fallbackData, resourceId: null };
        }
        
        // Even with no session, exit loading state
        setIsLoading(false);
        return { content: {}, resourceId: null };
      }
      
      // Try to fetch user resource with timeout
      const fetchPromise = new Promise(async (resolve, reject) => {
        try {
          const { data: userResources, error: userResourceError } = await supabase
            .from('user_resources')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .eq('step_id', stepId)
            .eq('substep_title', substepTitle)
            .eq('resource_type', resourceType);
            
          if (userResourceError) {
            reject(userResourceError);
            return;
          }
          resolve(userResources);
        } catch (err) {
          reject(err);
        }
      });
      
      // Add a timeout to the fetch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 3000);
      });
      
      // Race the fetch against the timeout
      const userResources = await Promise.race([fetchPromise, timeoutPromise])
        .catch(err => {
          console.error("Error or timeout fetching user resource:", err);
          failedAttemptsRef.current++;
          return null;
        });

      if (!userResources) {
        // Handle network error by using offline cache
        if (offlineData) {
          console.log("Network error, using offline cache data");
          setIsOfflineMode(true);
          setIsLoading(false);
          return { content: offlineData, resourceId: null };
        }
        
        // If offline mode is active, just return minimal data
        if (isOfflineMode) {
          const defaultContent = { initialized: true, offlineMode: true };
          setIsLoading(false);
          return { content: defaultContent, resourceId: null };
        }
      } else {
        console.log("User resources fetch result:", userResources);
        
        // Reset offline mode and failure count on successful fetch
        if (failedAttemptsRef.current > 0) {
          failedAttemptsRef.current = 0;
          setIsOfflineMode(false);
        }

        // Use most recent user resource if available
        if (userResources && Array.isArray(userResources) && userResources.length > 0) {
          // Sort by updated_at in descending order to get the most recent
          const mostRecent = userResources.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0];
          
          const content = mostRecent.content || {};
          console.log("Found user resource:", mostRecent.id);
          setResourceId(mostRecent.id);
          
          // Save to offline cache for future use
          saveToOfflineCache(content);
          
          setIsLoading(false);
          
          if (onDataLoaded) {
            onDataLoaded(content);
          }
          
          return { content, resourceId: mostRecent.id };
        }
      }

      // If no user resource found and not in offline mode, check for template
      if (!isOfflineMode) {
        console.log("No user resource found, checking for template");

        try {
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
          } else if (templateResources && templateResources.length > 0) {
            console.log("Template resources fetch result:", templateResources);
            
            const templateResource = templateResources[0];
            try {
              if (templateResource.course_content) {
                const parsedContent = typeof templateResource.course_content === "string"
                  ? JSON.parse(templateResource.course_content)
                  : templateResource.course_content;

                console.log("Using template data");
                
                // Cache the template data for offline use
                saveToOfflineCache(parsedContent);
                
                setIsLoading(false);
                
                if (onDataLoaded) {
                  onDataLoaded(parsedContent);
                }
                
                return { content: parsedContent, resourceId: null };
              }
            } catch (e) {
              console.log("Error parsing template content, using as-is");
              const content = { content: templateResource.course_content };
              
              // Cache the template data for offline use
              saveToOfflineCache(content);
              
              setIsLoading(false);
              
              if (onDataLoaded) {
                onDataLoaded(content);
              }
              
              return { content, resourceId: null };
            }
          }
        } catch (err) {
          console.error("Error fetching template resource:", err);
        }
      }
      
      // Default empty content as last resort
      const defaultContent = { initialized: true };
      
      // Save default content to cache
      saveToOfflineCache(defaultContent);
      
      setIsLoading(false);
      
      if (onDataLoaded) {
        onDataLoaded(defaultContent);
      }
      
      return { content: defaultContent, resourceId: null };
      
    } catch (error) {
      console.error("Error loading resource data:", error);
      
      // Move to offline mode if multiple failures
      failedAttemptsRef.current++;
      if (failedAttemptsRef.current >= 2) {
        setIsOfflineMode(true);
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la ressource",
        variant: "destructive",
      });
      
      // Use offline data or default
      const fallbackData = offlineData || { initialized: true, offlineMode: true };
      
      setIsLoading(false);
      
      if (onDataLoaded) {
        onDataLoaded(fallbackData);
      }
      
      return { content: fallbackData, resourceId: null };
    }
  }, [
    stepId, 
    substepTitle, 
    resourceType, 
    session, 
    fetchSession, 
    toast, 
    loadAttempts, 
    onDataLoaded, 
    getOfflineCache, 
    saveToOfflineCache,
    isOfflineMode
  ]);

  // Effect to load resource data on mount or when key parameters change
  useEffect(() => {
    let isMounted = true;
    
    // Always start with loading state
    setIsLoading(true);
    console.log("Starting to load resource data...");
    
    const loadTimeout = setTimeout(() => {
      // If still loading after timeout, use offline mode
      if (isMounted && isLoading) {
        console.log("Loading timeout, switching to offline mode");
        setIsOfflineMode(true);
        const cachedData = getOfflineCache();
        if (cachedData && onDataLoaded) {
          onDataLoaded(cachedData);
        }
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    loadResourceData().then((result) => {
      if (!isMounted) return;
      
      if (result && onDataLoaded) {
        onDataLoaded(result.content);
        if (result.resourceId) {
          setResourceId(result.resourceId);
        }
      }
      
      // Ensure loading is set to false even if there's an error
      setIsLoading(false);
    });
    
    return () => { 
      isMounted = false;
      clearTimeout(loadTimeout);
    };
  }, [stepId, substepTitle, resourceType, loadResourceData, loadAttempts, getOfflineCache, onDataLoaded]);

  // Add a function to retry loading
  const retryLoading = () => {
    console.log("Manually retrying data loading");
    setIsOfflineMode(false);
    failedAttemptsRef.current = 0;
    setLoadAttempts(prevAttempts => prevAttempts + 1);
  };

  return {
    isLoading,
    isOfflineMode,
    resourceId,
    setResourceId,
    session,
    fetchSession,
    retryLoading
  };
};
