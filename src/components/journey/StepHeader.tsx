
import { Step } from "@/types/journey";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StepHeaderProps {
  step: Step;
  stepId: number;
  selectedSubStep: any;
  toggleStepCompletion: (stepId: number) => void;
}

export default function StepHeader({ 
  step, 
  stepId,
  selectedSubStep,
  toggleStepCompletion
}: StepHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/roadmap')}
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{step.title}</h1>
          <p className="text-gray-600 mt-2">
            {selectedSubStep ? selectedSubStep.description : step.description}
          </p>
        </div>
        <div className="flex items-center">
          <Checkbox 
            id={`step-complete-${stepId}`}
            checked={step.isCompleted} 
            onCheckedChange={() => toggleStepCompletion(stepId)}
            className="mr-2"
          />
          <label htmlFor={`step-complete-${stepId}`} className="text-sm font-medium">
            Marquer comme complété
          </label>
        </div>
      </div>
    </>
  );
}
