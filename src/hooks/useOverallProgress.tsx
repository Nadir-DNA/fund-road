
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

      // Try to get data from database, fallback to localStorage
      try {
        // Use raw SQL query since function isn't in generated types yet
        const { data, error } = await supabase.rpc('sql', {
          query: `
            SELECT 
              COALESCE(SUM(total_inputs), 0) as total_inputs,
              COALESCE(SUM(filled_inputs), 0) as filled_inputs,
              CASE 
                WHEN SUM(total_inputs) > 0 THEN 
                  ROUND((SUM(filled_inputs)::NUMERIC / SUM(total_inputs)::NUMERIC) * 100, 1)
                ELSE 0
              END as progress_percentage
            FROM user_resource_progress
            WHERE user_id = $1
          `,
          params: [user.id]
        });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          const progressData = data[0];
          setOverallProgress({
            totalInputs: parseInt(progressData.total_inputs) || 0,
            filledInputs: parseInt(progressData.filled_inputs) || 0,
            progressPercentage: parseFloat(progressData.progress_percentage) || 0
          });
        } else {
          // Fallback to localStorage aggregation
          const localProgress = aggregateLocalProgress(user.id);
          setOverallProgress(localProgress);
        }
      } catch (dbError) {
        // Fallback to localStorage
        const localProgress = aggregateLocalProgress(user.id);
        setOverallProgress(localProgress);
      }
    } catch (error) {
      console.error('Overall progress fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregate progress from localStorage as fallback
  const aggregateLocalProgress = (userId: string): OverallProgress => {
    let totalInputs = 0;
    let filledInputs = 0;

    // Scan localStorage for progress entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`progress_${userId}_`)) {
        try {
          const progressData = JSON.parse(localStorage.getItem(key) || '{}');
          totalInputs += progressData.totalInputs || 0;
          filledInputs += progressData.filledInputs || 0;
        } catch (e) {
          console.warn('Error parsing local progress data:', e);
        }
      }
    }

    const progressPercentage = totalInputs > 0 ? Math.round((filledInputs / totalInputs) * 100) : 0;

    return {
      totalInputs,
      filledInputs,
      progressPercentage
    };
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
