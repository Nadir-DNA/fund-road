
import { cn } from "@/lib/utils";
import { Step } from "@/types/journey";
import { CheckCircle2, CircleDot } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SubStepItem from "./SubStepItem";
import StepResources from "./StepResources";

interface TimelineStepProps {
  step: Step;
  index: number;
  stepsLength: number;
  onStepClick: (step: Step) => void;
  onSubStepClick: (step: Step, subStep: { title: string, description: string }) => void;
  onToggleStepCompletion: (stepId: number) => void;
  onToggleSubStepCompletion: (stepId: number, subStepTitle: string) => void;
}

export default function TimelineStep({
  step,
  index,
  stepsLength,
  onStepClick,
  onSubStepClick,
  onToggleStepCompletion,
  onToggleSubStepCompletion
}: TimelineStepProps) {
  return (
    <div className="relative flex">
      {/* Timeline connector - Fixed positioning to not overlap with checkboxes */}
      {index < stepsLength - 1 && (
        <div className="absolute top-7 left-3.5 bottom-0 w-0.5 bg-border z-0" />
      )}
      
      {/* Step content */}
      <div className="flex flex-col items-start mb-12 ml-2">
        <div className="flex items-start">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="relative flex items-center justify-center mr-4 focus:outline-none bg-background z-10"
                  onClick={() => onToggleStepCompletion(step.id)}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  ) : step.isActive ? (
                    <CircleDot className="h-7 w-7 text-primary animate-pulse" />
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-muted-foreground/50" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {step.isCompleted ? "Marquer comme non complété" : "Marquer comme complété"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="w-full">
            <button 
              onClick={() => onStepClick(step)}
              className={cn(
                "text-lg font-semibold mb-2 text-left hover:text-primary transition-colors focus:outline-none",
                (step.isActive || step.isCompleted) && "text-primary",
                step.isCompleted && "line-through decoration-primary/70"
              )}
            >
              {step.title}
            </button>
            <p className="text-muted-foreground mb-4">{step.description}</p>
            
            {/* Sub-steps */}
            {step.subSteps && (
              <div className="mb-4 space-y-3 pl-2">
                {step.subSteps.map((subStep, idx) => (
                  <SubStepItem 
                    key={idx} 
                    subStep={subStep} 
                    stepId={step.id}
                    onToggleCompletion={onToggleSubStepCompletion}
                    onClick={() => onSubStepClick(step, subStep)}
                  />
                ))}
              </div>
            )}
            
            <StepResources resources={step.resources} />
          </div>
        </div>
      </div>
    </div>
  );
}
