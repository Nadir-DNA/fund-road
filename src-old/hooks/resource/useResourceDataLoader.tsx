
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useResourceSession } from "./useResourceSession";
import { useNetworkStatus } from "../useNetworkStatus";
import { useToast } from "@/components/ui/use-toast";
import { normalizeSubstepTitle } from "@/utils/normalizeSubstepTitle";

/**
 * Enhanced hook to load resource data with better error handling, offline support, 
 * and multiple retrieval strategies
 */
export const useResourceDataLoader = (
  stepId: number, 
  substepTitle: string,
  resourceType: string,
  onDataLoaded: (data: any) => void,
  forceRefreshCount: number = 0
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<Date | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const { session, fetchSession } = useResourceSession();
  const { isOnline, isSupabaseConnected, checkSupabaseConnection } = useNetworkStatus();
  const { toast } = useToast();

  // Normalize substep title using our central utility
  const normalizedSubstepTitle = normalizeSubstepTitle(stepId, substepTitle);

  // Function to load data from local storage
  const loadFromLocalStorage = useCallback((keyPrefix: string = '') => {
    try {
      // Try multiple different storage key formats for maximum resilience
      const possibleKeys = [
        `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`,
        `offline_resource_${stepId}_${substepTitle}_${resourceType}`,
        `${keyPrefix}offline_resource_${stepId}_${normalizedSubstepTitle}`,
        `${keyPrefix}offline_resource_${stepId}_${substepTitle}`
      ];
      
      console.log("Attempting to load from local storage with keys:", possibleKeys);
      
      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log(`Data loaded from localStorage with key ${key}:`, parsedData);
            
            // Mark the data as loaded from offline storage
            onDataLoaded({
              ...parsedData,
              offlineMode: true,
              _offlineLoadTime: new Date().toISOString(),
              _offlineSource: key
            });
            
            setIsOfflineMode(true);
            return true;
          } catch (parseError) {
            console.error(`Error parsing JSON for key ${key}:`, parseError);
            // Continue trying other keys
          }
        }
      }
      
      console.log("No data found in local storage");
      return false;
    } catch (error) {
      console.error("Error accessing local storage:", error);
      return false;
    }
  }, [stepId, normalizedSubstepTitle, substepTitle, resourceType, onDataLoaded]);

  // Check if we need offline mode
  const checkOfflineMode = useCallback(async () => {
    // Check device online status
    if (!isOnline) {
      console.log("Device is offline, switching to offline mode");
      setIsOfflineMode(true);
      return true;
    }
    
    // If device is online, verify Supabase connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Supabase is not accessible, switching to offline mode");
      setIsOfflineMode(true);
      return true;
    }
    
    // Everything is working normally
    return false;
  }, [isOnline, checkSupabaseConnection]);
  
  // Enhanced resource loading function with multiple fallback strategies
  const loadResourceData = useCallback(async (currentSession: any = null) => {
    setLoadError(null);
    setIsLoading(true);
    setLoadAttempts(prev => prev + 1);
    
    // Avoid infinite load attempts
    if (loadAttempts > 5) {
      console.warn("Too many load attempts, loading from local storage");
      loadFromLocalStorage('emergency_');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`ResourceDataLoader: Loading data for stepId=${stepId}, substepTitle=${substepTitle}, normalizedTitle=${normalizedSubstepTitle}, resourceType=${resourceType}, attempt=${loadAttempts + 1}`);
      
      // Check connection and offline status
      const isOffline = await checkOfflineMode();
      
      // If offline, try to load from local storage
      if (isOffline) {
        const loadedLocally = loadFromLocalStorage();
        if (!loadedLocally) {
          console.log("No local data available, initializing with empty data");
          onDataLoaded({ offlineMode: true, _newResource: true });
        }
        
        setIsLoading(false);
        return;
      }
      
      // If online but no session provided, get one
      if (!currentSession) {
        try {
          const { data } = await supabase.auth.getSession();
          currentSession = data?.session;
          
          if (!currentSession) {
            console.warn("Not authenticated, switching to offline mode");
            setIsOfflineMode(true);
            loadFromLocalStorage();
            setIsLoading(false);
            return;
          }
        } catch (authError) {
          console.error("Error retrieving session:", authError);
          setIsOfflineMode(true);
          loadFromLocalStorage();
          setIsLoading(false);
          return;
        }
      }
      
      console.log("Loading data with session for", { stepId, normalizedSubstepTitle, resourceType });
      
      // MULTI-STRATEGY LOOKUP APPROACH
      // Strategy 1: Exact match with normalized title
      console.log("STRATEGY 1: Exact match with normalized title:", normalizedSubstepTitle);
      const { data: exactMatch, error: exactError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('substep_title', normalizedSubstepTitle)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (exactMatch) {
        console.log("Strategy 1 successful - found exact match with normalized title:", exactMatch);
        setResourceId(exactMatch.id);
        onDataLoaded(exactMatch.content || {});
        
        // Also store a local copy for offline mode
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(exactMatch.content || {}));
        
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
            
      // Strategy 2: Try with original title
      console.log("STRATEGY 2: Using original title:", substepTitle);
      const { data: originalMatch, error: originalError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (originalMatch) {
        console.log("Strategy 2 successful - found match with original title:", originalMatch);
        setResourceId(originalMatch.id);
        onDataLoaded(originalMatch.content || {});
        
        // Also store a local copy with normalized key
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(originalMatch.content || {}));
        
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      // Strategy 3: Look up using original_substep_title field
      console.log("STRATEGY 3: Looking up via original_substep_title field:", substepTitle);
      const { data: flexMatch, error: flexError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('original_substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (flexMatch) {
        console.log("Strategy 3 successful - found match using original_substep_title:", flexMatch);
        setResourceId(flexMatch.id);
        onDataLoaded(flexMatch.content || {});
        
        // Store offline copy
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(flexMatch.content || {}));
        
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      // Strategy 4: Broad search just by step_id and type
      console.log("STRATEGY 4: Performing broad search by step_id and resource_type");
      const { data: broadMatches, error: broadError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(5); // Get several to check
        
      if (broadMatches && broadMatches.length > 0) {
        console.log("Strategy 4 found matches:", broadMatches.length);
        console.log("Found substep titles:", broadMatches.map(m => m.substep_title).join(", "));
        
        // Try fuzzy matching
        const fuzzyMatch = broadMatches.find(m => 
          m.substep_title.includes(substepTitle) || 
          (substepTitle && substepTitle.includes(m.substep_title)) ||
          m.substep_title.toLowerCase() === normalizedSubstepTitle.toLowerCase() ||
          (m.original_substep_title && 
            (m.original_substep_title.includes(substepTitle) || substepTitle.includes(m.original_substep_title)))
        );
        
        if (fuzzyMatch) {
          console.log("Strategy 4 successful - found fuzzy match:", fuzzyMatch);
          setResourceId(fuzzyMatch.id);
          onDataLoaded(fuzzyMatch.content || {});
          
          // Store offline copy
          const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
          localStorage.setItem(offlineKey, JSON.stringify(fuzzyMatch.content || {}));
          
          setIsOfflineMode(false);
          setIsLoading(false);
          return;
        }
        
        // If fuzzy matching failed, use the most recent entry
        const mostRecent = broadMatches[0];
        console.log("Strategy 4 fallback - using most recent resource:", mostRecent);
        setResourceId(mostRecent.id);
        onDataLoaded(mostRecent.content || {});
        
        // Store offline copy
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(mostRecent.content || {}));
        
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      // All strategies failed - initialize with empty data
      console.log("All resource lookup strategies failed, initializing with empty data");
      setResourceId(null);
      onDataLoaded({});
      setIsOfflineMode(false);
      
    } catch (error: any) {
      console.error("Error loading resource data:", error);
      setLoadError(error);
      
      // Show toast notification
      toast({
        title: "Problème de chargement",
        description: "Passage en mode temporaire. Vos modifications seront sauvegardées localement.",
        variant: "destructive"
      });
      
      // Try loading from local storage
      const loadedLocally = loadFromLocalStorage();
      if (!loadedLocally) {
        // If no local data either, initialize with empty data
        onDataLoaded({ offlineMode: true, _error: error.message });
      }
      
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
      setLastLoadTime(new Date());
    }
  }, [
    stepId, 
    substepTitle, 
    normalizedSubstepTitle, 
    resourceType, 
    onDataLoaded, 
    checkOfflineMode, 
    loadFromLocalStorage, 
    loadAttempts,
    toast
  ]);

  // Load data when component mounts or when session/parameters change
  useEffect(() => {
    console.log("Initializing resource data load, session:", !!session);
    // Reset load attempts when parameters change
    setLoadAttempts(0);
    loadResourceData(session);
  }, [session, stepId, substepTitle, resourceType, forceRefreshCount]);

  // Function to manually retry loading
  const retryLoading = useCallback(async () => {
    console.log("Manually retrying resource data load");
    // Reset offline mode before retrying
    setIsOfflineMode(false);
    
    // Clear any local errors
    setLoadError(null);
    
    // Get fresh session
    const freshSession = await fetchSession();
    loadResourceData(freshSession);
  }, [fetchSession, loadResourceData]);

  return {
    isLoading,
    isOfflineMode,
    resourceId,
    session,
    fetchSession,
    retryLoading,
    loadError,
    lastLoadTime,
    loadAttempts
  };
};
