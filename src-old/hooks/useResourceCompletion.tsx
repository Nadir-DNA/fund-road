import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseResourceCompletionProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  formData: any;
  onDownload?: () => void;
}

export const useResourceCompletion = ({
  stepId,
  substepTitle,
  resourceType,
  formData,
  onDownload
}: UseResourceCompletionProps) => {
  const { toast } = useToast();

  const checkCompletion = useCallback(() => {
    if (!formData) return false;
    
    // Calculate completion percentage based on filled fields
    const values = Object.values(formData);
    const totalFields = values.length;
    const filledFields = values.filter(value => 
      value && String(value).trim() !== ""
    ).length;
    
    return totalFields > 0 && filledFields === totalFields;
  }, [formData]);

  const saveProgress = useCallback(async () => {
    if (!formData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_resources')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          substep_title: substepTitle,
          resource_type: resourceType,
          content: formData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_id,substep_title,resource_type'
        });

      if (error) {
        console.error('Error saving resource progress:', error);
      }
    } catch (error) {
      console.error('Error in saveProgress:', error);
    }
  }, [formData, stepId, substepTitle, resourceType]);

  useEffect(() => {
    if (checkCompletion()) {
      saveProgress();
      
      // Show completion toast with download option
      toast({
        title: "Ressource complétée !",
        description: "Vous pouvez maintenant télécharger votre travail.",
        action: onDownload ? (
          <button 
            onClick={onDownload}
            className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm"
          >
            Télécharger
          </button>
        ) : undefined,
        duration: 5000
      });
    }
  }, [checkCompletion, saveProgress, toast, onDownload]);

  return {
    isCompleted: checkCompletion(),
    saveProgress
  };
};