import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { normalizeSubstepTitle, getPossibleTitles } from "@/utils/substepNormalization";

interface SaveQueueItem {
  id: string;
  formData: any;
  stepId: number;
  substepTitle: string;
  resourceType: string;
  resourceId?: string | null;
  attempts: number;
  lastAttempt?: Date;
  priority: 'high' | 'normal' | 'low';
}

interface ReliableSaveOptions {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useReliableSave({
  stepId,
  substepTitle,
  resourceType,
  onSuccess,
  onError
}: ReliableSaveOptions) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'success' | 'error' | 'pending' | null>(null);
  const saveQueueRef = useRef<SaveQueueItem[]>([]);
  const isProcessingQueueRef = useRef(false);
  const processQueueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sauvegarde locale systématique améliorée
  const saveToLocal = useCallback((data: any, metadata: any = {}) => {
    try {
      const localKey = `resource_${stepId}_${substepTitle}_${resourceType}`;
      const saveData = {
        data,
        metadata: {
          ...metadata,
          stepId,
          substepTitle,
          resourceType,
          savedAt: new Date().toISOString(),
          version: Date.now()
        }
      };
      
      localStorage.setItem(localKey, JSON.stringify(saveData));
      console.log(`useReliableSave: Données sauvegardées localement: ${localKey}`);
      return true;
    } catch (error) {
      console.error('useReliableSave: Erreur sauvegarde locale:', error);
      return false;
    }
  }, [stepId, substepTitle, resourceType]);

