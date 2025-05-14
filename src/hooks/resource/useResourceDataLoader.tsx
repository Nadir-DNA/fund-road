
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useResourceSession } from "./useResourceSession";
import { useNetworkStatus } from "../useNetworkStatus";
import { toast } from "@/components/ui/use-toast";

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

  // Fonction pour charger les données depuis le stockage local
  const loadFromLocalStorage = useCallback(() => {
    try {
      const offlineKey = `offline_resource_${stepId}_${substepTitle}_${resourceType}`;
      const storedData = localStorage.getItem(offlineKey);
      
      if (storedData) {
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
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors du chargement des données locales:", error);
      return false;
    }
  }, [stepId, substepTitle, resourceType, onDataLoaded]);

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
      const isOffline = await checkOfflineMode();
      
      // Si nous sommes hors ligne, charger depuis le stockage local
      if (isOffline) {
        const loadedLocally = loadFromLocalStorage();
        if (!loadedLocally) {
          console.log("Aucune donnée locale disponible pour", stepId, substepTitle, resourceType);
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
      console.log("Chargement des données pour", { stepId, substepTitle, resourceType });
      
      // Modification clé : utiliser order + limit(1) au lieu de maybeSingle
      // pour garantir que nous obtenons toujours un seul résultat (le plus récent)
      const { data: resources, error } = await supabase
        .from('user_resources')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', resourceType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();  // Utilisez single() car limit(1) garantit un seul résultat
      
      if (error) {
        // Vérification spécifique pour l'erreur "aucune ligne trouvée"
        if (error.code === 'PGRST116') {
          console.log("Aucune ressource trouvée, initialisation avec des données vides");
          setResourceId(null);
          onDataLoaded({});
          
          // Puisque c'est normal de ne pas trouver de ressource (première fois),
          // ne pas passer en mode hors ligne
          setIsOfflineMode(false);
          
        } else {
          console.error("Erreur lors du chargement des données:", error);
          throw new Error(`Erreur de chargement: ${error.message}`);
        }
      } else if (resources) {
        // Ressource trouvée avec succès
        console.log("Données chargées depuis Supabase:", resources);
        setResourceId(resources.id);
        onDataLoaded(resources.content || {});
        
        // Stocker également une copie locale pour le mode hors ligne
        const offlineKey = `offline_resource_${stepId}_${substepTitle}_${resourceType}`;
        localStorage.setItem(offlineKey, JSON.stringify(resources.content || {}));
        
        // Bien indiquer que nous sommes en ligne
        setIsOfflineMode(false);
      }
      
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
  }, [stepId, substepTitle, resourceType, onDataLoaded, checkOfflineMode, loadFromLocalStorage]);

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
