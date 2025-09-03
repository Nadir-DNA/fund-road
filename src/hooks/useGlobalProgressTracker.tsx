
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GlobalProgressData {
  totalInputs: number;
  filledInputs: number;
  progressPercentage: number;
  detailsByStep: Record<number, {
    totalInputs: number;
    filledInputs: number;
    progressPercentage: number;
  }>;
}

export const useGlobalProgressTracker = () => {
  const [globalProgress, setGlobalProgress] = useState<GlobalProgressData>({
    totalInputs: 0,
    filledInputs: 0,
    progressPercentage: 0,
    detailsByStep: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const calculateGlobalProgress = useCallback(async () => {
    try {
      console.log('Calculating global progress...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user, setting default progress');
        setGlobalProgress({
          totalInputs: 0,
          filledInputs: 0,
          progressPercentage: 0,
          detailsByStep: {}
        });
        setIsLoading(false);
        return;
      }

      // Récupérer toutes les ressources utilisateur
      const { data: userResources, error } = await supabase
        .from('user_resources')
        .select('step_id, content, resource_type')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user resources:', error);
        return;
      }

      console.log('User resources found:', userResources?.length || 0);

      let totalGlobalInputs = 0;
      let filledGlobalInputs = 0;
      const detailsByStep: Record<number, any> = {};

      // Pour chaque ressource, compter les champs
      userResources?.forEach(resource => {
        const { step_id, content } = resource;
        
        // Compter les inputs dans cette ressource
        const { totalInputs, filledInputs } = countInputsInContent(content);
        
        totalGlobalInputs += totalInputs;
        filledGlobalInputs += filledInputs;

        // Agrégation par étape
        if (!detailsByStep[step_id]) {
          detailsByStep[step_id] = {
            totalInputs: 0,
            filledInputs: 0,
            progressPercentage: 0
          };
        }
        
        detailsByStep[step_id].totalInputs += totalInputs;
        detailsByStep[step_id].filledInputs += filledInputs;
      });

      // Calculer les pourcentages par étape
      Object.keys(detailsByStep).forEach(stepId => {
        const step = detailsByStep[parseInt(stepId)];
        step.progressPercentage = step.totalInputs > 0 
          ? Math.round((step.filledInputs / step.totalInputs) * 100) 
          : 0;
      });

      const globalProgressPercentage = totalGlobalInputs > 0 
        ? Math.round((filledGlobalInputs / totalGlobalInputs) * 100) 
        : 0;

      const newGlobalProgress = {
        totalInputs: totalGlobalInputs,
        filledInputs: filledGlobalInputs,
        progressPercentage: globalProgressPercentage,
        detailsByStep
      };

      console.log('Calculated global progress:', newGlobalProgress);
      setGlobalProgress(newGlobalProgress);

    } catch (error) {
      console.error('Error calculating global progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction utilitaire pour compter les inputs dans le contenu JSON
  const countInputsInContent = (content: any): { totalInputs: number; filledInputs: number } => {
    if (!content || typeof content !== 'object') return { totalInputs: 0, filledInputs: 0 };
    
    let totalInputs = 0;
    let filledInputs = 0;

    const countFields = (obj: any) => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('_') || key === 'id') continue;
        
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              Object.values(item).forEach(v => {
                totalInputs++;
                if (v && v !== '' && v !== false) filledInputs++;
              });
            } else {
              totalInputs++;
              if (item && item !== '' && item !== false) filledInputs++;
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          countFields(value);
        } else {
          totalInputs++;
          if (value && value !== '' && value !== false) filledInputs++;
        }
      }
    };

    countFields(content);
    return { totalInputs, filledInputs };
  };

  useEffect(() => {
    calculateGlobalProgress();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(calculateGlobalProgress, 30000);
    
    return () => clearInterval(interval);
  }, [calculateGlobalProgress]);

  return {
    globalProgress,
    isLoading,
    refreshProgress: calculateGlobalProgress
  };
};
