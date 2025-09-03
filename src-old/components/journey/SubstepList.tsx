
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubstepListProps {
  step: Step;
  stepId: number;
  toggleSubStepCompletion: (stepId: number, substepTitle: string) => void;
}

export default function SubstepList({ 
  step, 
  stepId, 
  toggleSubStepCompletion 
}: SubstepListProps) {
  const [completingSubstep, setCompletingSubstep] = useState<string | null>(null);
  const navigate = useNavigate();

  // Skip if no substeps
  if (!step.subSteps || step.subSteps.length === 0) {
    return null;
  }
  
  const handleToggleSubstepCompletion = async (substep: SubStep) => {
    setCompletingSubstep(substep.title);
    await toggleSubStepCompletion(stepId, substep.title);
    setCompletingSubstep(null);
  };
  
  const handleNavigateToSubstep = (substep: SubStep) => {
    navigate(`/roadmap/step/${stepId}/${encodeURIComponent(substep.title)}`);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Sous-étapes</h3>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {step.subSteps.map((substep, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleNavigateToSubstep(substep)}
            >
              <div className="font-medium">{substep.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">
                {substep.description}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 flex-shrink-0"
              onClick={() => handleToggleSubstepCompletion(substep)}
              disabled={completingSubstep === substep.title}
            >
              {substep.isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
