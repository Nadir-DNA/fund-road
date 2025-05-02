
import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";

export default function JourneyTimeline() {
  const { localSteps, toggleStepCompletion, toggleSubStepCompletion } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("JourneyTimeline - Current path:", location.pathname);
  
  // Check if current route matches a specific step
  const isStepActive = (stepId: number) => {
    return location.pathname.includes(`/step/${stepId}`);
  };

  return (
    <div className="mt-4 space-y-4">
      {localSteps.map((step) => (
        <StepCard
          key={step.id}
          step={step}
          isSelected={isStepActive(step.id)}
          onClick={() => {
            console.log(`Navigating to step ${step.id}`);
            navigate(`/roadmap/step/${step.id}`);
          }}
          onSubStepClick={(substep) => {
            console.log(`Navigating to substep ${step.id}/${substep.title}`);
            navigate(`/roadmap/step/${step.id}/${encodeURIComponent(substep.title)}`);
          }}
          onToggleStepCompletion={() => toggleStepCompletion(step.id)}
          onToggleSubStepCompletion={(substepTitle) => toggleSubStepCompletion(step.id, substepTitle)}
        />
      ))}
    </div>
  );
}

interface StepCardProps {
  step: any; // Use proper Step type from your types
  isSelected: boolean;
  onClick: () => void;
  onSubStepClick: (subStep: any) => void;
  onToggleStepCompletion: () => void;
  onToggleSubStepCompletion: (substepTitle: string) => void;
}

function StepCard({ step, isSelected, onClick, onSubStepClick, onToggleStepCompletion, onToggleSubStepCompletion }: StepCardProps) {
  const [isOpen, setIsOpen] = useState(isSelected); // Auto-open the currently selected step

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStepCompletion();
  };

  const handleSubStepCheckboxClick = (e: React.MouseEvent, subStep: any) => {
    e.stopPropagation();
    onToggleSubStepCompletion(subStep.title);
  };

  return (
    <Card
      data-step-id={step.id}
      className={cn(
        "transition-all border hover:border-primary",
        isSelected && "border-primary shadow-md"
      )}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            step.isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
          )}>
            {step.isCompleted ? <Check className="h-4 w-4" /> : <span>{step.id}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id={`step-${step.id}`}
              checked={step.isCompleted}
              onClick={handleCheckboxClick}
              className="mr-1"
            />
            <CardTitle className="text-lg cursor-pointer">{step.title}</CardTitle>
          </div>
        </div>
        
        {step.subSteps && step.subSteps.length > 0 && (
          <button
            onClick={handleToggle}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        )}
      </CardHeader>
      
      {isOpen && step.subSteps && step.subSteps.length > 0 && (
        <CardContent className="pt-0 pb-4 px-4 border-t mt-1">
          <ul className="space-y-2">
            {step.subSteps.map((subStep: any) => (
              <li
                key={subStep.title}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Checkbox 
                    id={`substep-${step.id}-${subStep.title}`}
                    checked={subStep.isCompleted}
                    onClick={(e) => handleSubStepCheckboxClick(e, subStep)}
                    className="mr-2"
                  />
                  <span 
                    className="text-sm cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubStepClick(subStep);
                    }}
                  >
                    {subStep.title}
                  </span>
                </div>
                {subStep.isCompleted && (
                  <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">
                    Complété
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

