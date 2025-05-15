
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useResourceSession } from "./useResourceSession";
import { useNetworkStatus } from "../useNetworkStatus";
import { toast } from "@/hooks/use-toast";

function getNormalizedSubstepTitle(stepId: number, title: string): string {
  console.log(`ResourceDataLoader: normalizing title for step ${stepId}: "${title}"`);
  
  // Pour l'étape 1 (Recherche)
  if (stepId === 1) {
    if (title.includes('_user_research') || title.includes('Recherche utilisateur')) {
      return "Recherche utilisateur";
    }
    
    if (title.includes('opportunité') || title.includes('_competitive')) {
      return "Définition de l'opportunité";
    }
  }
  
  // Pour l'étape 2 (Conception)
  if (stepId === 2) {
    // Map potential variations to canonical titles
    if (title === '_persona' || title === '_problemSolution' || title === '_empathy' || 
        title.includes('proposition') || title.includes('valeur')) {
      return 'Proposition de valeur';
    } 
    else if (title === '_mvp' || title === '_productStrategy' || title === '_roadmap' || 
              title.includes('stratégie') || title.includes('produit')) {
      return 'Stratégie produit';
    }
    else if (title.includes('_user_research') || title.includes('utilisateur')) {
      return 'Recherche utilisateur';
    }
    else if (title.includes('_competitive') || title.includes('concurrentielle')) {
      return 'Analyse concurrentielle';
    }
  }
  
  // Pour l'étape 3 (Développement)
  if (stepId === 3) {
    if (title.includes('_user_research') || title.includes('utilisateur')) {
      return 'Tests utilisateurs';
    }
  }
  
  // Default: strip any leading underscores
  const cleanedTitle = title.startsWith('_') ? title.substring(1) : title;
  return cleanedTitle;
}

