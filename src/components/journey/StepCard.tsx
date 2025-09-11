
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import SubstepButton from "./SubstepButton";

interface StepCardProps {
  step: Step;
  isSelected: boolean;
  onClick: () => void;
  onSubStepClick: (substep: SubStep) => void;
}

export default function StepCard({ step, isSelected, onClick, onSubStepClick }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(isSelected);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:border-primary/50",
        isSelected && "border-primary/70"
      )}
    >
      <CardHeader 
        className="cursor-pointer py-3" 
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {step.isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            <CardTitle className="text-base md:text-lg">
              {step.id}. {step.title}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpand}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </CardContent>
          
          {step.subSteps && step.subSteps.length > 0 && (
            <CardFooter className="flex flex-col items-stretch pt-0">
              <div className="grid grid-cols-1 gap-2 w-full">
                {step.subSteps.map((substep, index) => (
                  <SubstepButton
                    key={index}
                    substep={substep}
                    onClick={() => onSubStepClick(substep)}
                  />
                ))}
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}
