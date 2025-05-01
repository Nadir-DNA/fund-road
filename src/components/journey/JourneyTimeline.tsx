
import { useLocation, useNavigate } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Step } from "@/types/journey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";

export default function JourneyTimeline() {
  const { localSteps, isLoading } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("JourneyTimeline - Current path:", location.pathname);
  
  // Check if current route matches a specific step
  const isStepActive = (stepId: number) => {
    const paths = [
      `/step/${stepId}`, 
      `/roadmap/step/${stepId}`
    ];
    return paths.some(path => location.pathname.startsWith(path));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-8">
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
        />
      ))}
    </div>
  );
}

interface StepCardProps {
  step: Step;
  isSelected: boolean;
  onClick: () => void;
  onSubStepClick: (subStep: any) => void;
}

function StepCard({ step, isSelected, onClick, onSubStepClick }: StepCardProps) {
  const [isOpen, setIsOpen] = useState(isSelected); // Auto-open the currently selected step

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <Card
      data-step-id={step.id}
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all border hover:border-primary",
        isSelected && "border-primary shadow-md"
      )}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            step.isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
          )}>
            {step.isCompleted ? <Check className="h-4 w-4" /> : <span>{step.id}</span>}
          </div>
          <CardTitle className="text-lg">{step.title}</CardTitle>
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
            {step.subSteps.map((subStep) => (
              <li
                key={subStep.title}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubStepClick(subStep);
                }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
              >
                <span className="text-sm">{subStep.title}</span>
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