/**
 * Hook to load resource data with offline support and error handling
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
  
  const { session, fetchSession } = useResourceSession();
  const { isOnline, isSupabaseConnected, checkSupabaseConnection } = useNetworkStatus();

  // Normalize substepTitle
  const normalizedSubstepTitle = getNormalizedSubstepTitle(stepId, substepTitle);

  // Fonction pour charger les données depuis le stockage local
  const loadFromLocalStorage = useCallback(() => {
    try {
      const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
      const storedData = localStorage.getItem(offlineKey);
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log("Données chargées depuis localStorage:", parsedData);
          
          // Marquer les données comme étant en mode hors ligne
          onDataLoaded({
            ...parsedData,
            offlineMode: true,
            _offlineLoadTime: new Date().toISOString()
          });
          
          setIsOfflineMode(true);
          return true;
        } catch (parseError) {
          console.error("Erreur d'analyse JSON lors du chargement local:", parseError);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors du chargement des données locales:", error);
      return false;
    }
  }, [stepId, normalizedSubstepTitle, resourceType, onDataLoaded]);

  // Fonction pour vérifier le mode hors ligne
  const checkOfflineMode = useCallback(async () => {
    // Vérifier la connectivité au début
    if (!isOnline) {
      console.log("Appareil hors ligne, passage en mode hors ligne");
      setIsOfflineMode(true);
      return true;
    }
    
    // Si en ligne, vérifier si Supabase est accessible
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Supabase inaccessible, passage en mode hors ligne");
      setIsOfflineMode(true);
      return true;
    }
    
    // Tout fonctionne normalement
    return false;
  }, [isOnline, checkSupabaseConnection]);
  
  // Fonction pour charger les données de ressource
  const loadResourceData = useCallback(async (currentSession: any = null) => {
    setLoadError(null);
    setIsLoading(true);

    try {
      console.log(`ResourceDataLoader: Loading data for stepId=${stepId}, substepTitle=${substepTitle}, normalizedTitle=${normalizedSubstepTitle}, resourceType=${resourceType}`);
      const isOffline = await checkOfflineMode();
      
      // Si nous sommes hors ligne, charger depuis le stockage local
      if (isOffline) {
        const loadedLocally = loadFromLocalStorage();
        if (!loadedLocally) {
          console.log("Aucune donnée locale disponible pour", stepId, normalizedSubstepTitle, resourceType);
          // Initialiser avec des données vides en mode hors ligne
          onDataLoaded({ offlineMode: true, _newResource: true });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Si nous sommes en ligne, essayer d'obtenir une session si aucune n'est fournie
      if (!currentSession) {
        try {
          const { data } = await supabase.auth.getSession();
          currentSession = data?.session;
          
          if (!currentSession) {
            console.warn("Non authentifié, passage en mode hors ligne");
            setIsOfflineMode(true);
            loadFromLocalStorage();
            setIsLoading(false);
            return;
          }
        } catch (authError) {
          console.error("Erreur lors de la récupération de session:", authError);
          setIsOfflineMode(true);
          loadFromLocalStorage();
          setIsLoading(false);
          return;
        }
      }
      
      // Maintenant, nous avons une session, essayons de charger les données
      console.log("Chargement des données pour", { stepId, normalizedSubstepTitle, resourceType });
      
      // Premier essai: recherche exacte avec le titre normalisé
      console.log("Try #1: Trying exact match with normalized title:", normalizedSubstepTitle);
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
        console.log("Found exact match with normalized title:", exactMatch);
        setResourceId(exactMatch.id);
        onDataLoaded(exactMatch.content || {});
        
        // Stocker également une copie locale pour le mode hors ligne
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(exactMatch.content || {}));
        
        // Bien indiquer que nous sommes en ligne
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
            
      // Deuxième essai: essayons avec le titre original (non normalisé)
      console.log("Try #2: Trying with original title:", substepTitle);
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
        console.log("Found match with original title:", originalMatch);
        setResourceId(originalMatch.id);
        onDataLoaded(originalMatch.content || {});
        
        // Stocker également une copie locale pour le mode hors ligne
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(originalMatch.content || {}));
        
        // Bien indiquer que nous sommes en ligne
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      // Troisième essai: recherche flexible par original_substep_title
      console.log("Try #3: Trying with original_substep_title field:", substepTitle);
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
        console.log("Found match using original_substep_title:", flexMatch);
        setResourceId(flexMatch.id);
        onDataLoaded(flexMatch.content || {});
        
        // Stocker également une copie locale pour le mode hors ligne
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(flexMatch.content || {}));
        
        // Bien indiquer que nous sommes en ligne
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      // Quatrième essai: recherche très large juste par step_id et type
      console.log("Try #4: Broad search by step_id and type only");
      const { data: broadMatches, error: broadError } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(5); // Get a few to check
        
      if (broadMatches && broadMatches.length > 0) {
        console.log("Found broad matches:", broadMatches);
        
        // Log all found substep titles for debugging
        console.log("Found substep titles:", broadMatches.map(m => m.substep_title));
        
        // Try to find a fuzzy match
        const fuzzyMatch = broadMatches.find(m => 
          m.substep_title.includes(substepTitle) || 
          (substepTitle && substepTitle.includes(m.substep_title)) ||
          m.substep_title.toLowerCase() === normalizedSubstepTitle.toLowerCase()
        );
        
        if (fuzzyMatch) {
          console.log("Found fuzzy match:", fuzzyMatch);
          setResourceId(fuzzyMatch.id);
          onDataLoaded(fuzzyMatch.content || {});
          
          // Store offline copy
          const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
          localStorage.setItem(offlineKey, JSON.stringify(fuzzyMatch.content || {}));
          
          setIsOfflineMode(false);
          setIsLoading(false);
          return;
        }
        
        // If all else fails, just use the most recent one
        const mostRecent = broadMatches[0];
        console.log("No fuzzy match, using most recent:", mostRecent);
        setResourceId(mostRecent.id);
        onDataLoaded(mostRecent.content || {});
        
        // Store offline copy
        const offlineKey = `offline_resource_${stepId}_${normalizedSubstepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(mostRecent.content || {}));
        
        setIsOfflineMode(false);
        setIsLoading(false);
        return;
      }
      
      console.log("No resource found after all attempts, initializing with empty data");
      setResourceId(null);
      onDataLoaded({});
      setIsOfflineMode(false);
      
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      setLoadError(error);
      
      // Ajouter une notification pour informer l'utilisateur du problème
      toast({
        title: "Problème de chargement des données",
        description: "Passage en mode hors ligne temporaire. Vos modifications seront sauvegardées localement.",
        variant: "destructive"
      });
      
      // En cas d'erreur, essayer le mode hors ligne
      const loadedLocally = loadFromLocalStorage();
      if (!loadedLocally) {
        // Si nous n'avons pas de données locales non plus, initialiser avec des données vides
        onDataLoaded({ offlineMode: true, _error: error.message });
      }
      
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
      setLastLoadTime(new Date());
    }
  }, [stepId, substepTitle, normalizedSubstepTitle, resourceType, onDataLoaded, checkOfflineMode, loadFromLocalStorage]);

  // Charger les données lors du montage ou lorsque la session change
  useEffect(() => {
    console.log("Initialisation du chargement des données, session:", !!session);
    loadResourceData(session);
  }, [session, stepId, substepTitle, resourceType, forceRefreshCount]);

  // Fonction pour réessayer manuellement le chargement
  const retryLoading = useCallback(async () => {
    console.log("Tentative de rechargement des données");
    // Réinitialiser l'état hors ligne avant de réessayer
    setIsOfflineMode(false);
    
    // Rafraîchir d'abord la session
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
    lastLoadTime
  };
};
