
import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useEffect, useState } from "react";

export default function RoadmapTimeline() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [currentSubstep, setCurrentSubstep] = useState<string | null>(null);
  
  // Extract current step and substep from URL
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
    <aside className="w-64 bg-slate-800 p-4 space-y-6 overflow-auto">
      <h3 className="text-lg font-medium mb-4">Votre parcours</h3>
      
      {journeySteps.map(step => (
        <div key={step.id} className="space-y-2">
          <p className="text-sm font-medium text-slate-300">{step.id}. {step.title}</p>
          
          {step.subSteps && step.subSteps.map((substep, index) => (
            <button
              key={index}
              onClick={() => handleSubstepClick(step.id, substep.title)}
              className={`block text-left w-full px-3 py-2 text-sm rounded transition-colors ${
                currentStepId === step.id && currentSubstep === substep.title
                  ? "bg-primary/30 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {substep.title}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
