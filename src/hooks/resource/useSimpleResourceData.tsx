
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useReliableSave } from './useReliableSave';
import { normalizeSubstepTitle, getPossibleTitles } from "@/utils/substepNormalization";
import { safeObjectMerge, isValidObject } from "@/utils/objectUtils";

interface SimpleResourceDataOptions {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  defaultValues?: Record<string, any>;
  onDataLoaded?: (data: Record<string, any>) => void;
  onDataSaved?: (data: Record<string, any>) => void;
}

export function useSimpleResourceData({
  stepId,
  substepTitle,
  resourceType,
  defaultValues = {},
  onDataLoaded,
  onDataSaved
}: SimpleResourceDataOptions) {
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    save,
    saveManual,
    isSaving,
    lastSaveStatus,
    loadFromLocal
  } = useReliableSave({
    stepId,
    substepTitle,
    resourceType,
    onSuccess: (data) => {
      console.log('useSimpleResourceData: Sauvegarde réussie, resourceId:', data.id);
      setResourceId(data.id);
      if (onDataSaved) {
        onDataSaved(data);
      }
    },
    onError: (error) => {
      console.error('useSimpleResourceData: Erreur de sauvegarde:', error);
    }
  });

  // Vérification d'authentification améliorée
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('useSimpleResourceData: Vérification de l\'authentification...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('useSimpleResourceData: Erreur session:', error);
          setIsAuthenticated(false);
          return;
        }
        
        const isAuth = !!data.session;
        console.log('useSimpleResourceData: État authentification:', isAuth);
        setIsAuthenticated(isAuth);
        
        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('useSimpleResourceData: Changement auth:', event, !!session);
            setIsAuthenticated(!!session);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('useSimpleResourceData: Connexion détectée, synchronisation...');
              syncLocalData();
            }
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('useSimpleResourceData: Erreur vérification auth:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Recherche de ressources existantes
  const findUserResource = useCallback(async (userId: string) => {
    const possibleTitles = getPossibleTitles(stepId, substepTitle);
    console.log('useSimpleResourceData: Recherche ressource avec titres:', possibleTitles);
    
    for (const title of possibleTitles) {
      try {
        const { data, error } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', userId)
          .eq('step_id', stepId)
          .eq('substep_title', title)
          .eq('resource_type', resourceType)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (!error && data) {
          console.log('useSimpleResourceData: Ressource trouvée:', data.id, 'avec titre:', title);
          return data;
        }
      } catch (err) {
        console.warn('useSimpleResourceData: Erreur recherche titre:', title, err);
        continue;
      }
    }
    console.log('useSimpleResourceData: Aucune ressource trouvée');
    return null;
  }, [stepId, substepTitle, resourceType]);

  // Chargement des données avec gestion améliorée des arrays et objets
  const loadData = useCallback(async () => {
    console.log('useSimpleResourceData: Début chargement données...');
    setIsLoading(true);
    
    try {
      let loadedData = defaultValues;
      let foundResourceId = null;
      
      // Si authentifié, essayer de charger depuis la base
      if (isAuthenticated) {
        console.log('useSimpleResourceData: Chargement depuis la base...');
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const userResource = await findUserResource(sessionData.session.user.id);
          
          if (userResource && isValidObject(userResource.content)) {
            // Traitement spécial pour les arrays et objets complexes
            const content = userResource.content;
            
            // Gestion des différents formats de données
            if (Array.isArray(content)) {
              loadedData = content;
            } else if (typeof content === 'object' && content !== null) {
              // Merger intelligemment avec les valeurs par défaut
              loadedData = safeObjectMerge(defaultValues, content);
              
              // Gestion spéciale pour les ressources avec arrays
              Object.keys(content).forEach(key => {
                if (Array.isArray(content[key])) {
                  loadedData[key] = content[key];
                }
              });
            } else {
              loadedData = safeObjectMerge(defaultValues, content);
            }
            
            foundResourceId = userResource.id;
            console.log('useSimpleResourceData: Données chargées depuis la base:', userResource.id);
          }
        }
      }
      
      // Si pas de données en base, essayer le local
      if (!foundResourceId) {
        console.log('useSimpleResourceData: Tentative chargement local...');
        const localData = loadFromLocal();
        if (localData?.data && isValidObject(localData.data)) {
          // Même logique pour les données locales
          if (Array.isArray(localData.data)) {
            loadedData = localData.data;
          } else if (typeof localData.data === 'object') {
            loadedData = safeObjectMerge(defaultValues, localData.data);
            
            // Préserver les arrays
            Object.keys(localData.data).forEach(key => {
              if (Array.isArray(localData.data[key])) {
                loadedData[key] = localData.data[key];
              }
            });
          }
          console.log('useSimpleResourceData: Données chargées depuis le local');
        }
      }
      
      console.log('useSimpleResourceData: Données finales chargées:', loadedData);
      setFormData(loadedData);
      setResourceId(foundResourceId);
      
      if (onDataLoaded) {
        onDataLoaded(loadedData);
      }
      
    } catch (error) {
      console.error('useSimpleResourceData: Erreur chargement données:', error);
      
      const localData = loadFromLocal();
      const fallbackData = localData?.data && isValidObject(localData.data) 
        ? (Array.isArray(localData.data) ? localData.data : safeObjectMerge(defaultValues, localData.data))
        : defaultValues;
      setFormData(fallbackData);
    } finally {
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [isAuthenticated, defaultValues, findUserResource, loadFromLocal, onDataLoaded]);

  // Synchronisation des données locales
  const syncLocalData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const localData = loadFromLocal();
    if (localData?.data) {
      console.log('useSimpleResourceData: Synchronisation des données locales');
      await save(localData.data, resourceId, { priority: 'high' });
    }
  }, [isAuthenticated, loadFromLocal, save, resourceId]);

  // Chargement initial
  useEffect(() => {
    if (isAuthenticated !== null && !isInitializedRef.current) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Sauvegarde automatique améliorée avec gestion des types complexes
  const handleFormChange = useCallback((field: string, value: any) => {
    console.log(`useSimpleResourceData: Changement de champ détecté: ${field} =`, value);
    
    setFormData((prev) => {
      let newData;
      
      // Gestion spéciale pour les arrays (ressources comme MonetizationTestGrid)
      if (Array.isArray(value)) {
        newData = value;
      } else if (Array.isArray(prev)) {
        // Si les données précédentes sont un array, on les remplace complètement
        newData = value;
      } else {
        // Cas standard d'objet
        newData = safeObjectMerge(prev, { [field]: value });
      }
      
      // Nettoyer le timeout précédent
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Sauvegarde automatique
      if (isInitializedRef.current) {
        console.log('useSimpleResourceData: Programmation sauvegarde automatique pour:', field);
        saveTimeoutRef.current = setTimeout(() => {
          console.log('useSimpleResourceData: Déclenchement sauvegarde automatique');
          save(newData, resourceId, { priority: 'normal' });
        }, 800); // Délai optimisé
      }
      
      return newData;
    });
  }, [save, resourceId]);

  // Sauvegarde manuelle
  const handleManualSave = useCallback(async () => {
    console.log('useSimpleResourceData: Sauvegarde manuelle déclenchée');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    await saveManual(formData, resourceId);
  }, [saveManual, formData, resourceId]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    isLoading,
    isSaving,
    isAuthenticated,
    lastSaveStatus,
    handleFormChange,
    handleManualSave,
    syncLocalData,
    queueLength: 0
  };
}
