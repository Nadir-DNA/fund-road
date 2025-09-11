
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ChevronLeft } from "lucide-react";

interface StepHeaderProps {
  step: Step;
  stepId: number;
  selectedSubStep: SubStep | null;
  toggleStepCompletion: (stepId: number) => void;
}

export default function StepHeader({ 
  step, 
  stepId, 
  selectedSubStep,
  toggleStepCompletion 
}: StepHeaderProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleToggleCompletion = async () => {
    setIsCompleting(true);
    await toggleStepCompletion(stepId);
    setIsCompleting(false);
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {step.title}
            {selectedSubStep && (
              <span className="text-muted-foreground ml-2">
                &gt; {selectedSubStep.title}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedSubStep ? selectedSubStep.description : step.description}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 flex items-center gap-2"
          onClick={handleToggleCompletion}
          disabled={isCompleting}
        >
          {step.isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Terminé</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" />
              <span>Marquer comme terminé</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
