
import { useState } from 'react';
import { Step, JourneyProgress } from "@/types/journey";
import { useJourneyData } from "./useJourneyData";
import { useProgressActions } from "./useProgressActions";
import { calculateProgress } from "@/utils/journeyUtils";

export const useJourneyProgress = (steps: Step[]) => {
  const [localSteps, setLocalSteps] = useState<Step[]>(steps);
  const [progress, setProgress] = useState<JourneyProgress>({
    completedSteps: 0,
    totalSteps: steps.length,
    completedSubsteps: 0,
    totalSubsteps: 0,
    percentage: 0
  });

  // Get journey data (steps and progress)
  const journeyData = useJourneyData(steps);
  
  // Set local state from fetched data
  if (journeyData.localSteps !== localSteps && !journeyData.isLoading) {
    setLocalSteps(journeyData.localSteps);
    setProgress(journeyData.progress);
  }

  // Get actions to update progress
  const actions = useProgressActions(localSteps, setLocalSteps, setProgress);

  return {
    localSteps,
    progress,
    isLoading: journeyData.isLoading,
    toggleStepCompletion: actions.toggleStepCompletion,
    toggleSubStepCompletion: actions.toggleSubStepCompletion
  };
};
