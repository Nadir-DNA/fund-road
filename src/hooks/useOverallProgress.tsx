
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OverallProgress {
  totalInputs: number;
  filledInputs: number;
  progressPercentage: number;
}

export const useOverallProgress = () => {
  const [overallProgress, setOverallProgress] = useState<OverallProgress>({
    totalInputs: 0,
    filledInputs: 0,
    progressPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverallProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('get_user_overall_progress', { uid: user.id });

      if (error) {
        console.error('Error fetching overall progress:', error);
        return;
      }

      if (data && data.length > 0) {
        const progressData = data[0];
        setOverallProgress({
          totalInputs: parseInt(progressData.total_inputs) || 0,
          filledInputs: parseInt(progressData.filled_inputs) || 0,
          progressPercentage: parseFloat(progressData.progress_percentage) || 0
        });
      }
    } catch (error) {
      console.error('Overall progress fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverallProgress();
    
    // Refresh progress every 30 seconds
    const interval = setInterval(fetchOverallProgress, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    overallProgress,
    isLoading,
    refreshProgress: fetchOverallProgress
  };
};
