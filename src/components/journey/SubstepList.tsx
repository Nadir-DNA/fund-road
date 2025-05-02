
import { useNavigate } from "react-router-dom";
import { Step } from "@/types/journey";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface SubstepListProps {
  step: Step;
  stepId: number;
  toggleSubStepCompletion: (stepId: number, subStepTitle: string) => void;
}

export default function SubstepList({ 
  step,
  stepId,
  toggleSubStepCompletion
}: SubstepListProps) {
  const navigate = useNavigate();

  if (!step.subSteps || step.subSteps.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Sous-étapes</h2>
      <div className="space-y-2">
        {step.subSteps.map((subStep) => (
          <Card key={subStep.title} className="p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox 
                  id={`substep-${stepId}-${subStep.title}`}
                  checked={subStep.isCompleted}
                  onCheckedChange={() => toggleSubStepCompletion(stepId, subStep.title)}
                  className="mr-3"
                />
                <div>
                  <label 
                    htmlFor={`substep-${stepId}-${subStep.title}`}
                    className="font-medium cursor-pointer"
                    onClick={() => navigate(`/roadmap/step/${stepId}/${encodeURIComponent(subStep.title)}`)}
                  >
                    {subStep.title}
                  </label>
                  {subStep.description && (
                    <p className="text-sm text-gray-500">{subStep.description}</p>
                  )}
                </div>
              </div>
              {subStep.isCompleted && (
                <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                  Complété
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
