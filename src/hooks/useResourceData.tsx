
import { useEffect, useMemo, useRef, useState } from 'react';
import { useResourceDataLoader } from "./resource/useResourceDataLoader";
import { useResourceFormState } from "./resource/useResourceFormState";
import { useResourceActions } from "./resource/useResourceActions";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { saveLastSaveTime } from "@/utils/navigationUtils";

/**
 * Hook for managing resource data with resilience to network issues
 */
export const useResourceData = (
  stepId: number, 
  substepTitle: string,
  resourceType: string,
  defaultValues?: any,
  onDataSaved?: (data: any) => void
) => {
  // Protection against multiple calls to onDataSaved
  const hasCalledInitialDataSavedRef = useRef(false);
  const isInitializingRef = useRef(true);
  const firstLoadCompletedRef = useRef(false);
  const previousDataStringRef = useRef("");
  const manualSaveRequestedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formSubmittedRef = useRef(false);
  const lastSaveAttemptRef = useRef(new Date());
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'success' | 'error' | 'pending' | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  // Initialize default values with memoization to prevent loops
  const initialValues = useMemo(() => defaultValues || {}, []);

  // Manuellement augmenter les tentatives pour forcer une mise à jour
  const retryLoading = () => {
    console.log("Forçage d'une nouvelle tentative de chargement");
    setAttempts(prev => prev + 1);
  };
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          console.log("Utilisateur authentifié:", data.session.user.id);
          setUserId(data.session.user.id);
        } else {
          console.log("Aucun utilisateur authentifié");
        }
      } catch (err) {
        console.warn("Erreur vérification auth:", err);
      }
    };
    
    checkAuth();
  }, [attempts]);
  
  // Use the form state management hook with protection against loops
  const {
    formData,
    setFormData,
    handleFormChange,
    triggerManualUpdate
  } = useResourceFormState(initialValues, (data) => {
    // Skip callbacks during initialization or loops
    if (!isInitializingRef.current && onDataSaved) {
      // Only trigger onDataSaved for manual saves or significant changes
      const currentDataString = JSON.stringify(data);
      if ((manualSaveRequestedRef.current || currentDataString !== previousDataStringRef.current) && 
          firstLoadCompletedRef.current) {
        console.log("Données modifiées après initialisation, appel de onDataSaved");
        previousDataStringRef.current = currentDataString;
        onDataSaved(data);
        // Reset the manual save flag
        manualSaveRequestedRef.current = false;
      }
    }
  });

  // Use the data loader hook
  const {
    isLoading,
    isOfflineMode,
    resourceId,
    session,
    fetchSession,
    retryLoading: loaderRetry
  } = useResourceDataLoader(stepId, substepTitle, resourceType, (loadedData) => {
    // Avoid cascade triggers during initial loading
    isInitializingRef.current = true;
    console.log("Données chargées depuis resourceDataLoader:", loadedData);
    
    // Check if we really need to update (avoid unnecessary renders)
    if (JSON.stringify(loadedData) !== JSON.stringify(formData)) {
      setFormData(loadedData);
      
      // If we're in offline mode and this is the first load, show warning
      if (loadedData.offlineMode && !showOfflineWarning) {
        setShowOfflineWarning(true);
        toast({
          title: "Mode hors ligne",
          description: "Vos données seront enregistrées localement et synchronisées ultérieurement",
          variant: "default"
        });
      }
    }
    
    // Delay the end of initialization to avoid loops
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      isInitializingRef.current = false;
      firstLoadCompletedRef.current = true;
      debounceTimerRef.current = null;
    }, 500);
  }, attempts);

  // Use the resource actions hook with manual save tracking
  const {
    isSaving,
    handleSave,
    handleManualSave: originalHandleManualSave
  } = useResourceActions(
    formData,
    stepId, 
    substepTitle,
    resourceType,
    resourceId
  );
  
  // If offline, save to localStorage
  const saveOfflineData = (data: any) => {
    try {
      const offlineKey = `offline_resource_${stepId}_${substepTitle}_${resourceType}`;
      const dataToSave = {
        ...data,
        _lastSaved: new Date().toISOString(),
        _offlineSaved: true
      };
      
      localStorage.setItem(offlineKey, JSON.stringify(dataToSave));
      console.log("Données sauvegardées hors ligne:", dataToSave);
      setLastSaveStatus('success');
      saveLastSaveTime();
      return true;
    } catch (err) {
      console.error("Échec sauvegarde hors ligne:", err);
      setLastSaveStatus('error');
      return false;
    }
  };

  // Vérifier si les données ont changé récemment
  const hasDataChanged = () => {
    try {
      const currentDataString = JSON.stringify(formData || {});
      return currentDataString !== previousDataStringRef.current && 
             currentDataString.length > 20; // Ignorer les données vides/minimes
    } catch (e) {
      return false;
    }
  };
  
  // Wrap the manual save handler to set our flag and enforce authentication
  const handleManualSave = async (session: any) => {
    console.log("Sauvegarde manuelle demandée");
    lastSaveAttemptRef.current = new Date();
    formSubmittedRef.current = true;
    setLastSaveStatus('pending');
    
    if (isOfflineMode) {
      console.log("Mode hors ligne actif, sauvegarde locale");
      const success = saveOfflineData(formData);
      if (success) {
        toast({
          title: "Enregistré hors ligne",
          description: "Vos données seront synchronisées quand la connexion sera rétablie",
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer vos données hors ligne",
          variant: "destructive"
        });
        return false;
      }
    }
    
    if (!session) {
      // Check for current session
      try {
        console.log("Tentative de récupération de session");
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.warn("Aucune session trouvée, authentification requise");
          toast({
            title: "Authentification requise",
            description: "Vous devez être connecté pour sauvegarder vos données.",
            variant: "destructive"
          });
          
          // Sauvegarde temporaire en local avant redirection
          saveOfflineData({
            ...formData,
            _pendingAuth: true,
            _authRedirectTime: new Date().toISOString()
          });
          
          setTimeout(() => navigate("/auth"), 1500);
          return false;
        }
        console.log("Session récupérée avec succès");
        session = data.session;
      } catch (err) {
        console.error("Échec vérification auth:", err);
        
        // Passé en mode hors ligne en cas d'erreur
        setShowOfflineWarning(true);
        return saveOfflineData(formData);
      }
    }
    
    manualSaveRequestedRef.current = true;
    const saveResult = await originalHandleManualSave(session);
    
    if (saveResult) {
      setLastSaveStatus('success');
      saveLastSaveTime();
      previousDataStringRef.current = JSON.stringify(formData || {});
      toast({
        title: "Enregistrement réussi",
        description: "Vos données ont été sauvegardées avec succès",
        variant: "default"
      });
    } else {
      setLastSaveStatus('error');
      toast({
        title: "Échec de l'enregistrement",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive"
      });
    }
    
    return saveResult;
  };

  // Add periodic auto-save for safety
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // Only auto-save if data has changed and we're not in initialization
      if (!isInitializingRef.current && 
          hasDataChanged() && 
          !isSaving && 
          firstLoadCompletedRef.current && 
          (session || isOfflineMode)) {
            
        console.log("Auto-sauvegarde périodique");
        if (isOfflineMode) {
          saveOfflineData(formData);
        } else if (session) {
          handleSave(session);
        }
      }
    }, 60000); // Auto-save toutes les 60 secondes si nécessaire
    
    return () => clearInterval(autoSaveInterval);
  }, [formData, session, isOfflineMode, isSaving]);

  // Initial values effect - run ONCE in a controlled way
  useEffect(() => {
    // Only process if we have meaningful initial values and haven't called onDataSaved yet
    if (
      initialValues && 
      Object.keys(initialValues).length > 0 && 
      onDataSaved && 
      !hasCalledInitialDataSavedRef.current &&
      !isInitializingRef.current &&
      firstLoadCompletedRef.current
    ) {
      console.log("Configuration initiale terminée, appel sécurisé de onDataSaved");
      
      // Delay to avoid initialization cascades
      setTimeout(() => {
        if (!hasCalledInitialDataSavedRef.current) {
          hasCalledInitialDataSavedRef.current = true;
          
          // Only trigger after meaningful data changes
          const initialDataString = JSON.stringify(initialValues);
          if (initialDataString !== previousDataStringRef.current && initialDataString.length > 10) {
            previousDataStringRef.current = initialDataString;
            console.log("Premier et unique appel initial onDataSaved");
            onDataSaved(initialValues);
          }
        }
      }, 800);
    }
  }, [initialValues, onDataSaved, firstLoadCompletedRef.current]);

  // Auto-save effect triggered when form data changes and user is authenticated
  useEffect(() => {
    // Skip during initialization
    if (isInitializingRef.current || !userId) return;
    
    // Debounce to avoid too many saves
    const currentDataString = JSON.stringify(formData);
    if (currentDataString !== previousDataStringRef.current && 
        currentDataString.length > 20 &&
        firstLoadCompletedRef.current) {
      
      console.log("Données modifiées, auto-sauvegarde programmée");
      const saveTimeout = setTimeout(() => {
        // If we're online and have a session, use the online save
        if (!isOfflineMode && session) {
          console.log("Auto-sauvegarde en ligne");
          handleSave(session);
        } 
        // Otherwise save to local storage
        else if (formData) {
          console.log("Auto-sauvegarde hors ligne");
          saveOfflineData(formData);
        }
        
        previousDataStringRef.current = currentDataString;
      }, 2000); // 2 second debounce
      
      return () => clearTimeout(saveTimeout);
    }
  }, [formData, session, userId, isOfflineMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    isLoading,
    isSaving,
    isOfflineMode,
    showOfflineWarning,
    lastSaveStatus,
    handleFormChange,
    handleSave,
    handleManualSave,
    setFormData: triggerManualUpdate,
    session,
    userId,
    retryLoading: () => {
      loaderRetry();
      retryLoading();
    }
  };
};
