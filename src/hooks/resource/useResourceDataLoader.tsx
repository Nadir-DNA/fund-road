
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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
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
    // Initial load state - ALWAYS true at first
    setIsLoading(true);
    console.log(`[Attempt ${loadAttempts + 1}] Loading data for: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
    
    // Set safety timeout to force exit loading state after max 3 seconds
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log("⚠️ Safety timeout triggered - forcing loading to complete");
        setIsLoading(false);
        
        // Switch to offline mode after timeout
        setIsOfflineMode(true);
        
        // Try to use offline cache or default values
        const offlineData = getOfflineCache() || { initialized: true, offlineMode: true };
        if (onDataLoaded) {
          onDataLoaded(offlineData);
        }
      }
    }, 3000); // Reduced from 5s to 3s
    
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
      // Get current session - but limit the waiting time
      let currentSession = null;
      try {
        currentSession = session || await Promise.race([
          fetchSession().catch(() => null),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 2000))
        ]);
      } catch (err) {
        console.warn("Failed to fetch session (timeout or error):", err);
        // Continue with null session, will use offline mode
      }
      
      if (!currentSession) {
        console.log("No authenticated session found for resource data loading");
        failedAttemptsRef.current++;
        
        // Switch to offline mode after just 1 failure (was 2)
        if (failedAttemptsRef.current >= 1) {
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
      }
      
      // If we have a session, try to fetch data with a short timeout
      if (currentSession) {
        try {
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
          
          // Add a timeout to the fetch - reduced from 3s to 2s
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out")), 2000);
          });
          
          // Race the fetch against the timeout
          const userResources = await Promise.race([fetchPromise, timeoutPromise])
            .catch(err => {
              console.error("Error or timeout fetching user resource:", err);
              failedAttemptsRef.current++;
              return null;
            });

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
            
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            
            setIsLoading(false);
            
            if (onDataLoaded) {
              onDataLoaded(content);
            }
            
            return { content, resourceId: mostRecent.id };
          }
        } catch (err) {
          console.error("Error in user resources fetch:", err);
        }
      }

      // If no user resource found, use offline data or default
      const defaultContent = offlineData || { initialized: true, offlineMode: true };
      
      // Save default content to cache for future use
      saveToOfflineCache(defaultContent);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      setIsLoading(false);
      setIsOfflineMode(true);
      
      if (onDataLoaded) {
        onDataLoaded(defaultContent);
      }
      
      return { content: defaultContent, resourceId: null };
      
    } catch (error) {
      console.error("Error loading resource data:", error);
      
      // Move to offline mode immediately after failure
      setIsOfflineMode(true);
      
      const fallbackData = offlineData || { initialized: true, offlineMode: true };
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
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
    isMountedRef.current = true;
    
    // Always start with loading state
    setIsLoading(true);
    console.log("Starting to load resource data...");
    
    // Set safety timeout for initial load
    const loadTimeout = setTimeout(() => {
      // If still loading after timeout, use offline mode
      if (isMountedRef.current && isLoading) {
        console.log("Initial loading timeout, forcing offline mode");
        setIsOfflineMode(true);
        setIsLoading(false);
        const cachedData = getOfflineCache() || { initialized: true, offlineMode: true };
        if (onDataLoaded) {
          onDataLoaded(cachedData);
        }
      }
    }, 3000); // 3 second timeout
    
    loadResourceData().then((result) => {
      if (!isMountedRef.current) return;
      
      if (result && result.content && onDataLoaded) {
        onDataLoaded(result.content);
        if (result.resourceId) {
          setResourceId(result.resourceId);
        }
      }
      
      // Ensure loading is set to false even if there's an error
      setIsLoading(false);
    });
    
    return () => { 
      isMountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
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
