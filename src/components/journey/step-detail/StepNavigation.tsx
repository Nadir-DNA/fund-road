
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { journeySteps } from "@/data/journeySteps";
import { Step } from "@/types/journey";

interface StepNavigationProps {
  step: Step;
  stepId: number;
  substepTitle: string | null;
}

export default function StepNavigation({
  step,
  stepId,
  substepTitle
}: StepNavigationProps) {
  const navigate = useNavigate();

  const navigateToNextStep = () => {
    if (!step) return;
    
    // If we have substeps and we're on one of them
    if (step.subSteps?.length && substepTitle) {
      const currentSubStepIndex = step.subSteps.findIndex(s => s.title === substepTitle);
      if (currentSubStepIndex < step.subSteps.length - 1) {
        // Go to next substep
        navigate(`/step/${stepId}/${encodeURIComponent(step.subSteps[currentSubStepIndex + 1].title)}`);
        return;
      }
    }
    
    // Go to next main step
    const nextStepIndex = journeySteps.findIndex(s => s.id === stepId) + 1;
    if (nextStepIndex < journeySteps.length) {
      navigate(`/step/${journeySteps[nextStepIndex].id}`);
    }
  };
  
  const navigateToPrevStep = () => {
    if (!step) return;
    
    // If we have substeps and we're on one of them
    if (step.subSteps?.length && substepTitle) {
      const currentSubStepIndex = step.subSteps.findIndex(s => s.title === substepTitle);
      if (currentSubStepIndex > 0) {
        // Go to previous substep
        navigate(`/step/${stepId}/${encodeURIComponent(step.subSteps[currentSubStepIndex - 1].title)}`);
        return;
      }
    }
    
    // Go to previous main step
    const prevStepIndex = journeySteps.findIndex(s => s.id === stepId) - 1;
    if (prevStepIndex >= 0) {
      // If the previous step has substeps, go to its last substep
      const prevStep = journeySteps[prevStepIndex];
      if (prevStep.subSteps?.length) {
        navigate(`/step/${prevStep.id}/${encodeURIComponent(prevStep.subSteps[prevStep.subSteps.length - 1].title)}`);
      } else {
        navigate(`/step/${prevStep.id}`);
      }
    } else {
      // Go back to roadmap if we're at the first step
      navigate('/roadmap');
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={navigateToPrevStep}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
      </Button>
      
      <Button 
        onClick={navigateToNextStep}
      >
        Suivant <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
