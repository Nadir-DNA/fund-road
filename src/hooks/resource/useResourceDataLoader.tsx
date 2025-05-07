
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useResourceSession } from "./useResourceSession";
import { saveLastPath } from "@/utils/navigationUtils";

const STORAGE_KEY_PREFIX = 'offline_resource_';
const AUTH_TIMEOUT = 4000; // Augmenté de 2s à 4s
const FETCH_TIMEOUT = 5000; // Augmenté de 3s à 5s

/**
 * Hook pour charger les données de ressource à partir de la base de données, du modèle ou du cache hors ligne
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
  const [showAuthRedirection, setShowAuthRedirection] = useState(false);
  const { session, fetchSession } = useResourceSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const failedAttemptsRef = useRef(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const authCheckCompletedRef = useRef(false);
  
  // Vérifier le cache hors ligne
  const getOfflineCache = useCallback(() => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${stepId}_${substepTitle}_${resourceType}`;
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.warn("Erreur de lecture du cache hors ligne:", err);
    }
    return null;
  }, [stepId, substepTitle, resourceType]);
  
  // Enregistrer dans le cache hors ligne
  const saveToOfflineCache = useCallback((data: any) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${stepId}_${substepTitle}_${resourceType}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log("Données sauvegardées dans le cache hors ligne");
      return true;
    } catch (err) {
      console.warn("Échec de l'enregistrement hors ligne:", err);
      return false;
    }
  }, [stepId, substepTitle, resourceType]);

  // Fonction pour rediriger vers la page d'authentification
  const redirectToAuth = useCallback(() => {
    if (showAuthRedirection) return;
    
    console.log("Authentification nécessaire pour accéder aux ressources");
    setShowAuthRedirection(true);
    
    // Sauvegarde du chemin actuel pour redirection après connexion
    saveLastPath(window.location.pathname + window.location.search);
    
    toast({
      title: "Authentification requise",
      description: "Veuillez vous connecter pour accéder à vos ressources.",
      variant: "destructive",
      duration: 5000
    });
    
    // Attendre un peu pour que le toast soit visible
    setTimeout(() => navigate('/auth'), 1000);
  }, [navigate, toast, showAuthRedirection]);

  // Fonction de chargement des données avec mémorisation
  const loadResourceData = useCallback(async () => {
    // État de chargement initial - TOUJOURS vrai au départ
    setIsLoading(true);
    console.log(`[Tentative ${loadAttempts + 1}] Chargement des données pour: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}`);
    
    // Timeout de sécurité pour forcer la sortie de l'état de chargement après 5 secondes maximum
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log("⚠️ Timeout de sécurité déclenché - forçage de la fin du chargement");
        setIsLoading(false);
        
        // Passer en mode hors ligne après le timeout
        setIsOfflineMode(true);
        
        // Utiliser le cache hors ligne ou les valeurs par défaut
        const offlineData = getOfflineCache() || { initialized: true, offlineMode: true };
        if (onDataLoaded) {
          onDataLoaded(offlineData);
        }
      }
    }, 5000); // Augmenté de 3s à 5s
    
    // Vérifier d'abord le cache hors ligne en cas de problèmes de connexion
    const offlineData = getOfflineCache();
    if (offlineData) {
      console.log("Données trouvées dans le cache hors ligne, utilisation pendant la tentative de connexion");
      // Retourner immédiatement les données en cache mais ne pas quitter l'état de chargement
      if (onDataLoaded) {
        onDataLoaded(offlineData);
      }
    }
    
    try {
      // Obtenir la session actuelle - mais limiter le temps d'attente
      let currentSession = null;
      try {
        currentSession = session || await Promise.race([
          fetchSession().catch(() => null),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout d'authentification")), AUTH_TIMEOUT))
        ]);
      } catch (err) {
        console.warn("Échec de récupération de la session (timeout ou erreur):", err);
        // Continuer avec une session nulle, utilisera le mode hors ligne
      }
      
      if (!currentSession) {
        console.log("Aucune session d'authentification trouvée pour le chargement des données de ressource");
        failedAttemptsRef.current++;
        
        // Si aucune session après deux tentatives, rediriger vers l'authentification
        if (failedAttemptsRef.current >= 2 && !authCheckCompletedRef.current) {
          authCheckCompletedRef.current = true;
          redirectToAuth();
          return { content: null, resourceId: null };
        }
        
        // Passer en mode hors ligne
        setIsOfflineMode(true);
        console.log("Passage en mode hors ligne en raison de problèmes d'authentification");
        
        // Utiliser le cache hors ligne ou les valeurs par défaut
        const fallbackData = offlineData || { initialized: true, offlineMode: true };
        if (onDataLoaded) {
          onDataLoaded(fallbackData);
        }
        
        setIsLoading(false);
        return { content: fallbackData, resourceId: null };
      }
      
      // Si nous avons une session, essayer de récupérer les données avec un court timeout
      if (currentSession) {
        try {
          // Essayer de récupérer la ressource utilisateur avec un timeout
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
          
          // Ajouter un timeout à la récupération - augmenté de 2s à 5s
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Requête expirée")), FETCH_TIMEOUT);
          });
          
          // Faire course entre la récupération et le timeout
          const userResources = await Promise.race([fetchPromise, timeoutPromise])
            .catch(err => {
              console.error("Erreur ou timeout lors de la récupération des ressources:", err);
              failedAttemptsRef.current++;
              return null;
            });

          if (userResources && Array.isArray(userResources) && userResources.length > 0) {
            // Trier par updated_at dans l'ordre décroissant pour obtenir le plus récent
            const mostRecent = userResources.sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0];
            
            const content = mostRecent.content || {};
            console.log("Ressource utilisateur trouvée:", mostRecent.id);
            setResourceId(mostRecent.id);
            
            // Sauvegarder dans le cache hors ligne pour une utilisation future
            saveToOfflineCache(content);
            
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            
            setIsLoading(false);
            setIsOfflineMode(false); // S'assurer que le mode hors ligne est désactivé
            
            if (onDataLoaded) {
              onDataLoaded(content);
            }
            
            return { content, resourceId: mostRecent.id };
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des ressources utilisateur:", err);
        }
      }

      // Si aucune ressource utilisateur trouvée, utiliser les données hors ligne ou par défaut
      const defaultContent = offlineData || { initialized: true, offlineMode: true };
      
      // Sauvegarder le contenu par défaut dans le cache pour une utilisation future
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
      console.error("Erreur de chargement des données de ressource:", error);
      
      // Passer immédiatement en mode hors ligne après un échec
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
    isOfflineMode,
    redirectToAuth
  ]);

  // Effet pour charger les données de ressource au montage ou lorsque des paramètres clés changent
  useEffect(() => {
    isMountedRef.current = true;
    
    // Toujours commencer avec l'état de chargement
    setIsLoading(true);
    console.log("Début du chargement des données de ressource...");
    
    // Définir un timeout de sécurité pour le chargement initial
    const loadTimeout = setTimeout(() => {
      // Si toujours en chargement après le timeout, utiliser le mode hors ligne
      if (isMountedRef.current && isLoading) {
        console.log("Timeout de chargement initial, forçage du mode hors ligne");
        setIsOfflineMode(true);
        setIsLoading(false);
        const cachedData = getOfflineCache() || { initialized: true, offlineMode: true };
        if (onDataLoaded) {
          onDataLoaded(cachedData);
        }
      }
    }, 5000); // Augmenté de 3s à 5s
    
    loadResourceData().then((result) => {
      if (!isMountedRef.current) return;
      
      if (result && result.content && onDataLoaded) {
        onDataLoaded(result.content);
        if (result.resourceId) {
          setResourceId(result.resourceId);
        }
      }
      
      // S'assurer que le chargement est défini sur false même s'il y a une erreur
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

  // Ajouter une fonction pour réessayer le chargement
  const retryLoading = useCallback(() => {
    console.log("Réessai manuel du chargement des données");
    setIsOfflineMode(false);
    failedAttemptsRef.current = 0;
    authCheckCompletedRef.current = false;
    setLoadAttempts(prevAttempts => prevAttempts + 1);
  }, []);

  return {
    isLoading,
    isOfflineMode,
    resourceId,
    setResourceId,
    session,
    fetchSession,
    retryLoading,
    redirectToAuth
  };
};
