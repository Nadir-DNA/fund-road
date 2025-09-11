
import { Step, JourneyProgress } from "@/types/journey";
import { JourneyProgressRow, SubstepProgressRow } from "@/types/journeyProgress";

// Calculate progress from steps
export const calculateProgress = (steps: Step[]): JourneyProgress => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.isCompleted).length;
  
  let totalSubsteps = 0;
  let completedSubsteps = 0;
  
  steps.forEach(step => {
    if (step.subSteps) {
      totalSubsteps += step.subSteps.length;
      completedSubsteps += step.subSteps.filter(sub => sub.isCompleted).length;
    }
  });
  
  const percentage = Math.round(
    (completedSteps / totalSteps * 0.6 + completedSubsteps / (totalSubsteps || 1) * 0.4) * 100
  );
  
  return {
    completedSteps,
    totalSteps,
    completedSubsteps,
    totalSubsteps,
    percentage
  };
};

// Update steps with progress data from database
export const updateStepsWithProgress = (
  steps: Step[], 
  stepProgress: JourneyProgressRow[] | null, 
  substepProgress: SubstepProgressRow[] | null
): Step[] => {
  return steps.map(step => {
    const stepData = stepProgress?.find(p => p.step_id === step.id);
    const updatedStep = {
      ...step,
      isCompleted: stepData ? stepData.is_completed : step.isCompleted || false,
    };
    
    if (step.subSteps) {
      updatedStep.subSteps = step.subSteps.map(substep => {
        const substepData = substepProgress?.find(
          p => p.step_id === step.id && p.substep_title === substep.title
        );
        
        return {
          ...substep,
          isCompleted: substepData ? substepData.is_completed : substep.isCompleted || false,
        };
      });
    }
    
    return updatedStep;
  });
};
