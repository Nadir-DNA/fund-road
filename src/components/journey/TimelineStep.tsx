
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
  // Fonction pour vérifier si une chaîne commence par "index."
  const isTranslationKey = (text: string) => {
    return text && typeof text === 'string' && text.startsWith('index.');
  };

  // Fonction pour obtenir un texte de remplacement si nécessaire
  const getDisplayText = (text: string, fallback: string) => {
    return isTranslationKey(text) ? fallback : text;
  };

  return (
    <div className="relative flex" data-step-id={step.id}>
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
              {getDisplayText(step.title, `Étape ${index + 1}`)}
            </button>
            <p className="text-muted-foreground mb-4">
              {getDisplayText(step.description, `Description de l'étape ${index + 1}`)}
            </p>
            
            {/* Sub-steps */}
            {step.subSteps && (
              <div className="mb-4 space-y-4">
                {step.subSteps.map((subStep, idx) => (
                  <SubStepItem 
                    key={idx} 
                    subStep={{
                      ...subStep,
                      title: getDisplayText(subStep.title, `Sous-étape ${idx + 1}`),
                      description: getDisplayText(subStep.description, `Description de la sous-étape ${idx + 1}`)
                    }}
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
