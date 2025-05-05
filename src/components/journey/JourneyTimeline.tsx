
import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { Check, CheckCircle2, CircleDot, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Step, SubStep } from "@/types/journey";

export default function JourneyTimeline() {
  const { localSteps, isLoading, toggleStepCompletion, toggleSubStepCompletion } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement de votre progression...</span>
      </div>
    );
  }

  const handleStepClick = (stepId: number) => {
    navigate(`/step/${stepId}`);
  };

  const handleSubStepClick = (stepId: number, substepTitle: string) => {
    navigate(`/step/${stepId}/${encodeURIComponent(substepTitle)}`);
  };

  const handleResourceClick = (stepId: number, substepTitle: string | null, resourceName: string) => {
    if (substepTitle) {
      navigate(`/step/${stepId}/${encodeURIComponent(substepTitle)}?resource=${resourceName}`);
    } else {
      navigate(`/step/${stepId}?resource=${resourceName}`);
    }
  };

  return (
    <div className="space-y-8">
      {localSteps.map((step, idx) => (
        <div key={step.id} className="relative">
          {/* Vertical timeline connector */}
          {idx < localSteps.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-700"></div>
          )}
          
          <div className="mb-8">
            {/* Step header with checkbox and title */}
            <div className="flex items-start gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="relative flex items-center justify-center mt-1"
                      onClick={() => toggleStepCompletion(step.id)}
                      aria-label={step.isCompleted ? "Marquer comme non-complété" : "Marquer comme complété"}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-gray-600 flex items-center justify-center">
                          <span className="text-sm">{step.id}</span>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {step.isCompleted ? "Marquer comme non-complété" : "Marquer comme complété"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex-1">
                <h3 
                  className={cn(
                    "text-lg font-medium cursor-pointer hover:text-primary",
                    step.isCompleted && "text-primary"
                  )}
                  onClick={() => handleStepClick(step.id)}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                
                {/* Step resources if any */}
                {step.resources && step.resources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.resources.filter(r => r.componentName && r.status !== 'coming-soon').map((resource, idx) => (
                      <Button 
                        key={idx}
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1 bg-slate-800 border-slate-700"
                        onClick={() => handleResourceClick(step.id, null, resource.componentName || '')}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Outil: {resource.title}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Substeps */}
            {step.subSteps && step.subSteps.length > 0 && (
              <div className="mt-4 ml-12 space-y-3">
                {step.subSteps.map((subStep) => (
                  <div 
                    key={subStep.title}
                    className="relative border-l-2 border-gray-700 pl-6 pb-4 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="absolute -left-[5px] mt-2"
                              onClick={() => toggleSubStepCompletion(step.id, subStep.title)}
                              aria-label={subStep.isCompleted ? "Marquer comme non-complété" : "Marquer comme complété"}
                            >
                              {subStep.isCompleted ? (
                                <div className="h-[10px] w-[10px] rounded-full bg-primary" />
                              ) : (
                                <div className="h-[10px] w-[10px] rounded-full border border-gray-500" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {subStep.isCompleted ? "Marquer comme non-complété" : "Marquer comme complété"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="flex-1">
                        <h4 
                          className={cn(
                            "text-base cursor-pointer hover:text-primary",
                            subStep.isCompleted && "text-primary"
                          )}
                          onClick={() => handleSubStepClick(step.id, subStep.title)}
                        >
                          {subStep.title}
                          {subStep.isCompleted && (
                            <Badge className="ml-2 bg-green-900 text-green-100">Complété</Badge>
                          )}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{subStep.description}</p>
                        
                        {/* Substep resources */}
                        {subStep.resources && subStep.resources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {subStep.resources.filter(r => r.componentName && r.status !== 'coming-soon').map((resource, idx) => (
                              <Button 
                                key={idx}
                                size="sm" 
                                variant="outline"
                                className="flex items-center gap-1 text-xs py-1 h-7 bg-slate-800 border-slate-700"
                                onClick={() => handleResourceClick(step.id, subStep.title, resource.componentName || '')}
                              >
                                <BookOpen className="h-3 w-3" />
                                <span>Outil: {resource.title}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
