
import { cn } from "@/lib/utils";
import { SubStep } from "@/types/journey";
import { CheckCircle2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SubStepItemProps {
  subStep: SubStep;
  stepId: number;
  onToggleCompletion: (stepId: number, subStepTitle: string) => void;
  onClick: () => void;
}

export default function SubStepItem({ subStep, stepId, onToggleCompletion, onClick }: SubStepItemProps) {
  return (
    <div className="pl-3 border-l border-primary/30 flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="flex-shrink-0 mt-0.5 focus:outline-none"
              onClick={() => onToggleCompletion(stepId, subStep.title)}
            >
              {subStep.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-muted-foreground/50" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {subStep.isCompleted ? "Marquer comme non complété" : "Marquer comme complété"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div>
        <button 
          className={cn(
            "font-medium text-sm text-left hover:text-primary transition-colors focus:outline-none",
            subStep.isCompleted && "line-through decoration-primary/70"
          )}
          onClick={onClick}
        >
          {subStep.title}
        </button>
        <p className="text-xs text-muted-foreground">{subStep.description}</p>
      </div>
    </div>
  );
}
