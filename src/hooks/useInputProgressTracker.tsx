
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgressData {
  totalInputs: number;
  filledInputs: number;
  progressPercentage: number;
}

export const useInputProgressTracker = (
  stepId: number,
  substepTitle: string,
  resourceType: string,
  formData: any
) => {
  const [progressData, setProgressData] = useState<ProgressData>({
    totalInputs: 0,
    filledInputs: 0,
    progressPercentage: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Count total inputs in the form data structure
  const countTotalInputs = useCallback((data: any): number => {
    if (!data || typeof data !== 'object') return 0;
    
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_') || key === 'id') continue; // Skip internal fields
      
      if (Array.isArray(value)) {
        // For arrays (like in CapTableEditor), count each object's fields
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            count += Object.keys(item).filter(k => !k.startsWith('_')).length;
          } else {
            count += 1;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        count += countTotalInputs(value);
      } else {
        count += 1;
      }
    }
    return count;
  }, []);

  // Count filled inputs (non-empty values)
  const countFilledInputs = useCallback((data: any): number => {
    if (!data || typeof data !== 'object') return 0;
    
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('_') || key === 'id') continue;
      
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.values(item).forEach(v => {
              if (v && v !== '' && v !== false) count += 1;
            });
          } else if (item && item !== '' && item !== false) {
            count += 1;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        count += countFilledInputs(value);
      } else if (value && value !== '' && value !== false) {
        count += 1;
      }
    }
    return count;
  }, []);

  // Update progress - store in localStorage as fallback since table isn't in types yet
  const updateProgress = useCallback(async (totalInputs: number, filledInputs: number) => {
    try {
      setIsUpdating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store in localStorage as primary method for now
      const progressKey = `progress_${user.id}_${stepId}_${substepTitle}_${resourceType}`;
      const progressData = {
        totalInputs,
        filledInputs,
        stepId,
        substepTitle,
        resourceType,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(progressKey, JSON.stringify(progressData));
      
      // Try to store in database, but don't fail if it doesn't work
      try {
        // Since the table exists but isn't in types, we'll try a direct insert
        // This might fail gracefully
        await supabase
          .from('user_resource_progress' as any)
          .upsert({
            user_id: user.id,
            step_id: stepId,
            substep_title: substepTitle,
            resource_type: resourceType,
            total_inputs: totalInputs,
            filled_inputs: filledInputs,
            updated_at: new Date().toISOString()
          });
      } catch (dbError) {
        // Database update failed, but localStorage backup is working
        console.log('Database update failed, using localStorage fallback:', dbError);
      }
    } catch (error) {
      console.error('Progress update error:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [stepId, substepTitle, resourceType]);

  // Calculate and update progress when form data changes
  useEffect(() => {
    if (!formData) return;

    const totalInputs = countTotalInputs(formData);
    const filledInputs = countFilledInputs(formData);
    const progressPercentage = totalInputs > 0 ? Math.round((filledInputs / totalInputs) * 100) : 0;

    const newProgressData = {
      totalInputs,
      filledInputs,
      progressPercentage
    };

    setProgressData(newProgressData);

    // Debounce the database update
    const timeoutId = setTimeout(() => {
      updateProgress(totalInputs, filledInputs);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, countTotalInputs, countFilledInputs, updateProgress]);

  return {
    progressData,
    isUpdating
  };
};
