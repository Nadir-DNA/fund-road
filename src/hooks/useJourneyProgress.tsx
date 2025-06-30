
import { useState, useEffect } from 'react';
import { Step, JourneyProgress } from "@/types/journey";
import { useOverallProgress } from "./useOverallProgress";

export const useJourneyProgress = (steps: Step[]) => {
  const [localSteps, setLocalSteps] = useState<Step[]>(steps);
  const { overallProgress, isLoading } = useOverallProgress();
  
  // Create progress object based on input progress instead of step completion
  const [progress, setProgress] = useState<JourneyProgress>({
    completedSteps: 0,
    totalSteps: steps.length,
    completedSubsteps: 0,
    totalSubsteps: 0,
    percentage: 0
  });

  // Update progress when overall progress changes
  useEffect(() => {
    if (!isLoading) {
      const newProgress: JourneyProgress = {
        completedSteps: Math.ceil((overallProgress.progressPercentage / 100) * steps.length),
        totalSteps: steps.length,
        completedSubsteps: overallProgress.filledInputs,
        totalSubsteps: overallProgress.totalInputs,
        percentage: overallProgress.progressPercentage
      };
      setProgress(newProgress);
    }
  }, [overallProgress, isLoading, steps.length]);

  // Dummy functions for backward compatibility (not used in new system)
  const toggleStepCompletion = (stepId: number) => {
    console.log('Step completion toggling is now handled by input progress');
  };

  const toggleSubStepCompletion = (stepId: number, subStepTitle: string) => {
    console.log('SubStep completion toggling is now handled by input progress');
  };

  return {
    localSteps,
    progress,
    isLoading,
    toggleStepCompletion,
    toggleSubStepCompletion
  };
};
