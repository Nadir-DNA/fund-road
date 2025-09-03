
import { useState, useEffect } from 'react';
import { useGlobalProgressTracker } from './useGlobalProgressTracker';

interface OverallProgress {
  totalInputs: number;
  filledInputs: number;
  progressPercentage: number;
}

export const useOverallProgress = () => {
  const { globalProgress, isLoading, refreshProgress } = useGlobalProgressTracker();
  
  const [overallProgress, setOverallProgress] = useState<OverallProgress>({
    totalInputs: 0,
    filledInputs: 0,
    progressPercentage: 0
  });

  useEffect(() => {
    setOverallProgress({
      totalInputs: globalProgress.totalInputs,
      filledInputs: globalProgress.filledInputs,
      progressPercentage: globalProgress.progressPercentage
    });
  }, [globalProgress]);

  return {
    overallProgress,
    isLoading,
    refreshProgress
  };
};
