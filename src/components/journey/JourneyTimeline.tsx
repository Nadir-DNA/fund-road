
import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function JourneyTimeline() {
  const { localSteps, toggleStepCompletion, toggleSubStepCompletion } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route matches a specific step
  const isStepActive = (stepId: number) => {
    return location.pathname.includes(`/step/${stepId}`);
  };
  
  // Check if current route matches a specific substep
  const isSubStepActive = (stepId: number, subStepTitle: string) => {
    return location.pathname.includes(`/step/${stepId}/${encodeURIComponent(subStepTitle)}`);
  };

  return (
    <div className="mt-4 space-y-1">
      {localSteps.map((step) => {
        const isSelected = isStepActive(step.id);
        
        return (
          <div key={step.id} className="relative">
            {/* Ligne verticale connectant les étapes */}
            {step.id < localSteps.length && (
              <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-gray-700"></div>
            )}
            
            <div className="mb-6">
              {/* En-tête de l'étape avec cercle et titre */}
              <div 
                className={cn(
                  "flex items-start gap-3 cursor-pointer",
                  isSelected && "text-primary"
                )}
                onClick={() => navigate(`/roadmap/step/${step.id}`)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                  step.isCompleted ? "bg-green-900 border-2 border-green-500" : 
                  isSelected ? "bg-primary/20 border-2 border-primary" : "bg-gray-800 border-2 border-gray-600"
                )}>
                  <span className="text-sm">{step.id}</span>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                </div>
              </div>
              
              {/* Sous-étapes */}
              {step.subSteps && step.subSteps.length > 0 && (
                <div className="mt-3 ml-12 space-y-4">
                  {step.subSteps.map((subStep) => {
                    const isSubActive = isSubStepActive(step.id, subStep.title);
                    
                    return (
                      <div 
                        key={subStep.title} 
                        className={cn(
                          "relative border-l-2 border-gray-700 pl-5 pb-4",
                          isSubActive && "border-primary"
                        )}
                      >
                        <div 
                          className={cn(
                            "flex items-center justify-between group cursor-pointer",
                            isSubActive && "text-primary"
                          )}
                          onClick={() => navigate(`/roadmap/step/${step.id}/${encodeURIComponent(subStep.title)}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "absolute -left-[5px] h-2 w-2 rounded-full",
                              isSubActive || subStep.isCompleted ? "bg-primary" : "bg-gray-600"
                            )} />
                            
                            <span>{subStep.title}</span>
                          </div>
                          
                          <ChevronRight className="h-4 w-4 opacity-70 group-hover:text-primary" />
                        </div>
                        
                        {/* Description de la sous-étape */}
                        <p className="text-xs text-gray-400 mt-1">{subStep.description}</p>
                        
                        {/* Outils de la sous-étape */}
                        {subStep.resources && subStep.resources.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {subStep.resources.filter(resource => resource.componentName).map((resource, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge 
                                  variant="outline"
                                  className="text-xs py-0.5 px-2 bg-gray-800 border-gray-700"
                                >
                                  Outil
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 px-2 text-xs hover:bg-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (resource.componentName) {
                                      navigate(`/roadmap/step/${step.id}/${encodeURIComponent(subStep.title)}?resource=${resource.componentName}`);
                                    }
                                  }}
                                >
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {resource.title}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