  // Récupération depuis le stockage local
  const loadFromLocal = useCallback(() => {
    try {
      const localKey = `resource_${stepId}_${substepTitle}_${resourceType}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`useReliableSave: Données récupérées localement: ${localKey}`);
        return parsed;
      }
    } catch (error) {
      console.error('useReliableSave: Erreur récupération locale:', error);
    }
    return null;
  }, [stepId, substepTitle, resourceType]);

  // Vérification de session avec retry améliorée
  const getValidSession = useCallback(async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`useReliableSave: Tentative ${i + 1} de récupération de session`);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error(`useReliableSave: Erreur session tentative ${i + 1}:`, error);
          if (i === retries - 1) return null;
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1))); // Délai progressif
          continue;
        }
        
        if (data.session) {
          console.log('useReliableSave: Session valide récupérée');
          return data.session;
        }
        
        console.log('useReliableSave: Aucune session active');
        return null;
      } catch (error) {
        console.error(`useReliableSave: Exception session tentative ${i + 1}:`, error);
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
    return null;
  }, []);

  // Recherche flexible de ressources existantes
  const findExistingResource = useCallback(async (userId: string) => {
    const possibleTitles = getPossibleTitles(stepId, substepTitle);
    console.log('useReliableSave: Recherche ressource avec titres possibles:', possibleTitles);
    
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
          
        if (error && error.code !== 'PGRST116') {
          console.warn(`useReliableSave: Erreur recherche avec titre "${title}":`, error);
          continue;
        }
        
        if (data) {
          console.log(`useReliableSave: Ressource trouvée avec titre "${title}":`, data.id);
          return data;
        }
      } catch (err) {
        console.warn(`useReliableSave: Exception recherche avec titre "${title}":`, err);
        continue;
      }
    }
    
    console.log('useReliableSave: Aucune ressource existante trouvée');
    return null;
  }, [stepId, substepTitle, resourceType]);

  // Sauvegarde en base de données améliorée
  const saveToDatabase = useCallback(async (formData: any, resourceId?: string | null) => {
    try {
      console.log('useReliableSave: Début sauvegarde en base...');
      
      // Vérifier la session avant chaque sauvegarde avec retry
      const session = await getValidSession();
      if (!session) {
        throw new Error('Pas de session active après retry');
      }

      const userId = session.user.id;
      const normalizedTitle = normalizeSubstepTitle(stepId, substepTitle);
      
      let result;
      
      if (resourceId) {
        // Mise à jour existante
        console.log('useReliableSave: Mise à jour ressource existante:', resourceId);
        result = await supabase
          .from('user_resources')
          .update({
            content: formData,
            updated_at: new Date().toISOString(),
            substep_title: normalizedTitle,
            original_substep_title: substepTitle
          })
          .eq('id', resourceId)
          .select()
          .single();
      } else {
        // Chercher une ressource existante
        const existingResource = await findExistingResource(userId);
        
        if (existingResource) {
          // Mettre à jour la ressource existante
          console.log('useReliableSave: Mise à jour ressource trouvée:', existingResource.id);
          result = await supabase
            .from('user_resources')
            .update({
              content: formData,
              updated_at: new Date().toISOString(),
              substep_title: normalizedTitle,
              original_substep_title: substepTitle
            })
            .eq('id', existingResource.id)
            .select()
            .single();
        } else {
          // Créer une nouvelle ressource
          console.log('useReliableSave: Création nouvelle ressource');
          result = await supabase
            .from('user_resources')
            .insert({
              user_id: userId,
              step_id: stepId,
              substep_title: normalizedTitle,
              original_substep_title: substepTitle,
              resource_type: resourceType,
              content: formData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
        }
      }
      
      if (result.error) {
        throw result.error;
      }
      
      console.log('useReliableSave: Sauvegarde base de données réussie:', result.data.id);
      return result.data;
    } catch (error) {
      console.error('useReliableSave: Erreur sauvegarde base de données:', error);
      throw error;
    }
  }, [stepId, substepTitle, resourceType, getValidSession, findExistingResource]);

  // Ajout à la queue de sauvegarde
  const addToSaveQueue = useCallback((formData: any, resourceId?: string | null, priority: 'high' | 'normal' | 'low' = 'normal') => {
    const queueItem: SaveQueueItem = {
      id: `${Date.now()}_${Math.random()}`,
      formData,
      stepId,
      substepTitle,
      resourceType,
      resourceId,
      attempts: 0,
      priority
    };
    
    saveQueueRef.current.push(queueItem);
    console.log('useReliableSave: Ajouté à la queue de sauvegarde:', queueItem.id, 'Queue length:', saveQueueRef.current.length);
    
    // Démarrer le traitement immédiatement
    processQueue();
  }, [stepId, substepTitle, resourceType]);

  // Traitement de la queue de sauvegarde amélioré
  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || saveQueueRef.current.length === 0) {
      return;
    }
    
    console.log('useReliableSave: Début traitement queue, items:', saveQueueRef.current.length);
    isProcessingQueueRef.current = true;
    
    try {
      // Trier par priorité et date
      saveQueueRef.current.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      while (saveQueueRef.current.length > 0) {
        const item = saveQueueRef.current[0];
        
        try {
          console.log(`useReliableSave: Traitement queue: ${item.id}, tentative ${item.attempts + 1}`);
          
          const savedData = await saveToDatabase(item.formData, item.resourceId);
          
          // Succès - retirer de la queue
          saveQueueRef.current.shift();
          
          if (onSuccess) {
            onSuccess(savedData);
          }
          
          setLastSaveStatus('success');
          console.log('useReliableSave: Item traité avec succès:', item.id);
          
        } catch (error) {
          item.attempts++;
          item.lastAttempt = new Date();
          
          console.error(`useReliableSave: Erreur traitement item ${item.id}, tentative ${item.attempts}:`, error);
          
          // Si trop de tentatives, abandonner
          if (item.attempts >= 3) {
            console.error(`useReliableSave: Abandon après ${item.attempts} tentatives:`, error);
            saveQueueRef.current.shift();
            
            if (onError) {
              onError(error);
            }
            
            setLastSaveStatus('error');
          } else {
            // Réessayer plus tard
            console.log(`useReliableSave: Réessaiera plus tard, tentative ${item.attempts}/3`);
            break;
          }
        }
      }
    } finally {
      isProcessingQueueRef.current = false;
      
      // Si des éléments restent, programmer un nouveau traitement
      if (saveQueueRef.current.length > 0) {
        console.log('useReliableSave: Items restants dans la queue, programmation nouveau traitement');
        if (processQueueTimeoutRef.current) {
          clearTimeout(processQueueTimeoutRef.current);
        }
        processQueueTimeoutRef.current = setTimeout(processQueue, 2000);
      }
    }
  }, [saveToDatabase, onSuccess, onError]);

  // Sauvegarde principale
  const save = useCallback(async (formData: any, resourceId?: string | null, options: { priority?: 'high' | 'normal' | 'low', immediate?: boolean } = {}) => {
    const { priority = 'normal', immediate = false } = options;
    
    console.log('useReliableSave: Démarrage sauvegarde:', { immediate, priority, resourceId });
    setIsSaving(true);
    setLastSaveStatus('pending');
    
    try {
      // Toujours sauvegarder localement en premier
      saveToLocal(formData, { resourceId, priority });
      
      if (immediate) {
        // Sauvegarde immédiate
        try {
          const result = await saveToDatabase(formData, resourceId);
          setLastSaveStatus('success');
          if (onSuccess) {
            onSuccess(result);
          }
          console.log('useReliableSave: Sauvegarde immédiate réussie');
        } catch (error) {
          console.warn('useReliableSave: Sauvegarde immédiate échouée, ajout à la queue:', error);
          addToSaveQueue(formData, resourceId, 'high');
        }
      } else {
        // Ajouter à la queue
        addToSaveQueue(formData, resourceId, priority);
      }
      
    } catch (error) {
      console.error('useReliableSave: Erreur générale de sauvegarde:', error);
      setLastSaveStatus('error');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [saveToLocal, saveToDatabase, addToSaveQueue, onSuccess, onError]);

  // Sauvegarde manuelle (priorité haute, immédiate)
  const saveManual = useCallback(async (formData: any, resourceId?: string | null) => {
    console.log('useReliableSave: Sauvegarde manuelle déclenchée');
    await save(formData, resourceId, { priority: 'high', immediate: true });
    
    toast({
      title: lastSaveStatus === 'success' ? "Données sauvegardées" : "Sauvegarde en cours",
      description: lastSaveStatus === 'success' 
        ? "Vos données ont été enregistrées avec succès" 
        : "Vos données sont en cours de sauvegarde",
      variant: lastSaveStatus === 'success' ? "default" : "default"
    });
  }, [save, lastSaveStatus, toast]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (processQueueTimeoutRef.current) {
        clearTimeout(processQueueTimeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    saveManual,
    isSaving,
    lastSaveStatus,
    loadFromLocal,
    queueLength: saveQueueRef.current.length
  };
}
