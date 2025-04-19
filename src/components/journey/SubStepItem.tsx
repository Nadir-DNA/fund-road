
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SubStep } from "@/types/journey";
import { CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface SubStepItemProps {
  subStep: SubStep;
  stepId: number;
  onToggleCompletion: (stepId: number, subStepTitle: string) => void;
  onClick: () => void;
}

export default function SubStepItem({ subStep, stepId, onToggleCompletion, onClick }: SubStepItemProps) {
  const [loadingResource, setLoadingResource] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleResourceClick = (e: React.MouseEvent, resourceComponent: string, resourceTitle: string) => {
    e.stopPropagation();
    setLoadingResource(resourceTitle);
    
    try {
      const url = `/roadmap?step=${stepId}&substep=${encodeURIComponent(subStep.title)}&resource=${encodeURIComponent(resourceComponent)}`;
      
      // Store the current path for potential back navigation
      localStorage.setItem('lastPath', window.location.pathname + window.location.search);
      
      // Navigate to the resource page
      navigate(url);
    } catch (error) {
      console.error("Error navigating to resource:", error);
      setLoadingResource(null);
    }
  };
  
  return (
    <div className="pl-3 border-l border-primary/30">
      <div className="flex gap-2 mb-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="flex-shrink-0 mt-0.5 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompletion(stepId, subStep.title);
                }}
                aria-label={subStep.isCompleted ? "Marquer comme non complété" : "Marquer comme complété"}
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

        <div className="flex-1">
          <button 
            className={cn(
              "font-medium text-sm text-left hover:text-primary transition-colors focus:outline-none w-full flex items-center justify-between",
              subStep.isCompleted && "line-through decoration-primary/70"
            )}
            onClick={onClick}
          >
            <span>{subStep.title}</span>
            <ChevronRight className="h-4 w-4 opacity-70" />
          </button>
          <p className="text-xs text-muted-foreground">{subStep.description}</p>
        </div>
      </div>
      
      {subStep.resources && subStep.resources.length > 0 && (
        <div className="pl-6 mt-2 space-y-1.5">
          {subStep.resources.filter(resource => resource.componentName).map((resource, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge 
                variant={resource.status === 'coming-soon' ? "outline" : "secondary"}
                className={cn(
                  "text-xs py-0.5 px-2", 
                  resource.status === 'coming-soon' && "opacity-70"
                )}
              >
                {resource.status === 'coming-soon' ? 'À venir' : 'Outil'}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  if (resource.componentName) {
                    handleResourceClick(e, resource.componentName, resource.title);
                  } else {
                    onClick();
                  }
                }}
                disabled={resource.status === 'coming-soon' || loadingResource === resource.title}
              >
                {loadingResource === resource.title ? (
                  <LoadingIndicator size="sm" className="mr-1" />
                ) : (
                  <BookOpen className="h-3 w-3 mr-1" />
                )}
                {resource.title}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
