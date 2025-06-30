
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

      // Use localStorage aggregation as primary method for now
      const localProgress = aggregateLocalProgress(user.id);
      setOverallProgress(localProgress);
      
      // Try to get data from database as secondary source
      try {
        // Since the table exists but isn't in types, we'll try a direct query
        const { data: progressRecords } = await supabase
          .from('user_resource_progress' as any)
          .select('total_inputs, filled_inputs')
          .eq('user_id', user.id);

        if (progressRecords && Array.isArray(progressRecords) && progressRecords.length > 0) {
          const totalInputs = progressRecords.reduce((sum: number, record: any) => sum + (record.total_inputs || 0), 0);
          const filledInputs = progressRecords.reduce((sum: number, record: any) => sum + (record.filled_inputs || 0), 0);
          const progressPercentage = totalInputs > 0 ? Math.round((filledInputs / totalInputs) * 100) : 0;

          setOverallProgress({
            totalInputs,
            filledInputs,
            progressPercentage
          });
        }
      } catch (dbError) {
        // Database query failed, but localStorage aggregation is working
        console.log('Database query failed, using localStorage aggregation:', dbError);
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
