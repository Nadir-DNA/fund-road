import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoadmapTimeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(null);
  
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/roadmap\/step\/(\d+)(?:\/([^/]+))?/);
    
    if (match) {
      setCurrentStepId(Number(match[1]));
      setCurrentSubstep(match[2] ? decodeURIComponent(match[2]) : null);
    } else {
      setCurrentStepId(null);
      setCurrentSubstep(null);
    }
  }, [location.pathname]);

  const handleSubstepClick = (stepId: number, substepTitle: string) => {
    navigate(`/roadmap/step/${stepId}/${encodeURIComponent(substepTitle)}`);
  };

  return (
    <aside className="w-64 lg:w-72 bg-card border-r border-border flex flex-col h-[calc(100dvh-68px)] sticky top-[68px]">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Votre parcours</h3>
        <p className="text-xs text-muted-foreground mt-0.5">7 étapes pour lever</p>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {journeySteps.map((step, stepIdx) => {
          const isActive = currentStepId === step.id;
          const isCompleted = stepIdx < (currentStepId ?? 0) - 1;
          
          return (
            <div key={step.id} className="mb-4">
              {/* Step header */}
              <div className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive ? "text-primary bg-primary/10" : "text-foreground/60"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : isActive ? (
                  <Play className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />
                ) : (
                  <Circle className="w-4 h-4 text-foreground/20 flex-shrink-0" />
                )}
                <span className="truncate">{step.id}. {step.title}</span>
              </div>
              
              {/* Substeps */}
              {step.subSteps && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-foreground/5 pl-3">
                  {step.subSteps.map((substep, idx) => {
                    const isSubActive = isActive && currentSubstep === substep.title;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSubstepClick(step.id, substep.title)}
                        className={cn(
                          "block text-left w-full px-2.5 py-1.5 text-xs rounded-md transition-all",
                          isSubActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.02]"
                        )}
                      >
                        {substep.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
